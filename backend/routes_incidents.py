from fastapi import APIRouter
from typing import Optional
from database.incident_repository import incident_repo

router = APIRouter(prefix="/api/incidents", tags=["Incident Logs"])

@router.get("", summary="Get incident logs")
async def get_incidents(video_filename: Optional[str] = None):
    """Returns incident logs stored in database."""
    incidents = incident_repo.get_all_incidents(video_filename=video_filename)
    return {"success": True, "count": len(incidents), "incidents": incidents}
