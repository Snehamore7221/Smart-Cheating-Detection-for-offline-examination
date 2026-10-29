def seconds_to_timestamp(seconds: float) -> str:
    """
    Converts floating point seconds into HH:MM:SS format string.
    """
    total_seconds = int(seconds)
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def frame_to_timestamp(frame_index: int, fps: float) -> str:
    """
    Converts frame index and FPS into HH:MM:SS format string.
    """
    if fps <= 0:
        return "00:00:00"
    seconds = frame_index / fps
    return seconds_to_timestamp(seconds)
