from collections import defaultdict, deque
from time import time
from time import perf_counter
import logging
import uuid
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import json
import hashlib
import re

from llm_engine import LLMEngine
from query_executor import QueryExecutor
from chart_selector import ChartSelector
from data_loader import DataSchemaProvider
from config import (
    MAX_ROWS_RETURNED,
    CACHE_ENABLED,
    CACHE_MAX_ENTRIES,
    RATE_LIMIT_REQUESTS_PER_MINUTE,
    ENABLE_DETAILED_ERRORS,
    ALLOWED_ORIGINS,
    ENABLE_API_KEY_AUTH,
    API_KEY_HEADER_NAME,
    API_KEYS,
    ENABLE_REQUEST_LOGGING,
)

# Initialize FastAPI app
app = FastAPI(
    title="Conversational BI Dashboard API",
    description="Convert natural language prompts to interactive dashboards",
    version="0.1.0"
)

logger = logging.getLogger("bi_api")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

AUTH_ACTIVE = ENABLE_API_KEY_AUTH and bool(API_KEYS)
if ENABLE_API_KEY_AUTH and not API_KEYS:
    logger.warning("ENABLE_API_KEY_AUTH is true but API_KEYS is empty; auth checks are disabled.")

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_policy_middleware(request: Request, call_next):
    """Apply centralized auth and observability controls for all endpoints."""
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    start = perf_counter()
    path = request.url.path
    method = request.method

    # Keep health and docs endpoints open for operations/testing.
    is_public_path = path in {"/health", "/docs", "/openapi.json", "/redoc"}

    if AUTH_ACTIVE and not is_public_path:
        provided_key = (request.headers.get(API_KEY_HEADER_NAME) or "").strip()
        if not provided_key or provided_key not in API_KEYS:
            elapsed_ms = int((perf_counter() - start) * 1000)
            if ENABLE_REQUEST_LOGGING:
                logger.warning(
                    "unauthorized_request request_id=%s method=%s path=%s duration_ms=%s",
                    request_id,
                    method,
                    path,
                    elapsed_ms,
                )
            return JSONResponse(
                status_code=401,
                content={"error": "Unauthorized"},
                headers={"x-request-id": request_id},
            )

    response = await call_next(request)
    response.headers["x-request-id"] = request_id

    if ENABLE_REQUEST_LOGGING:
        elapsed_ms = int((perf_counter() - start) * 1000)
        logger.info(
            "request_complete request_id=%s method=%s path=%s status_code=%s duration_ms=%s",
            request_id,
            method,
            path,
            response.status_code,
            elapsed_ms,
        )

    return response

# Initialize components
llm_engine = None
query_executor = None
chart_selector = ChartSelector()
schema_provider = DataSchemaProvider()
prompt_cache: Dict[str, Dict[str, Any]] = {}
conversation_state: Dict[str, Dict[str, Any]] = {}
request_tracker: Dict[str, deque] = defaultdict(deque)


def _cache_key(prompt: str, max_rows: int) -> str:
    key_text = f"{prompt.strip().lower()}::{max_rows}"
    return hashlib.sha256(key_text.encode("utf-8")).hexdigest()

def init_engines():
    """Initialize LLM and query engines."""
    global llm_engine, query_executor
    try:
        llm_engine = LLMEngine()
        query_executor = QueryExecutor()
        print("✓ LLM Engine and Query Executor initialized")
    except Exception as e:
        print(f"✗ Failed to initialize engines: {e}")
        raise

# Pydantic models for request/response
class DashboardRequest(BaseModel):
    prompt: str
    max_rows: int = Field(default=1000, ge=1, le=MAX_ROWS_RETURNED)

class DashboardResponse(BaseModel):
    success: bool
    data: Optional[list] = None
    chart_type: Optional[str] = None
    chart_config: Optional[Dict[str, Any]] = None
    title: Optional[str] = None
    insights: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SchemaResponse(BaseModel):
    columns: list
    row_count: int
    description: str


class UploadCSVResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    row_count: Optional[int] = None
    columns: Optional[list] = None
    message: Optional[str] = None
    error: Optional[str] = None


def _sanitize_error(error_message: str) -> str:
    """Avoid leaking implementation details in production responses."""
    if ENABLE_DETAILED_ERRORS:
        return error_message
    return "Request failed. Please revise the prompt and try again."


def _trim_cache_if_needed() -> None:
    """Bound in-memory cache growth for long-running service instances."""
    if len(prompt_cache) <= CACHE_MAX_ENTRIES:
        return
    # Remove oldest inserted entry first (dict is insertion-ordered in modern Python).
    oldest_key = next(iter(prompt_cache), None)
    if oldest_key:
        prompt_cache.pop(oldest_key, None)


def _enforce_rate_limit(client_key: str) -> None:
    """Simple fixed-window request limiting per client key."""
    if RATE_LIMIT_REQUESTS_PER_MINUTE <= 0:
        return

    now = time()
    window_start = now - 60
    history = request_tracker[client_key]

    while history and history[0] < window_start:
        history.popleft()

    if len(history) >= RATE_LIMIT_REQUESTS_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    history.append(now)


def _get_client_key(http_request: Request) -> str:
    forwarded_for = http_request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return http_request.client.host if http_request.client else "unknown"


def _get_session_key(http_request: Request, client_key: str) -> str:
    custom_session = (http_request.headers.get("x-session-id") or "").strip()
    if custom_session:
        return custom_session
    return f"client:{client_key}"


def _process_dashboard_request(request: DashboardRequest, session_key: str) -> DashboardResponse:
    if not llm_engine or not query_executor:
        raise HTTPException(status_code=500, detail="Engines not initialized")

    if not request.prompt or len(request.prompt.strip()) == 0:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    key = _cache_key(request.prompt, request.max_rows)
    cached_response = prompt_cache.get(key) if CACHE_ENABLED else None
    if cached_response:
        cached_copy = dict(cached_response)
        metadata = dict(cached_copy.get("metadata") or {})
        metadata["cache_hit"] = True
        cached_copy["metadata"] = metadata
        return DashboardResponse(**cached_copy)

    # Step 1: Use LLM to generate query and chart recommendation
    llm_result = llm_engine.generate_query_and_chart(request.prompt)

    if llm_result.get("error"):
        llm_message = llm_result.get("message", "LLM processing failed")
        timeout_detected = bool(re.search(r"timed out|timeout", llm_message, flags=re.IGNORECASE))
        unavailable_detected = "No compatible Ollama model found locally" in llm_message

        if timeout_detected:
            raise HTTPException(
                status_code=504,
                detail=(
                    "AI model timed out while generating your dashboard. "
                    "Try a shorter prompt, or increase OLLAMA_REQUEST_TIMEOUT in backend/.env."
                ),
            )

        if unavailable_detected:
            raise HTTPException(
                status_code=503,
                detail=(
                    "No compatible Ollama model is available locally. "
                    "Run: ollama pull qwen2.5-coder:7b or ollama pull phi3:mini"
                ),
            )

        raise HTTPException(status_code=502, detail=_sanitize_error(llm_message))

    # Step 2: Extract pandas code and execute query
    pandas_code = llm_result.get("pandas_code")
    if not pandas_code:
        return DashboardResponse(
            success=False,
            error="LLM did not generate valid pandas code"
        )

    query_result = query_executor.execute_query(pandas_code, max_rows=request.max_rows)

    if not query_result.get("success"):
        return DashboardResponse(
            success=False,
            error=_sanitize_error(query_result.get("error", "Query execution failed"))
        )

    # Step 3: Validate query result against chart type
    raw_chart_type = llm_result.get("chart_type", "table")
    data = query_result.get("data", [])
    chart_type = chart_selector.recommend_chart_type(raw_chart_type, data)
    is_valid, warning = query_executor.validate_query_result(query_result, chart_type)

    if not is_valid:
        return DashboardResponse(
            success=False,
            error=warning
        )

    # Step 4: Optimize data for chart readability
    data, viz_notes = chart_selector.optimize_for_readability(chart_type, data)

    # Step 5: Generate chart configuration
    chart_config = chart_selector.generate_recharts_config(
        chart_type=chart_type,
        data=data,
        title=llm_result.get("chart_title", request.prompt[:50])
    )

    # Step 6: Generate insights
    insights = f"""
Query executed successfully.
- Rows returned: {len(data)}
- Chart type: {chart_type}
- {llm_result.get('reasoning', 'Chart selected based on data analysis')}
""".strip()

    if warning:
        insights += f"\n- {warning}"
    for note in viz_notes:
        insights += f"\n- {note}"

    response_payload = {
        "success": True,
        "data": data,
        "chart_type": chart_type,
        "chart_config": chart_config,
        "title": llm_result.get("chart_title"),
        "insights": insights,
        "metadata": {
            "row_count": len(data),
            "columns": query_result.get("columns"),
            "truncated": query_result.get("truncated", False),
            "query_explanation": llm_result.get("explanation"),
            "reasoning": llm_result.get("reasoning"),
            "executed_pandas_code": pandas_code,
            "requested_chart_type": raw_chart_type,
            "final_chart_type": chart_type,
            "cache_hit": query_result.get("cache_hit", False),
            "visualization_notes": viz_notes,
        }
    }

    # Cache response for repeated prompts.
    if CACHE_ENABLED:
        prompt_cache[key] = dict(response_payload)
        _trim_cache_if_needed()

    # Store context for follow-up refinements per session.
    conversation_state[session_key] = {
        "last_prompt": request.prompt,
        "last_pandas_code": pandas_code,
        "last_chart_type": chart_type,
        "last_result_columns": query_result.get("columns"),
    }

    return DashboardResponse(**response_payload)

# Routes

# Initialize on app startup
try:
    init_engines()
except Exception as e:
    print(f"Warning: Could not initialize engines: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "Conversational BI Dashboard API"}

@app.get("/schema")
async def get_schema() -> SchemaResponse:
    """Get dataset schema information."""
    try:
        schema = schema_provider.get_schema_json()
        return SchemaResponse(
            columns=schema["column_names"],
            row_count=schema["row_count"],
            description=schema_provider.get_schema_summary()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)) -> UploadCSVResponse:
    """Upload a CSV file from frontend and make it the active dataset."""
    global query_executor

    try:
        filename = (file.filename or "").strip()
        if not filename.lower().endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only .csv files are supported")

        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        schema_provider.load_uploaded_csv(file_bytes)

        if query_executor is None:
            query_executor = QueryExecutor()
        else:
            query_executor.refresh_data()

        # Reset state tied to previous dataset to avoid stale results.
        prompt_cache.clear()
        conversation_state.clear()

        schema = schema_provider.get_schema_json()
        return UploadCSVResponse(
            success=True,
            filename=filename,
            row_count=schema.get("row_count"),
            columns=schema.get("column_names"),
            message="CSV uploaded successfully and dataset refreshed",
        )
    except HTTPException:
        raise
    except Exception as e:
        # Return an explicit client-facing upload error instead of a generic dashboard error.
        detail = _sanitize_error(str(e))
        if not ENABLE_DETAILED_ERRORS:
            detail = (
                "CSV upload failed. Ensure the file is a valid CSV with a header row, "
                "at least 2 columns, and at least 1 data row."
            )
        raise HTTPException(status_code=400, detail=detail)

@app.post("/generate-dashboard")
async def generate_dashboard(request: DashboardRequest, http_request: Request) -> DashboardResponse:
    """
    Main endpoint: Convert natural language prompt to dashboard.
    
    Args:
        prompt: Natural language query (e.g., "Show me average online spend by age group")
        max_rows: Maximum rows to return (default 1000)
    
    Returns:
        Dashboard data with chart configuration
    """
    try:
        client_key = _get_client_key(http_request)
        _enforce_rate_limit(client_key)
        session_key = _get_session_key(http_request, client_key)
        return _process_dashboard_request(request, session_key)
    
    except HTTPException:
        raise
    except Exception as e:
        return DashboardResponse(
            success=False,
            error=_sanitize_error(f"Unexpected error: {str(e)}")
        )

@app.post("/refine-dashboard")
async def refine_dashboard(request: DashboardRequest, http_request: Request):
    """
    Follow-up endpoint for filtering/modifying existing results.
    
    This is a bonus feature for iterating on dashboards.
    """
    client_key = _get_client_key(http_request)
    _enforce_rate_limit(client_key)
    session_key = _get_session_key(http_request, client_key)
    session_context = conversation_state.get(session_key) or {}

    if not session_context.get("last_pandas_code"):
        return DashboardResponse(
            success=False,
            error="No prior dashboard context found. Run /generate-dashboard first."
        )

    contextual_prompt = f"""
Previous user prompt: {session_context.get('last_prompt')}
Previous pandas code: {session_context.get('last_pandas_code')}
Previous chart type: {session_context.get('last_chart_type')}
Previous result columns: {session_context.get('last_result_columns')}

Follow-up instruction: {request.prompt}

Task: Update the previous analysis based on the follow-up instruction. Return only updated JSON response format with pandas_code.
""".strip()

    return _process_dashboard_request(
        DashboardRequest(prompt=contextual_prompt, max_rows=request.max_rows),
        session_key,
    )

@app.get("/test-query")
async def test_query(prompt: str = "Show me average online spend by age group"):
    """Test endpoint for quick testing."""
    return _process_dashboard_request(DashboardRequest(prompt=prompt), session_key="test-query")

# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return {"error": _sanitize_error(str(exc))}

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {"error": "Internal server error"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Conversational BI Dashboard API...")
    # Using "main:app" string for reload compatibility
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
