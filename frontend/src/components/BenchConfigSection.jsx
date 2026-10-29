import React, { useState } from 'react';
import {
  User,
  PlusCircle,
  Sliders,
  ShieldAlert,
  Edit2,
  Trash2,
  RotateCcw,
  Activity,
  MapPin,
  ChevronRight,
  Info,
  Check,
  X
} from 'lucide-react';
import { useExam } from '../context/ExamContext';

const BenchConfigSection = () => {
  const {
    studentROIs,
    removeStudentROI,
    clearAllStudentROIs,
    resetToDefaultROIs,
    setIsDrawingMode,
    setEditingStudent,
    hoveredStudentId,
    setHoveredStudentId,
    selectedStudentId,
    setSelectedStudentId,
    cvThresholds,
    updateCVThresholds,
    incidents,
    clearAllIncidents,
    handleSeekVideo
  } = useExam();

  // CV Parameters local form state
  const [minAreaInput, setMinAreaInput] = useState(cvThresholds.minMovementArea);
  const [outsideRatioInput, setOutsideRatioInput] = useState(cvThresholds.outsideRatioThreshold);
  const [persistenceInput, setPersistenceInput] = useState(cvThresholds.minPersistenceFrames);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleApplyCVThresholds = (e) => {
    e.preventDefault();
    updateCVThresholds({
      minMovementArea: Number(minAreaInput),
      outsideRatioThreshold: Number(outsideRatioInput),
      minPersistenceFrames: Number(persistenceInput)
    });
  };

  const handleConfirmClearIncidents = async () => {
    await clearAllIncidents();
    setShowClearConfirm(false);
  };

  const totalFlaggedCount = studentROIs.filter((s) => s.visualState === 'FLAGGED').length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Manual Student ROIs & Boundary Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty manually creates each student's monitoring area by drawing on the video
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            {studentROIs.length} Defined Students
          </span>
          {totalFlaggedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold border border-red-200 flex items-center space-x-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{totalFlaggedCount} Flagged</span>
            </span>
          )}
        </div>
      </div>

      {/* 1. Quick ROI Management Action Card */}
      <div className="app-card p-4 border border-slate-200 bg-slate-50/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setIsDrawingMode(true)}
            className="btn-blue text-xs flex items-center space-x-2 py-2 px-3.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Draw Student ROI on Video</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetToDefaultROIs}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
              title="Reset to sample student ROIs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample ROIs</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear all student ROIs?')) {
                  clearAllStudentROIs();
                }
              }}
              disabled={studentROIs.length === 0}
              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold transition-colors disabled:opacity-40 flex items-center space-x-1"
              title="Remove all student ROIs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear ROIs</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-600">
          <strong>Workflow:</strong> Click <em>"Draw Student ROI on Video"</em>, drag a box over a student in the surveillance recording, and enter their Name and Row/Bench/Seat details.
        </p>
      </div>

      {/* 2. Traditional CV Parameter Thresholds Configuration */}
      <div className="app-card p-4 border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-xs">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Traditional Computer Vision Thresholds (Non-AI)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">OpenCV Heuristics</span>
        </div>

        <form onSubmit={handleApplyCVThresholds} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              MIN_MOVEMENT_AREA (px)
            </label>
            <input
              type="number"
              min={100}
              max={5000}
              step={50}
              value={minAreaInput}
              onChange={(e) => setMinAreaInput(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              title="Minimum movement area in pixels to ignore writing and pen tip jitters"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              OUTSIDE_RATIO_THRESH
            </label>
            <input
              type="number"
              min={0.1}
              max={0.9}
              step={0.02}
              value={outsideRatioInput}
              onChange={(e) => setOutsideRatioInput(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              title="Fraction of movement that must extend outside the student's assigned ROI"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              MIN_PERSISTENCE (Frames)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={persistenceInput}
              onChange={(e) => setPersistenceInput(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              title="Number of consecutive frames movement must persist to avoid false alarms"
            />
          </div>

          <button
            type="submit"
            className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Save Parameters
          </button>
        </form>
      </div>

      {/* 3. Manually Defined Student ROIs List */}
      <div className="app-card p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Configured Student ROIs ({studentROIs.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Click student to edit details or fine-tune bounding box
          </span>
        </div>

        {studentROIs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <User className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">No student ROIs defined yet.</p>
            <button
              onClick={() => setIsDrawingMode(true)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Click here to draw your first student on the video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {studentROIs.map((student) => {
              const isHovered = hoveredStudentId === student.id || hoveredStudentId === student.seatId;
              const isSelected = selectedStudentId === student.id || selectedStudentId === student.seatId;
              const isFlagged = student.visualState === 'FLAGGED';

              return (
                <div
                  key={student.id}
                  onMouseEnter={() => setHoveredStudentId(student.id)}
                  onMouseLeave={() => setHoveredStudentId(null)}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    isFlagged
                      ? 'bg-red-50/90 border-red-300 text-red-950 shadow-xs'
                      : isHovered || isSelected
                      ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-inherit">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-extrabold text-sm text-slate-900 truncate">
                        {student.studentName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStudent(student);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        title="Edit Student Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete ROI for ${student.studentName}?`)) {
                            removeStudentROI(student.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Student ROI"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-blue-700">
                        Row {student.row} • Bench {student.bench} • Seat {student.seat}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {student.seatId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                      <span>ROI: {student.roi.width}x{student.roi.height}px</span>
                      <span>Pos: ({student.roi.x}, {student.roi.y})</span>
                    </div>
                  </div>

                  {student.incidentsCount > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-700">
                        {student.incidentsCount} {student.incidentsCount === 1 ? 'event' : 'events'} recorded
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (student.lastIncident) {
                            handleSeekVideo(student.lastIncident.timeSec, student.seatId);
                          }
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Jump Video →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Live Suspicious Movement & Boundary Violation Incidents List */}
      <div className="app-card p-5 border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-200 gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Detected Movement Incidents ({incidents.length})
            </h3>
          </div>

          {incidents.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold border border-red-200 transition-colors flex items-center space-x-1"
              title="Clear all recorded incidents"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Incidents</span>
            </button>
          )}
        </div>

        {incidents.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No boundary violations detected yet. Run detection to analyze the video.
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {incidents.map((inc) => {
              const isNeighbor = inc.type === 'NEIGHBOR_ZONE_MOVEMENT';

              return (
                <div
                  key={inc.id || inc._id}
                  onClick={() => handleSeekVideo(inc.timeSec, inc.seatId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] ${
                    isNeighbor
                      ? 'bg-red-50/90 border-red-300 text-red-950 hover:border-red-400'
                      : 'bg-amber-50/80 border-amber-300 text-amber-950 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white ${
                          isNeighbor ? 'bg-red-600' : 'bg-amber-600'
                        }`}
                      >
                        {isNeighbor ? 'NEIGHBOR ZONE' : 'BOUNDARY VIOLATION'}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{inc.studentName}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        (R{inc.row}-B{inc.bench}-S{inc.seat})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700">
                      {inc.reason ||
                        `Movement crossed ${Math.round(inc.outsideRatio * 100)}% outside ROI for ${inc.duration}s`}
                      {inc.relatedStudent && (
                        <strong className="text-red-700 ml-1">→ Encroaching on {inc.relatedStudent}</strong>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span className="font-mono text-xs font-bold text-blue-700 block">
                      {inc.timestamp}
                    </span>
                    <span className="text-[9px] text-slate-500 flex items-center justify-end space-x-0.5 mt-0.5">
                      <span>Jump</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clearing Incidents */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Clear Incident History?
              </h3>
              <p className="text-xs text-slate-500">
                This will permanently remove all {incidents.length} recorded incidents.
              </p>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 text-left mt-3">
                <strong>Note:</strong> Student ROIs, names, and bench configurations will <u>NOT</u> be deleted.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearIncidents}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchConfigSection;
