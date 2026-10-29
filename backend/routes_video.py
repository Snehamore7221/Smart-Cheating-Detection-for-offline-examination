import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from video_processing.video_stream import video_manager, VideoProcessingError
from config.settings import VIDEO_STORAGE_DIR

router = APIRouter(prefix="/api/videos", tags=["Video Management"])

@router.get("", summary="List all available CCTV video files")
async def list_videos():
    """Returns a JSON list of all available local CCTV video files."""
    try:
        videos = video_manager.list_available_videos()
        return {"success": True, "count": len(videos), "videos": videos}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list video files: {str(e)}"
        )

@router.post("/upload", summary="Upload a local CCTV examination hall video")
async def upload_video(file: UploadFile = File(...)):
    """
    Validates and stores an uploaded CCTV video file locally in data/videos/.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No video file provided in the upload request."
        )

    try:
        saved_info = video_manager.save_uploaded_video(file.file, file.filename)
        return {
            "success": True,
            "message": "CCTV Video uploaded successfully.",
            "video": saved_info
        }
    except VideoProcessingError as vpe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(vpe)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during video upload: {str(e)}"
        )

@router.get("/{filename}", summary="Stream/Play a specific local CCTV video file")
async def stream_video(filename: str):
    """
    Streams a local CCTV video file to the frontend video player.
    Supports HTTP Range requests for seamless video seeking.
    """
    safe_filename = os.path.basename(filename)
    file_path = VIDEO_STORAGE_DIR / safe_filename

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video file '{safe_filename}' not found."
        )

    ext = os.path.splitext(safe_filename)[1].lower()
    media_types = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".avi": "video/x-msvideo",
        ".mkv": "video/x-matroska"
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=safe_filename
    )

@router.delete("/{filename}", summary="Delete a local CCTV video file")
async def delete_video(filename: str):
    """Deletes a video file from local storage."""
    safe_filename = os.path.basename(filename)
    success = video_manager.delete_video(safe_filename)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video file '{safe_filename}' not found for deletion."
        )
    return {"success": True, "message": f"Deleted '{safe_filename}'."}
