import warnings
import requests
import json
import re
from typing import Dict, Any, List

# Suppress deprecation warnings
warnings.filterwarnings('ignore', category=FutureWarning)

from data_loader import DataSchemaProvider

class LLMEngine:
    """Wrapper for Ollama local LLM API (no quotas, free!)"""
    
    def __init__(self):
        # Ollama runs on localhost:11434 by default
        self.api_url = "http://localhost:11434/api/generate"
        self.model = "qwen2.5-coder:7b"
        self.fallback_models = ["qwen2.5-coder:3b", "mistral", "phi3:mini"]
        self.schema_provider = DataSchemaProvider()
        self.request_timeout = 120
        self.allowed_chart_types = {"bar", "line", "pie", "scatter", "table", "area"}
        
        # Test connection
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                print("✓ Ollama connected on localhost:11434")
                available = self._get_available_models()
                if self.model not in available:
                    print(f"⚠ Preferred model '{self.model}' not found locally.")
                    if available:
                        print(f"  Available models: {', '.join(available)}")
                    print(f"  Run: ollama pull {self.model}")
            else:
                print("⚠ Warning: Could not connect to Ollama. Make sure Ollama is running!")
        except requests.exceptions.ConnectionError:
            print("⚠ Warning: Ollama not running on localhost:11434")
            print("  Start Ollama from the system tray or run: ollama serve")
            print("  Then run: ollama pull qwen2.5-coder:7b")

    def _get_available_models(self) -> List[str]:
        """Return model names available in local Ollama runtime."""
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=3)
            if response.status_code != 200:
                return []
            data = response.json()
            models = data.get("models", [])
            return [m.get("name", "") for m in models if m.get("name")]
        except Exception:
            return []

    def _resolve_candidate_models(self) -> List[str]:
        """Resolve preferred/fallback models against installed local model tags."""
        available = self._get_available_models()
        if not available:
            return []

        requested = [self.model] + self.fallback_models
        resolved: List[str] = []

        # Exact tag match first.
        for req in requested:
            if req in available and req not in resolved:
                resolved.append(req)

        # Then allow base-name match, e.g. `mistral` -> `mistral:latest`.
        for req in requested:
            base = req.split(":")[0]
            for installed in available:
                if installed.split(":")[0] == base and installed not in resolved:
                    resolved.append(installed)

        return resolved

    def _build_schema_context(self) -> str:
        """Keep schema context compact to reduce generation latency."""
        columns = self.schema_provider.get_column_names()
        row_count = len(self.schema_provider.get_dataframe())
        return (
            "## Dataset Schema\n"
            f"Rows: {row_count}\n"
            f"Columns ({len(columns)}): {', '.join(columns)}\n"
        )

    def _extract_json_payload(self, response_text: str) -> str:
        """Extract the most likely JSON object from raw model output."""
        text = response_text.strip()

        if "```json" in text:
            text = text.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in text:
            text = text.split("```", 1)[1].split("```", 1)[0].strip()

        if text.startswith("{") and text.endswith("}"):
            return text

        # Fallback: grab first top-level object-ish slice.
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start:end + 1]

        # Regex fallback for unusually noisy outputs.
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if match:
            return match.group(0)

        return text

    def _validate_llm_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Validate response structure before returning payload to execution layer."""
        if payload.get("error"):
            message = payload.get("message") or "LLM could not interpret the request"
            return {"error": True, "message": str(message)}

        pandas_code = payload.get("pandas_code")
        if not isinstance(pandas_code, str) or not pandas_code.strip():
            return {
                "error": True,
                "message": "LLM response missing valid pandas_code"
            }

        chart_type = str(payload.get("chart_type", "table")).lower()
        if chart_type not in self.allowed_chart_types:
            chart_type = "table"

        return {
            "query_type": "pandas",
            "pandas_code": pandas_code.strip(),
            "explanation": str(payload.get("explanation", "")),
            "chart_type": chart_type,
            "chart_title": str(payload.get("chart_title", "Generated Insight")),
            "reasoning": str(payload.get("reasoning", "")),
        }
    
    def _get_system_prompt(self) -> str:
        """Build system prompt with schema context."""
        schema_summary = self._build_schema_context()
        
        system_prompt = f"""You are an expert Business Intelligence assistant. Your role is to help non-technical users generate data queries and dashboards using natural language.

{schema_summary}

## Your Mission:
1. Understand the user's business question
2. Generate a Python pandas query that retrieves and transforms the data
3. Recommend the most appropriate chart type for visualization

## Important Rules:
- ONLY reference columns that exist in the schema above
- Generate pandas code that is valid and executable
- Be explicit about column names and operations
- If a question is ambiguous, ask for clarification rather than guessing
- Never invent or hallucinate data or columns

## Output Format:
When responding to a user query, provide your response in this exact JSON format:
{{
    "query_type": "pandas",
    "pandas_code": "df.groupby('column_name')['numeric_col'].mean()",
    "explanation": "Brief explanation of what the query does",
    "chart_type": "bar|line|pie|scatter|table",
    "chart_title": "Suggested chart title",
    "reasoning": "Why this chart type is appropriate"
}}

If you don't have enough information or the request is ambiguous, respond with:
{{
    "error": true,
    "message": "Clear explanation of what's missing or ambiguous"
}}

Important:
- Return ONLY raw JSON.
- Do not include markdown code fences.
- Do not include comments in JSON.
"""
        return system_prompt
    
    def generate_query_and_chart(self, user_prompt: str) -> Dict[str, Any]:
        """
        Convert natural language prompt to query + chart recommendation.
        
        Args:
            user_prompt: Natural language query from user
            
        Returns:
            Dict with query_type, pandas_code, chart_type, and metadata
        """
        try:
            system_prompt = self._get_system_prompt()
            
            # Build the full message
            full_message = f"""{system_prompt}

## User Query:
{user_prompt}

Please provide your response in the JSON format specified above.
"""
            
            # Try preferred model first, then lighter installed fallbacks.
            candidate_models = self._resolve_candidate_models()
            if not candidate_models:
                return {
                    "error": True,
                    "message": (
                        "No compatible Ollama model found locally. "
                        "Install one of: qwen2.5-coder:7b, qwen2.5-coder:3b, mistral, phi3:mini"
                    )
                }
            response = None
            last_error = ""

            for model_name in candidate_models:
                try:
                    response = requests.post(
                        self.api_url,
                        json={
                            "model": model_name,
                            "prompt": full_message,
                            "stream": False,
                            "keep_alive": "10m",
                            "options": {
                                "temperature": 0.15,
                                "top_p": 0.9,
                                "num_predict": 280,
                                "num_ctx": 2048
                            }
                        },
                        timeout=self.request_timeout
                    )
                    if response.status_code == 200:
                        break
                    last_error = f"{model_name}: {response.status_code} - {response.text}"
                except requests.exceptions.ReadTimeout:
                    last_error = f"{model_name}: timed out after {self.request_timeout}s"
                    continue
                except requests.exceptions.RequestException as ex:
                    last_error = f"{model_name}: {str(ex)}"
                    continue

            if response is None or response.status_code != 200:
                return {
                    "error": True,
                    "message": f"Ollama API error after trying fallback models. Last error: {last_error}"
                }
            
            # Extract response text
            response_data = response.json()
            response_text = response_data.get("response", "")
            
            # Try to extract JSON from response
            try:
                json_str = self._extract_json_payload(response_text)
                result = json.loads(json_str)
                return self._validate_llm_payload(result)
            except json.JSONDecodeError:
                return {
                    "error": True,
                    "message": "Failed to parse LLM response as JSON",
                    "raw_response": response_text
                }
        
        except Exception as e:
            return {
                "error": True,
                "message": f"LLM API error: {str(e)}"
            }
    
    def generate_few_shot_examples(self) -> str:
        """Generate few-shot examples for better prompt engineering."""
        examples = """
## Examples:

### Example 1: Simple Aggregation
User: "Show me total online spend by age group"
Response: {
    "query_type": "pandas",
    "pandas_code": "df.groupby('age')['avg_online_spend'].sum().reset_index()",
    "explanation": "Groups customers by age and sums their online spending",
    "chart_type": "bar",
    "chart_title": "Total Online Spend by Age",
    "reasoning": "Bar chart is ideal for categorical (age) vs numeric (spend) comparison"
}

### Example 2: Filtering and Ranking
User: "Top 5 customers by total spending"
Response: {
    "query_type": "pandas",
    "pandas_code": "df['total_spend'] = df['avg_online_spend'] + df['avg_store_spend']; df.nlargest(5, 'total_spend')[['age', 'monthly_income', 'total_spend']]",
    "explanation": "Creates total spend column and returns top 5 spenders",
    "chart_type": "table",
    "chart_title": "Top 5 Customers by Total Spend",
    "reasoning": "Table is best for detailed multi-column data with rankings"
}

### Example 3: Complex Analysis
User: "Show correlation between tech savviness and online orders"
Response: {
    "query_type": "pandas",
    "pandas_code": "df[['tech_savvy_score', 'monthly_online_orders']].corr().iloc[0, 1]",
    "explanation": "Calculates correlation coefficient between tech savviness and online purchase frequency",
    "chart_type": "scatter",
    "chart_title": "Tech Savviness vs Online Orders",
    "reasoning": "Scatter plot reveals relationship between two continuous variables"
}
"""
        return examples
