import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Smartphone, ShieldAlert, Sparkles } from 'lucide-react';

const VideoPlayer = ({
  videoSrc,
  videoTitle = "examination_footage_sample.mp4",
  detections = [],
  currentTimeSec = 0,
  onTimeUpdate
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(45); // fallback seconds
  const [isMuted, setIsMuted] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  // Sync external seek time
  useEffect(() => {
    if (videoRef.current && typeof currentTimeSec === 'number') {
      videoRef.current.currentTime = currentTimeSec;
      setCurrentTime(currentTimeSec);
    }
  }, [currentTimeSec]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNativeTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    if (onTimeUpdate) onTimeUpdate(cur);
  };

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
    setCurrentTime(seekTime);
    if (onTimeUpdate) onTimeUpdate(seekTime);
  };

  const formatTime = (secs) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  // Find active detections in the current time frame (+- 3.0s window)
  const activeDetectionsInFrame = detections.filter(d => {
    const target = d.timeSec || 0;
    return Math.abs(target - currentTime) <= 3.0;
  });

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col group">
      {/* Video Viewport */}
      <div ref={containerRef} className="relative aspect-video bg-black flex items-center justify-center overflow-hidden select-none">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain"
            onTimeUpdate={handleNativeTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 45)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            muted={isMuted}
            playsInline
          />
        ) : (
          /* Simulated Examination Hall Video Feed Canvas */
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-dark-900">
            {/* Perspective classroom grid background */}
            <div className="absolute inset-0 grid-bg opacity-40"></div>
            
            <div className="relative z-10 text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-3 shadow-glow-brand">
                <Sparkles className="w-8 h-8 text-brand-400" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-wide">CCTV Stream Synchronized</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                AI YOLO Object Detection active. Frame timestamps and bounding boxes are dynamically synchronized.
              </p>
            </div>
          </div>
        )}

        {/* CCTV Top HUD Overlay */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-dark-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono text-slate-200 z-10 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>CAM-01 [ROOM A101] • 1080p FHD • YOLOv8 ACTIVE</span>
        </div>

        {/* Dynamic Object Detection Bounding Boxes */}
        {showBoundingBoxes && activeDetectionsInFrame.map((det) => (
          <div
            key={det.id}
            className="absolute border-2 border-red-500 bg-red-500/25 rounded-lg shadow-glow-alert flex flex-col justify-between transition-all duration-200 pointer-events-none z-10 animate-pulse-subtle"
            style={{
              left: `${det.box?.x || 42}%`,
              top: `${det.box?.y || 55}%`,
              width: `${det.box?.w || 15}%`,
              height: `${det.box?.h || 22}%`,
            }}
          >
            {/* Box Header Label */}
            <div className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-t flex items-center justify-between tracking-wider shadow">
              <span className="flex items-center space-x-1">
                <Smartphone className="w-3 h-3" />
                <span>PHONE DETECTED</span>
              </span>
              <span>{det.confidence}%</span>
            </div>

            {/* Box Bottom Student Tag */}
            <div className="bg-dark-900/90 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 text-center border-t border-red-500/40">
              {det.studentId} • {det.studentName || 'Student'}
            </div>
          </div>
        ))}

        {/* Live Detected Banner */}
        {activeDetectionsInFrame.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-alert-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-glow-alert flex items-center space-x-2 z-10 animate-bounce">
            <ShieldAlert className="w-4 h-4" />
            <span>ALERT: {activeDetectionsInFrame.length} Phone Object(s) in Frame</span>
          </div>
        )}
      </div>

      {/* Video Control Bar */}
      <div className="p-4 bg-dark-850 border-t border-slate-800/80 flex flex-col space-y-3">
        {/* Progress Scrubber */}
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs text-brand-400 font-bold min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 45}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-all"
          />
          <span className="font-mono text-xs text-slate-500 min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow-brand transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
                setCurrentTime(0);
              }}
              className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-300 transition-colors"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-300 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="text-xs text-slate-400 font-medium ml-2 truncate max-w-[200px]">
              {videoTitle}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                showBoundingBoxes
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                  : 'bg-dark-700 text-slate-400 border-slate-700'
              }`}
            >
              {showBoundingBoxes ? 'Bounding Boxes: ON' : 'Bounding Boxes: OFF'}
            </button>

            <button
              onClick={() => {
                if (containerRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    containerRef.current.requestFullscreen();
                  }
                }
              }}
              className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-300 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
