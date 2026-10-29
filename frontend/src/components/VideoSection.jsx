import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  FileVideo,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  PlusCircle,
  Move,
  Maximize2,
  Sliders,
  Volume2,
  VolumeX,
  User,
  ShieldAlert,
  X,
  MousePointerClick,
  Crosshair,
  Info,
  Layers
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import StudentModal from './StudentModal';
import {
  getVideoRenderInfo,
  clientToRenderedCoords,
  renderedRectToVideoROI,
  videoROIToStyle
} from '../utils/coordinateUtils';

const VideoSection = () => {
  const {
    video,
    handleUploadVideo,
    handleSeekVideo,
    studentROIs,
    isDrawingMode,
    setIsDrawingMode,
    setPendingDrawnROI,
    setEditingStudent,
    hoveredStudentId,
    setHoveredStudentId,
    selectedStudentId,
    setSelectedStudentId,
    showOverlayOnVideo,
    setShowOverlayOnVideo,
    visualContours,
    cvThresholds,
    detectionState,
    detectionProgress,
    detectionError,
    detectionSummary,
    startMovementDetection,
    incidents,
    activeAlert,
    setActiveAlert
  } = useExam();

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showDebugMetrics, setShowDebugMetrics] = useState(false);
  const [showVisualDebug, setShowVisualDebug] = useState(false);

  // Accurate geometry calculation for object-fit: contain
  const [renderInfo, setRenderInfo] = useState({
    videoWidth: 1920,
    videoHeight: 1080,
    containerWidth: 800,
    containerHeight: 450,
    renderedWidth: 800,
    renderedHeight: 450,
    offsetX: 0,
    offsetY: 0,
    scaleFactorX: 2.4,
    scaleFactorY: 2.4,
    isPillarboxed: false,
    isLetterboxed: false
  });

  const updateGeometry = useCallback(() => {
    if (containerRef.current) {
      const info = getVideoRenderInfo(videoRef.current, containerRef.current);
      setRenderInfo(info);
      if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        video.duration = Math.round(videoRef.current.duration);
      }
    }
  }, [video]);

  // Update geometry on container resize
  useEffect(() => {
    updateGeometry();
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateGeometry();
    });
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateGeometry);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateGeometry);
    };
  }, [updateGeometry, video.url]);

  // Drag-to-draw state (in rendered video coordinate space)
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ rx: 0, ry: 0 });
  const [dragCurrent, setDragCurrent] = useState({ rx: 0, ry: 0 });

  // Play subtle warning audio beep on violation alert
  const playAlertBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  };

  // Sync seek target from incident click
  useEffect(() => {
    if (video.seekTarget !== null && videoRef.current) {
      videoRef.current.currentTime = video.seekTarget;
      setCurrentPlaybackTime(video.seekTarget);
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [video.seekTarget]);

  const togglePlay = () => {
    if (!videoRef.current && !video.url) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Simulated playback ticker if no real video element loaded
  useEffect(() => {
    let interval = null;
    if (isPlaying && !video.url) {
      interval = setInterval(() => {
        setCurrentPlaybackTime((prev) => {
          const next = prev + 1;
          if (next >= (video.duration || 330)) return 0;
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, video.url, video.duration]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentPlaybackTime(cur);

    // Check if current time triggers a boundary violation
    const matchedIncident = incidents.find(
      (inc) => Math.abs(inc.timeSec - cur) <= 2.5
    );
    if (matchedIncident) {
      setActiveAlert({
        studentName: matchedIncident.studentName,
        row: matchedIncident.row,
        bench: matchedIncident.bench,
        seat: matchedIncident.seat,
        seatId: matchedIncident.seatId,
        type: matchedIncident.type,
        outsideRatio: matchedIncident.outsideRatio,
        duration: matchedIncident.duration,
        relatedStudent: matchedIncident.relatedStudent,
        timestamp: matchedIncident.timestamp
      });
      playAlertBeep();
    }
  };

  const formatSeconds = (sec) => {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  // -------------------------------------------------------------------------
  // MOUSE DRAG RECTANGLE DRAWING LOGIC WITH EXACT NATIVE RESOLUTION CONVERSION
  // -------------------------------------------------------------------------
  const handleMouseDown = (e) => {
    if (!isDrawingMode || !containerRef.current) return;
    e.preventDefault();

    const currentRender = getVideoRenderInfo(videoRef.current, containerRef.current);
    setRenderInfo(currentRender);

    const { rx, ry } = clientToRenderedCoords(e.clientX, e.clientY, containerRef.current, currentRender);

    setIsMouseDown(true);
    setDragStart({ rx, ry });
    setDragCurrent({ rx, ry });
  };

  const handleMouseMove = (e) => {
    if (!isDrawingMode || !isMouseDown || !containerRef.current) return;
    e.preventDefault();

    const { rx, ry } = clientToRenderedCoords(e.clientX, e.clientY, containerRef.current, renderInfo);
    setDragCurrent({ rx, ry });
  };

  const handleMouseUp = (e) => {
    if (!isDrawingMode || !isMouseDown || !containerRef.current) return;
    e.preventDefault();
    setIsMouseDown(false);

    const rawWidth = Math.abs(dragCurrent.rx - dragStart.rx);
    const rawHeight = Math.abs(dragCurrent.ry - dragStart.ry);

    // Ignore accidental tiny clicks
    if (rawWidth < 15 || rawHeight < 15) {
      return;
    }

    const calculatedROI = renderedRectToVideoROI(
      {
        startX: dragStart.rx,
        startY: dragStart.ry,
        endX: dragCurrent.rx,
        endY: dragCurrent.ry
      },
      renderInfo
    );

    setPendingDrawnROI(calculatedROI);
  };

  // Compute live drag preview box style inside the rendered video overlay wrapper
  const getDragPreviewStyle = () => {
    if (!isMouseDown) return { display: 'none' };
    const left = Math.min(dragStart.rx, dragCurrent.rx);
    const top = Math.min(dragStart.ry, dragCurrent.ry);
    const width = Math.abs(dragCurrent.rx - dragStart.rx);
    const height = Math.abs(dragCurrent.ry - dragStart.ry);

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      display: 'block'
    };
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileVideo className="w-5 h-5 text-blue-600" />
            <span>Surveillance Video & Student ROI Drawing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty manually draws student monitoring rectangles directly on the video
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Debug Coordinate Inspector Toggle */}
          <button
            onClick={() => setShowDebugMetrics(!showDebugMetrics)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              showDebugMetrics
                ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle Coordinate & Resolution Inspector"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Visual Debug Mode Toggle */}
          <button
            onClick={() => setShowVisualDebug(!showVisualDebug)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              showVisualDebug
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle Visual Movement & ROI Geometric Matching"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visual Match Debug</span>
          </button>

          {/* Audio Alert Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundEnabled ? 'Warning Audio: ON' : 'Warning Audio: OFF'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* ADD STUDENT ROI (Drawing Mode Toggle) */}
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
              isDrawingMode
                ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Click and drag on the video to define a new student area"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isDrawingMode ? 'Drawing Active (Click & Drag)' : '+ Add Student ROI'}</span>
          </button>

          {/* Overlay Visibility Toggle */}
          <button
            onClick={() => setShowOverlayOnVideo(!showOverlayOnVideo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              showOverlayOnVideo
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle Student Overlay on Video"
          >
            {showOverlayOnVideo ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>ROIs Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>ROIs Hidden</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drawing Instructions Banner when drawing mode is ON */}
      {isDrawingMode && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <MousePointerClick className="w-4 h-4 text-amber-700 animate-bounce" />
            <span>
              <strong>Draw Mode Active:</strong> Click and drag a rectangle over a student in the video feed to define their monitoring area.
            </span>
          </div>
          <button
            onClick={() => setIsDrawingMode(false)}
            className="text-xs font-bold text-amber-800 hover:underline"
          >
            Cancel Drawing
          </button>
        </div>
      )}

      {/* Debug Resolution & Offset Inspection Banner */}
      {showDebugMetrics && (
        <div className="p-3 rounded-xl bg-purple-950/90 text-purple-200 border border-purple-800 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 shadow-inner">
          <div>
            <span className="text-purple-400 block text-[9px] uppercase font-bold">Native Video Res</span>
            <span>{renderInfo.videoWidth} × {renderInfo.videoHeight} px</span>
          </div>
          <div>
            <span className="text-purple-400 block text-[9px] uppercase font-bold">Rendered Content</span>
            <span>{Math.round(renderInfo.renderedWidth)} × {Math.round(renderInfo.renderedHeight)} px</span>
          </div>
          <div>
            <span className="text-purple-400 block text-[9px] uppercase font-bold">Black Bars (Offsets)</span>
            <span>X: {Math.round(renderInfo.offsetX)}px | Y: {Math.round(renderInfo.offsetY)}px</span>
          </div>
          <div>
            <span className="text-purple-400 block text-[9px] uppercase font-bold">Scale Multiplier</span>
            <span>{renderInfo.scaleFactorX.toFixed(2)}x (Exact Locked)</span>
          </div>
        </div>
      )}

      {/* Video Viewport / Canvas Container */}
      <div className="app-card overflow-hidden border border-slate-200 shadow-md">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`relative aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
            isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* 1. Video Player Element */}
          {video.url ? (
            <video
              ref={videoRef}
              src={video.url}
              className="w-full h-full object-contain pointer-events-none"
              onLoadedMetadata={updateGeometry}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
            />
          ) : (
            /* Simulated CCTV Examination Room Background */
            <div className="w-full h-full relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center pointer-events-none">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
                    linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.05) 100%)
                  `
                }}
              />

              {/* Upload Prompt Action */}
              {!isDrawingMode && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="z-10 p-5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md flex flex-col items-center text-center cursor-pointer hover:border-blue-500 hover:bg-slate-900/95 transition-all group max-w-sm shadow-xl pointer-events-auto"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Upload Examination Video (MP4)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Click to select MP4 examination surveillance recording
                  </p>
                  <span className="mt-2 text-[10px] font-semibold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800">
                    Faculty Manual Student ROIs Active
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/*"
            onChange={(e) => handleUploadVideo(e.target.files[0])}
            className="hidden"
          />

          {/* 
            --------------------------------------------------------------------------------
            2 & 3. EXACT RENDERED-VIDEO OVERLAY LAYER
            Positioned and sized EXACTLY on top of the rendered video frame (excluding black bars)
            --------------------------------------------------------------------------------
          */}
          <div
            className="absolute pointer-events-none overflow-hidden"
            style={{
              left: `${renderInfo.offsetX}px`,
              top: `${renderInfo.offsetY}px`,
              width: `${renderInfo.renderedWidth}px`,
              height: `${renderInfo.renderedHeight}px`
            }}
          >
            {/* LIVE DRAG PREVIEW RECTANGLE */}
            {isMouseDown && (
              <div
                className="absolute border-2 border-dashed border-amber-400 bg-amber-500/25 pointer-events-none z-40 rounded shadow-lg flex flex-col justify-between p-1"
                style={getDragPreviewStyle()}
              >
                <span className="bg-amber-500 text-white font-black text-[9px] px-1 rounded w-fit uppercase tracking-wider">
                  Drawing Student ROI...
                </span>
                <span className="bg-black/80 text-amber-300 font-mono text-[8px] px-1 rounded w-fit self-end">
                  Release to Save
                </span>
              </div>
            )}

            {/* VISUAL DEBUG MODE: Expanded Association ROIs (Debug Mode Only) */}
            {showVisualDebug && showOverlayOnVideo && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {studentROIs.map((s) => {
                  const padRatio = 0.35;
                  const padX = s.roi.width * padRatio;
                  const padY = s.roi.height * padRatio;
                  const expROI = {
                    x: Math.max(0, s.roi.x - padX),
                    y: Math.max(0, s.roi.y - padY),
                    width: Math.min(renderInfo.videoWidth - Math.max(0, s.roi.x - padX), s.roi.width + 2 * padX),
                    height: Math.min(renderInfo.videoHeight - Math.max(0, s.roi.y - padY), s.roi.height + 2 * padY)
                  };
                  const expStyle = videoROIToStyle(expROI, renderInfo.videoWidth, renderInfo.videoHeight);
                  return (
                    <div
                      key={`exp-${s.id || s.seatId}`}
                      className="absolute border border-dashed border-indigo-400/40 bg-indigo-950/5 rounded-xl pointer-events-none"
                      style={expStyle}
                    >
                      <span className="absolute -top-2.5 left-2 bg-indigo-900/85 text-indigo-200 border border-indigo-700/50 text-[8px] font-mono px-1 rounded">
                        {s.studentName} [Expanded]
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VISUAL DEBUG MODE: Detected Movement Contours (Debug Mode Only) */}
            {showVisualDebug && visualContours && visualContours.length > 0 && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {visualContours.map((vc, idx) => {
                  const style = videoROIToStyle(vc.box, renderInfo.videoWidth, renderInfo.videoHeight);
                  return (
                    <div
                      key={vc.id || idx}
                      className="absolute border border-dashed border-cyan-400 bg-cyan-500/10 rounded flex flex-col justify-between p-1 pointer-events-none animate-fadeIn"
                      style={style}
                    >
                      <span className="bg-cyan-900/90 text-cyan-200 font-mono text-[9px] px-1 py-0.5 rounded w-fit font-bold shadow-xs">
                        Movement → {vc.studentName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MANUALLY CONFIGURED STUDENT RECTANGLES OVERLAY (Clean Normal Mode) */}
            {showOverlayOnVideo && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {studentROIs.map((s) => {
                  const isHovered = hoveredStudentId === s.id || hoveredStudentId === s.seatId;
                  const isSelected = selectedStudentId === s.id || selectedStudentId === s.seatId;

                  // Check active confirmed violation in current frame
                  const currentActiveIncident = incidents.find(
                    (inc) =>
                      (inc.seatId === s.seatId || inc.studentId === s.id || inc.studentName === s.studentName) &&
                      Math.abs(inc.timeSec - currentPlaybackTime) <= 3.0
                  );

                  const isFlagged = currentActiveIncident !== undefined || s.visualState === 'FLAGGED';

                  let borderClass = 'border-2 border-emerald-500/80 bg-transparent';
                  let tagBg = 'bg-emerald-700/90 text-white';

                  if (isFlagged) {
                    borderClass = 'border-2 border-red-500 bg-red-500/10 ring-2 ring-red-500 shadow-lg animate-pulse';
                    tagBg = 'bg-red-600 text-white';
                  } else if (isHovered || isSelected) {
                    borderClass = 'border-2 border-amber-400 bg-amber-500/10 ring-2 ring-amber-400';
                    tagBg = 'bg-amber-600 text-white';
                  }

                  // Precise percentage style computed against native video dimensions
                  const positionStyle = videoROIToStyle(
                    s.roi,
                    renderInfo.videoWidth,
                    renderInfo.videoHeight
                  );

                  return (
                    <div
                      key={s.id || s.seatId}
                      onMouseEnter={() => setHoveredStudentId(s.id || s.seatId)}
                      onMouseLeave={() => setHoveredStudentId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudentId(s.id || s.seatId);
                        setEditingStudent(s);
                      }}
                      className={`absolute rounded-lg transition-all duration-150 pointer-events-auto cursor-pointer p-0.5 ${borderClass}`}
                      style={positionStyle}
                      title={`Click to edit ${s.studentName}'s ROI`}
                    >
                      {/* Top Label: Clean Student Identifier + Confirmed FLAGGED tag only */}
                      <div className="flex items-center justify-between pointer-events-none -mt-2.5 mx-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-1 ${tagBg}`}>
                          <User className="w-2.5 h-2.5" />
                          <span>{s.studentName}</span>
                        </span>

                        {isFlagged && (
                          <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm animate-bounce">
                            FLAGGED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Video HUD Information */}
          <div className="absolute top-2 left-3 flex items-center space-x-2 z-30 pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-sm text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono flex items-center space-x-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{video.name}</span>
            </div>
            <span className="bg-blue-900/80 backdrop-blur-sm text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-700">
              {studentROIs.length} Manual ROIs
            </span>
          </div>
        </div>

        {/* DETECTION DEBUG SIDE / BOTTOM PANEL (Visible only when Visual Match Debug is ON) */}
        {showVisualDebug && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 text-slate-200 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
                <Layers className="w-4 h-4" />
                <span>Traditional CV Detection Debug Panel</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Expanded Association Scoring & Boundary Analysis
              </span>
            </div>

            {visualContours && visualContours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {visualContours.map((vc, idx) => (
                  <div key={vc.id || idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-1">
                      <span>Movement #{idx + 1}</span>
                      <span className={vc.isFlagged ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>
                        {vc.isFlagged ? 'FLAGGED' : 'NORMAL'}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">Bounding Box: </span>
                      <span>({vc.box.x}, {vc.box.y}, {vc.box.width}×{vc.box.height})</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">Assigned ROI: </span>
                      <strong className="text-white">{vc.studentName}</strong> ({vc.studentKey || 'Desk'})
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-900">
                      <span>Overlap: <strong className="text-cyan-400">{vc.overlapPct}%</strong></span>
                      <span>Center: ({vc.center.x}, {vc.center.y})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-slate-500 text-xs font-mono">
                No active movement contours currently detected in this frame.
              </div>
            )}
          </div>
        )}

        {/* Video Player Controls & CV Action Bar */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          {/* Seekbar */}
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-semibold text-blue-600 min-w-[38px]">
              {formatSeconds(currentPlaybackTime)}
            </span>
            <input
              type="range"
              min={0}
              max={video.duration || 330}
              step={1}
              value={currentPlaybackTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCurrentPlaybackTime(val);
                if (videoRef.current) videoRef.current.currentTime = val;
              }}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="font-mono text-xs text-slate-500 min-w-[38px]">
              {formatSeconds(video.duration)}
            </span>
          </div>

          {/* Buttons & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                  setCurrentPlaybackTime(0);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Rewind to start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{video.file ? 'Replace Video' : 'Choose MP4 File'}</span>
              </button>
            </div>

            {/* Run Traditional CV Analysis */}
            <div>
              {detectionState === 'idle' && (
                <button
                  onClick={startMovementDetection}
                  disabled={studentROIs.length === 0}
                  className="btn-blue text-xs flex items-center space-x-2 shadow-sm py-2 px-3.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Traditional CV Movement Detection</span>
                </button>
              )}

              {detectionState === 'processing' && (
                <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing Frames ({detectionProgress?.percent || 0}%)</span>
                </div>
              )}

              {detectionState === 'completed' && (
                <button
                  onClick={startMovementDetection}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                    incidents.length > 0
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700'
                  }`}
                  title="Click to re-run OpenCV analysis"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {incidents.length > 0
                      ? `CV Complete: Potential suspicious movement detected — review required (${incidents.length})`
                      : 'CV Complete: No Violations Detected (Clean)'}
                  </span>
                </button>
              )}

              {detectionState === 'failed' && (
                <button
                  onClick={startMovementDetection}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-xs font-semibold transition-colors shadow-sm"
                  title="Click to retry OpenCV analysis"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Detection Failed (Retry)</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time processing status message */}
          {detectionState === 'processing' && detectionProgress?.message && (
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span className="truncate">{detectionProgress.message}</span>
              {detectionProgress.totalFrames > 0 && (
                <span className="text-slate-400 shrink-0 ml-2">
                  Frame {detectionProgress.currentFrame || 0} / {detectionProgress.totalFrames}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Honest Error Banner if OpenCV processing fails */}
      {detectionState === 'failed' && detectionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 shadow-sm flex items-start space-x-3 animate-fadeIn">
          <div className="p-2 rounded-xl bg-red-600 text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
              OpenCV Analysis Error
            </h4>
            <p className="text-xs text-red-700 mt-1 font-mono break-words">
              {detectionError}
            </p>
            <div className="mt-2.5">
              <button
                onClick={startMovementDetection}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Potential Suspicious Movement Banner */}
      {detectionState === 'completed' && incidents.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-xs flex items-center space-x-3 animate-fadeIn">
          <div className="p-2 rounded-xl bg-amber-600 text-white shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800">
              Potential Suspicious Movement Detected — Review Required ({incidents.length} event{incidents.length > 1 ? 's' : ''})
            </div>
            <div className="text-xs text-amber-700 mt-0.5">
              Traditional OpenCV movement tracking identified boundary violations outside assigned student ROIs.
            </div>
          </div>
        </div>
      )}

      {/* Clean Zero-Incidents Confirmation Banner */}
      {detectionState === 'completed' && incidents.length === 0 && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-xs flex items-center space-x-3 animate-fadeIn">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800">
              Analysis Completed — No Violations Detected
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">
              Traditional OpenCV movement tracking confirmed all students remained within their assigned seating ROIs.
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Boundary Violation Alert Banner */}
      {activeAlert && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-sm">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white tracking-wider uppercase">
                  {activeAlert.type === 'NEIGHBOR_ZONE_MOVEMENT' ? 'NEIGHBOR ZONE VIOLATION' : 'BOUNDARY VIOLATION'}
                </span>
                <span className="text-xs font-mono text-red-700 font-semibold">{activeAlert.timestamp}</span>
              </div>
              <p className="text-xs text-slate-800 mt-1">
                Student: <strong className="text-red-700 font-bold">{activeAlert.studentName}</strong> (Row {activeAlert.row}, Bench {activeAlert.bench}, Seat {activeAlert.seat}) • Outside Ratio: <strong className="text-slate-900 font-bold">{Math.round((activeAlert.outsideRatio || 0.35) * 100)}%</strong> • Duration: <strong className="text-blue-700">{activeAlert.duration}s</strong>
                {activeAlert.relatedStudent && (
                  <span className="ml-1 text-red-600 font-semibold">→ Encroaching towards {activeAlert.relatedStudent}</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-red-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal for adding/editing a student ROI */}
      <StudentModal />
    </div>
  );
};

export default VideoSection;
