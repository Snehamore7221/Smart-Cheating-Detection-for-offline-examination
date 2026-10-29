import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routes_video import router as video_router
from backend.routes_incidents import router as incident_router
from backend.routes_bench import router as bench_router
from database.db_connection import init_db
from config.settings import BASE_DIR
from utils.logger import logger

app = FastAPI(
    title="Smart Examination Monitoring System",
    description="Offline examination monitoring system for CCTV footage analysis.",
    version="1.0.0"
)

# Enable CORS for local deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(video_router)
app.include_router(incident_router)
app.include_router(bench_router)

# Mount Frontend static files
frontend_path = BASE_DIR / "frontend"
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

@app.on_event("startup")
async def startup_event():
    """Initializes local database tables on server startup."""
    init_db()
    logger.info("Server startup complete. Ready to serve monitoring application.")

@app.get("/", summary="Serve Main Dashboard UI")
async def root():
    """Serves index.html homepage from frontend."""
    from fastapi.responses import FileResponse
    index_file = frontend_path / "index.html"
    if os.path.exists(index_file):
        return FileResponse(str(index_file))
    return {"message": "Frontend static file index.html not found."}
