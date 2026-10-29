import os
from pathlib import Path

# Base project directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Video storage directory
DATA_DIR = BASE_DIR / "data"
VIDEO_STORAGE_DIR = DATA_DIR / "videos"
DATABASE_PATH = DATA_DIR / "incidents.db"

# Ensure data directories exist
os.makedirs(VIDEO_STORAGE_DIR, exist_ok=True)

# Supported video formats
SUPPORTED_EXTENSIONS = {".mp4", ".avi", ".mkv", ".mov", ".webm"}
SUPPORTED_MIME_TYPES = {
    "video/mp4",
    "video/x-msvideo",
    "video/avi",
    "video/x-matroska",
    "video/quicktime",
    "video/webm",
    "application/octet-stream"
}

# Video upload limits (500 MB max)
MAX_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024

# Default Bench Map Path
DEFAULT_BENCH_MAP_PATH = BASE_DIR / "config" / "default_bench_map.json"

# Server configuration
HOST = "127.0.0.1"
PORT = 8000
