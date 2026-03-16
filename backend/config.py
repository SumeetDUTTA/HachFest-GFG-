import os
from dotenv import load_dotenv

load_dotenv()

# Google Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")  # Alternative env var name

# Data configuration
DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "Customer Behaviour (Online vs Offline).xlsx")

# API configuration
MAX_ROWS_RETURNED = 1000
CACHE_ENABLED = True
CACHE_MAX_ENTRIES = int(os.getenv("CACHE_MAX_ENTRIES", "200"))
RATE_LIMIT_REQUESTS_PER_MINUTE = 30
ENABLE_DETAILED_ERRORS = os.getenv("ENABLE_DETAILED_ERRORS", "false").lower() == "true"
ALLOWED_ORIGINS = [
	origin.strip()
	for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
	if origin.strip()
]
ENABLE_API_KEY_AUTH = os.getenv("ENABLE_API_KEY_AUTH", "false").lower() == "true"
API_KEY_HEADER_NAME = os.getenv("API_KEY_HEADER_NAME", "x-api-key").strip().lower()
API_KEYS = {
    key.strip()
    for key in os.getenv("API_KEYS", "").split(",")
    if key.strip()
}
ENABLE_REQUEST_LOGGING = os.getenv("ENABLE_REQUEST_LOGGING", "true").lower() == "true"

# LLM configuration
GEMINI_MODEL = "gemini-2.0-flash"  # Updated model name for google.genai v1.67.0
GEMINI_TEMPERATURE = 0.7
GEMINI_MAX_OUTPUT_TOKENS = 500
