# Conversational AI Brain for BI Dashboard

This is the **AI backend** that powers the conversational BI dashboard system. It converts natural language prompts into data queries and chart recommendations.

## 🎯 What It Does

1. **Understands** natural language business questions
2. **Generates** pandas queries to fetch data from CSV
3. **Executes** queries with validation to prevent hallucinations
4. **Recommends** appropriate chart types (bar, line, pie, scatter, table)
5. **Returns** structured JSON with data + chart configuration for frontend

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ FastAPI Backend (main.py)                                   │
│  POST /generate-dashboard                                   │
│  GET /schema                                                │
│  GET /health                                                │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ LLM Engine (llm_engine.py)                                  │
│ - Google Gemini API integration                             │
│ - Schema-aware prompt engineering                           │
│ - Generates pandas code + chart recommendation              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Query Executor (query_executor.py)                          │
│ - Validates pandas code (safety checks)                     │
│ - Executes queries on CSV data                              │
│ - Catches hallucinations                                    │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Chart Selector (chart_selector.py)                          │
│ - Recommends chart types                                    │
│ - Generates Recharts/Plotly config                          │
│ - Validates data for visualization                          │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Data Layer (data_loader.py)                                 │
│ - Loads Customer Behaviour CSV                              │
│ - Provides schema metadata to LLM                           │
│ - Column validation                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Files

- **main.py** — FastAPI application with endpoints
- **llm_engine.py** — Google Gemini API integration + prompt engineering
- **query_executor.py** — Pandas query generation, execution, validation
- **chart_selector.py** — Chart type recommendation & config generation
- **data_loader.py** — CSV loading, schema extraction, metadata provider
- **config.py** — Configuration & environment variables
- **test_prompts.py** — Test suite to validate all components
- **requirements.txt** — Python dependencies
- **.env.example** — Environment variables template

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API key"
3. Copy the key

### 3. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env and add your API key
GEMINI_API_KEY=your_key_here
```

### 4. Run Tests

```bash
python test_prompts.py
```

Expected output:

```
✓ TEST 1 PASSED: Data Loader
✓ TEST 2 PASSED: Query Executor
✓ TEST 3 PASSED: Chart Selector
✓ TEST 4 PASSED: LLM Engine
✓ TEST 5 PASSED: End-to-End

✓ All tests passed! AI Brain is ready to use.
```

### 5. Start the Server

```bash
python -m uvicorn main:app --reload
```

Server runs at: `http://localhost:8000`

### 6. Test the API

**Interactive Docs:** <http://localhost:8000/docs>

**Sample Request:**

```bash
curl -X POST http://localhost:8000/generate-dashboard \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Show me average online spend by age group"}'
```

**Sample Response:**

```json
{
  "success": true,
  "data": [
    {"age": 20, "avg_online_spend": 5000},
    {"age": 30, "avg_online_spend": 7500}
  ],
  "chart_type": "bar",
  "chart_config": {
    "type": "bar",
    "title": "Average Online Spend by Age",
    "data": [...],
    "xAxisDataKey": "age",
    "yAxisDataKey": "avg_online_spend"
  },
  "insights": "Visualization shows trend across age groups"
}
```

## 🧪 API Endpoints

### `POST /generate-dashboard`

Convert natural language to dashboard.

**Request:**

```json
{
  "prompt": "Show monthly online orders by region",
  "max_rows": 1000
}
```

**Response:**

```json
{
  "success": true,
  "data": [...],
  "chart_type": "bar|line|pie|scatter|table",
  "chart_config": {...},
  "title": "...",
  "insights": "...",
  "metadata": {
    "row_count": 50,
    "columns": ["region", "monthly_online_orders"],
    "truncated": false
  }
}
```

### `GET /schema`

Get dataset schema and available columns.

**Response:**

```json
{
  "columns": ["age", "monthly_income", "daily_internet_hours", ...],
  "row_count": 5000,
  "description": "## Dataset Schema\n\n..."
}
```

### `GET /health`

Health check.

**Response:**

```json
{"status": "ok", "service": "Conversational BI Dashboard API"}
```

### `POST /refine-dashboard` (Bonus)

Filter or modify existing dashboard results.

## 🔒 Safety Features

✓ **Code Validation** — Pandas code checked for dangerous operations
✓ **Column Validation** — Only real columns referenced
✓ **Hallucination Detection** — Results validated against schema
✓ **Result Limits** — Max 1000 rows returned to prevent memory issues
✓ **Chart Validation** — Data validated for selected chart type
✓ **Error Handling** — Graceful failures with helpful messages

## 🎁 Sample Prompts to Test

```
1. "Show total online spend by age group"
   → Executes groupby query, returns bar chart

2. "Top 5 customers by total spending"
   → Calculates total spend, returns table sorted by rank

3. "Distribution of monthly income across customers"
   → Analyzes income distribution, returns pie/histogram

4. "Correlation between tech savviness and online orders"
   → Calculates correlation, returns scatter plot

5. "Customers with high online spend but low store visits"
   → Filters data, returns detailed table
```

## 🔧 Troubleshooting

### "GEMINI_API_KEY not set"

- Make sure `.env` file exists and contains your API key
- Run: `cp .env.example .env` and edit the file

### "CSV file not found"

- Verify file path in `config.py` is correct
- Should be at: `../Customer Behaviour (Online vs Offline).csv`

### "Module not found" errors

- Run: `pip install -r requirements.txt`
- Check Python version (3.8+ required)

### LLM returns invalid JSON

- Check internet connection to Google API
- Verify API key is valid
- Check API quota/billing

## 📚 Framework Stack

- **Framework:** FastAPI (async, high performance)
- **LLM:** Google Gemini API (free tier available)
- **Data:** Pandas (data manipulation)
- **API Server:** Uvicorn (ASGI)
- **Validation:** Pydantic (typed requests/responses)

## 🎓 How It Works (Deep Dive)

### Step 1: User Sends Prompt

```
User: "Show average online spend by age group"
```

### Step 2: LLM Generates Query

- LLM receives prompt + full schema context
- Uses few-shot examples to improve accuracy
- Returns pandas code + chart type recommendation

```
Output: {
  "pandas_code": "df.groupby('age')['avg_online_spend'].mean()",
  "chart_type": "bar",
  "explanation": "Groups by age and calculates mean spend"
}
```

### Step 3: Validate & Execute

- Validate pandas code references only real columns
- Execute query in safe namespace
- Limit results to MAX_ROWS_RETURNED

```
Result: {success: true, data: [...], columns: [...]}
```

### Step 4: Generate Chart Config

- Transform data for chosen chart library (Recharts)
- Add styling and interactivity options
- Include metadata and insights

```
Config: {
  type: "bar",
  data: [...],
  xAxisDataKey: "age",
  yAxisDataKey: "avg_online_spend"
}
```

### Step 5: Return to Frontend

- Frontend renders chart using Recharts
- User sees interactive visualization
- Can click, hover, filter, etc.

## 🚧 Future Enhancements

- [ ] SQL query generation (for databases)
- [ ] User CSV upload support
- [ ] Saved dashboard history
- [ ] Real-time data updates
- [ ] Advanced filtering UI
- [ ] Export to PDF/PNG
- [ ] Natural language follow-ups ("Now filter to East Coast")
- [ ] Multi-table joins
- [ ] Predictive analytics

## 📞 Support

For issues or questions:

1. Check test_prompts.py output
2. Review error messages in console
3. Check network/firewall settings for API access
4. Verify .env configuration

---

**Ready to power your conversational BI dashboard!** 🚀
