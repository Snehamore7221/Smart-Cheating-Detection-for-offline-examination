import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  X,
  Play,
  Calendar,
  Layers,
  ShieldAlert,
  User,
  Activity
} from 'lucide-react';
import { useExam } from '../context/ExamContext';

const IncidentModal = () => {
  const navigate = useNavigate();
  const { selectedIncidentForModal, setSelectedIncidentForModal, handleSeekVideo } = useExam();

  if (!selectedIncidentForModal) return null;

  const incident = selectedIncidentForModal;
  const isNeighbor = incident.type === 'NEIGHBOR_ZONE_MOVEMENT';

  const handleViewInVideo = () => {
    handleSeekVideo(incident.timeSec || 0, incident.seatId);
    setSelectedIncidentForModal(null);
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl text-white ${isNeighbor ? 'bg-red-600' : 'bg-amber-600'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded text-white uppercase tracking-wider ${
                  isNeighbor ? 'bg-red-600' : 'bg-amber-600'
                }`}>
                  {isNeighbor ? 'NEIGHBOR ZONE' : 'BOUNDARY VIOLATION'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">{incident.id}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Suspicious Movement Incident Details
              </h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedIncidentForModal(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Traditional CV Frame Snapshot Preview */}
        <div className="relative aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>

          <div className="relative z-10 text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-xs font-mono font-bold text-white">TIMESTAMP: {incident.timestamp}</p>
            <p className="text-[11px] text-slate-400">Traditional OpenCV Motion Mask Verified</p>
          </div>

          {/* Student ROI boundary overlay simulation */}
          <div
            className="absolute border-2 border-amber-400 bg-amber-500/20 rounded-lg shadow-lg flex flex-col justify-between"
            style={{
              left: '30%',
              top: '25%',
              width: '40%',
              height: '55%',
            }}
          >
            <span className="bg-amber-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-t block tracking-wider text-center">
              ROI: {incident.studentName} (R{incident.row}-B{incident.bench}-S{incident.seat})
            </span>
            <span className="bg-red-600/90 text-white font-mono text-[8px] p-0.5 text-center">
              Outside Ratio: {Math.round((incident.outsideRatio || 0.35) * 100)}% ({incident.duration}s)
            </span>
          </div>
        </div>

        {/* Incident Details Summary Table */}
        <div className="p-5 space-y-3.5 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Student</span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">{incident.studentName}</span>
              <span className="text-[11px] font-mono text-slate-500">
                Row {incident.row} • Bench {incident.bench} • Seat {incident.seat}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Outside Movement Ratio</span>
              <span className="text-sm font-bold text-red-600 block mt-0.5">
                {Math.round((incident.outsideRatio || 0.35) * 100)}% Outside Assigned ROI
              </span>
              <span className="text-[11px] text-slate-500">Duration: {incident.duration}s</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Detection Timestamp</span>
              <span className="text-sm font-mono font-bold text-slate-900 block mt-0.5">{incident.timestamp}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Review Status</span>
              <span className="text-sm font-bold text-amber-700 block mt-0.5">
                {incident.status || 'Needs Review'}
              </span>
              {incident.relatedStudent && (
                <span className="text-[10px] text-red-600 font-semibold block">
                  Encroached on: {incident.relatedStudent}
                </span>
              )}
            </div>
          </div>

          {incident.reason && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <strong>Observation: </strong>{incident.reason}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setSelectedIncidentForModal(null)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleViewInVideo}
            className="btn-blue text-xs flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>View in Video ({incident.timestamp})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;
