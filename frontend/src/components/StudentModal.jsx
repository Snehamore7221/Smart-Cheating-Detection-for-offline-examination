import React, { useState, useEffect } from 'react';
import { User, X, Check, Trash2, MapPin, Layers } from 'lucide-react';
import { useExam } from '../context/ExamContext';

const StudentModal = () => {
  const {
    studentROIs,
    pendingDrawnROI,
    setPendingDrawnROI,
    addStudentROI,
    editingStudent,
    setEditingStudent,
    updateStudentROI,
    removeStudentROI
  } = useExam();

  const isAddingNew = !!pendingDrawnROI;
  const isEditing = !!editingStudent;

  const [studentName, setStudentName] = useState('');
  const [row, setRow] = useState(1);
  const [bench, setBench] = useState(1);
  const [seat, setSeat] = useState(1);

  // Manual coordinate overrides
  const [roiX, setRoiX] = useState(0);
  const [roiY, setRoiY] = useState(0);
  const [roiW, setRoiW] = useState(100);
  const [roiH, setRoiH] = useState(100);

  useEffect(() => {
    if (pendingDrawnROI) {
      const nextCount = (studentROIs ? studentROIs.length : 0) + 1;
      setStudentName(`Student ${nextCount}`);
      setRow(Math.ceil(nextCount / 2));
      setBench(((nextCount - 1) % 2) + 1);
      setSeat(((nextCount - 1) % 2) + 1);
      setRoiX(pendingDrawnROI.x || 0);
      setRoiY(pendingDrawnROI.y || 0);
      setRoiW(pendingDrawnROI.width || 100);
      setRoiH(pendingDrawnROI.height || 100);
    } else if (editingStudent) {
      setStudentName(editingStudent.studentName || '');
      setRow(editingStudent.row || 1);
      setBench(editingStudent.bench || 1);
      setSeat(editingStudent.seat || 1);
      setRoiX(editingStudent.roi?.x || 0);
      setRoiY(editingStudent.roi?.y || 0);
      setRoiW(editingStudent.roi?.width || 100);
      setRoiH(editingStudent.roi?.height || 100);
    }
  }, [pendingDrawnROI, editingStudent, studentROIs]);

  if (!isAddingNew && !isEditing) return null;

  const handleClose = () => {
    setPendingDrawnROI(null);
    setEditingStudent(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = studentName.trim() || `Student R${row}-B${bench}-S${seat}`;

    if (isAddingNew) {
      addStudentROI({
        studentName: cleanName,
        row: Number(row),
        bench: Number(bench),
        seat: Number(seat),
        nativeW: pendingDrawnROI.nativeW || 1920,
        nativeH: pendingDrawnROI.nativeH || 1080,
        pctX: pendingDrawnROI.pctX,
        pctY: pendingDrawnROI.pctY,
        pctW: pendingDrawnROI.pctW,
        pctH: pendingDrawnROI.pctH,
        roi: {
          x: Number(roiX),
          y: Number(roiY),
          width: Number(roiW),
          height: Number(roiH)
        }
      });
    } else if (isEditing && editingStudent) {
      updateStudentROI(editingStudent.id, {
        studentName: cleanName,
        row: Number(row),
        bench: Number(bench),
        seat: Number(seat),
        nativeW: editingStudent.nativeW || 1920,
        nativeH: editingStudent.nativeH || 1080,
        roi: {
          x: Number(roiX),
          y: Number(roiY),
          width: Number(roiW),
          height: Number(roiH)
        }
      });
    }
  };

  const handleDelete = () => {
    if (editingStudent && editingStudent.id) {
      if (window.confirm(`Delete ROI for ${editingStudent.studentName}?`)) {
        removeStudentROI(editingStudent.id);
        setEditingStudent(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAddingNew ? 'Configure Drawn Student ROI' : 'Edit Student Details & ROI'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAddingNew ? 'Rectangle drawn on video. Enter student metadata.' : 'Modify assigned seat and monitoring boundary.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Sneha, Rahul, Student A"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Row, Bench, Seat Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Row Number
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={row}
                onChange={(e) => setRow(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Bench Number
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={bench}
                onChange={(e) => setBench(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Seat on Bench
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={seat}
                onChange={(e) => setSeat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Original Video Resolution Coordinates Display / Fine-tuning */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Original Video ROI Coordinates (1920×1080)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Native Pixels</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">X (px)</span>
                <input
                  type="number"
                  value={roiX}
                  onChange={(e) => setRoiX(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Y (px)</span>
                <input
                  type="number"
                  value={roiY}
                  onChange={(e) => setRoiY(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Width (px)</span>
                <input
                  type="number"
                  value={roiW}
                  onChange={(e) => setRoiW(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Height (px)</span>
                <input
                  type="number"
                  value={roiH}
                  onChange={(e) => setRoiH(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono text-slate-900"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">
              Coordinates are locked to original video resolution and scale responsively.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ROI</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="btn-blue text-xs flex items-center space-x-1.5 py-2 px-4 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{isAddingNew ? 'Save Student ROI' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
