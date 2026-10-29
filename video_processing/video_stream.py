import os
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from config.settings import VIDEO_STORAGE_DIR, SUPPORTED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES
from utils.logger import logger

class VideoProcessingError(Exception):
    """Custom exception raised for video file validation and handling errors."""
    pass

class LocalVideoStreamManager:
    """
    Manages local CCTV video file storage, ingestion, format validation, and metadata listing.
    NO external CV or OpenCV dependency used in Stage 1.
    """

    def __init__(self, storage_dir: Path = VIDEO_STORAGE_DIR):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    def validate_file_extension(self, filename: str) -> str:
        """
        Validates whether the video file extension is supported.
        Raises VideoProcessingError if invalid.
        """
        ext = os.path.splitext(filename)[1].lower()
        if ext not in SUPPORTED_EXTENSIONS:
            allowed = ", ".join(sorted(SUPPORTED_EXTENSIONS))
            raise VideoProcessingError(
                f"Unsupported video format '{ext}'. Supported formats: {allowed}"
            )
        return ext

    def save_uploaded_video(self, file_obj, filename: str) -> Dict[str, Any]:
        """
        Saves uploaded file into local CCTV storage directory after format and size validation.
        """
        if not filename or filename.strip() == "":
            raise VideoProcessingError("No filename provided for video upload.")

        # Sanitize filename
        safe_filename = os.path.basename(filename).replace(" ", "_")
        self.validate_file_extension(safe_filename)

        destination_path = self.storage_dir / safe_filename

        # Write file contents
        total_bytes = 0
        try:
            with open(destination_path, "wb") as buffer:
                while chunk := file_obj.read(1024 * 1024):
                    total_bytes += len(chunk)
                    if total_bytes > MAX_UPLOAD_SIZE_BYTES:
                        # Clean up partial file
                        buffer.close()
                        if os.path.exists(destination_path):
                            os.remove(destination_path)
                        raise VideoProcessingError(
                            f"File size exceeds maximum limit of {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB."
                        )
                    buffer.write(chunk)
        except Exception as e:
            if os.path.exists(destination_path) and not isinstance(e, VideoProcessingError):
                os.remove(destination_path)
            if isinstance(e, VideoProcessingError):
                raise e
            raise VideoProcessingError(f"Failed to save video file: {str(e)}")

        if total_bytes == 0:
            if os.path.exists(destination_path):
                os.remove(destination_path)
            raise VideoProcessingError("Uploaded file is empty (0 bytes).")

        logger.info(f"Successfully saved CCTV video: {safe_filename} ({total_bytes} bytes)")
        return self.get_video_info(safe_filename)

    def list_available_videos(self) -> List[Dict[str, Any]]:
        """
        Lists all valid CCTV video files currently available in local storage.
        """
        videos = []
        if not os.path.exists(self.storage_dir):
            return videos

        for entry in os.listdir(self.storage_dir):
            full_path = self.storage_dir / entry
            if os.path.isfile(full_path):
                ext = os.path.splitext(entry)[1].lower()
                if ext in SUPPORTED_EXTENSIONS:
                    try:
                        info = self.get_video_info(entry)
                        videos.append(info)
                    except VideoProcessingError:
                        continue
        return videos

    def get_video_info(self, filename: str) -> Dict[str, Any]:
        """
        Retrieves file metadata for a specific video file.
        """
        file_path = self.storage_dir / filename
        if not os.path.exists(file_path):
            raise VideoProcessingError(f"Video file '{filename}' does not exist in local storage.")

        size_bytes = os.path.getsize(file_path)
        if size_bytes == 0:
            raise VideoProcessingError(f"Video file '{filename}' is empty or corrupt.")

        ext = os.path.splitext(filename)[1].lower()
        size_mb = round(size_bytes / (1024 * 1024), 2)

        return {
            "filename": filename,
            "path": str(file_path),
            "size_bytes": size_bytes,
            "size_formatted": f"{size_mb} MB",
            "extension": ext,
            "status": "Ready for Monitoring"
        }

    def delete_video(self, filename: str) -> bool:
        """
        Deletes a video file from local storage.
        """
        file_path = self.storage_dir / filename
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted CCTV video file: {filename}")
            return True
        return False

# Global instance for use across application routes
video_manager = LocalVideoStreamManager()
