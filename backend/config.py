import os
from dotenv import load_dotenv

load_dotenv()

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_GENERATE_ENDPOINT = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_TAGS_ENDPOINT = f"{OLLAMA_BASE_URL}/api/tags"

# Data configuration
DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "Customer Behaviour (Online vs Offline).xlsx")

# API configuration
MAX_ROWS_RETURNED = 1000
CACHE_ENABLED = True
CACHE_MAX_ENTRIES = int(os.getenv("CACHE_MAX_ENTRIES", "200"))
RATE_LIMIT_REQUESTS_PER_MINUTE = 30
ENABLE_DETAILED_ERRORS = os.getenv("ENABLE_DETAILED_ERRORS", "false").lower() == "true"
ALLOWED_ORIGINS = ["*"]
ENABLE_API_KEY_AUTH = os.getenv("ENABLE_API_KEY_AUTH", "false").lower() == "true"
API_KEY_HEADER_NAME = os.getenv("API_KEY_HEADER_NAME", "x-api-key").strip().lower()
API_KEYS = {
    key.strip()
    for key in os.getenv("API_KEYS", "").split(",")
    if key.strip()
}
ENABLE_REQUEST_LOGGING = os.getenv("ENABLE_REQUEST_LOGGING", "true").lower() == "true"

# LLM configuration
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")
OLLAMA_FALLBACK_MODELS = [
	model.strip()
	for model in os.getenv("OLLAMA_FALLBACK_MODELS", "qwen2.5-coder:3b,mistral,phi3:mini").split(",")
	if model.strip()
]
OLLAMA_REQUEST_TIMEOUT = int(os.getenv("OLLAMA_REQUEST_TIMEOUT", "120"))
OLLAMA_FALLBACK_REQUEST_TIMEOUT = int(os.getenv("OLLAMA_FALLBACK_REQUEST_TIMEOUT", "45"))
OLLAMA_MAX_MODEL_ATTEMPTS = int(os.getenv("OLLAMA_MAX_MODEL_ATTEMPTS", "2"))
OLLAMA_TEMPERATURE = float(os.getenv("OLLAMA_TEMPERATURE", "0.15"))
OLLAMA_TOP_P = float(os.getenv("OLLAMA_TOP_P", "0.9"))
OLLAMA_NUM_PREDICT = int(os.getenv("OLLAMA_NUM_PREDICT", "200"))
OLLAMA_NUM_CTX = int(os.getenv("OLLAMA_NUM_CTX", "2048"))
