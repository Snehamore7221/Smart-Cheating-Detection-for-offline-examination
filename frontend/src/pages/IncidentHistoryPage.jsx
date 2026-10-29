import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  ShieldAlert,
  Users,
  Clock,
  School,
  Play,
  ArrowRight,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Trash2,
  X,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import IncidentModal from '../components/IncidentModal';
import { useExam } from '../context/ExamContext';

const IncidentHistoryPage = () => {
  const navigate = useNavigate();
  const {
    incidents,
    studentROIs,
    setSelectedIncidentForModal,
    handleSeekVideo,
    clearAllIncidents
  } = useExam();

  const [selectedBenchFilter, setSelectedBenchFilter] = useState('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Compute Summary Statistics
  const totalIncidentsCount = incidents.length;
  const uniqueFlaggedStudents = new Set(incidents.map((i) => i.studentName)).size;
  const uniqueFlaggedBenches = new Set(incidents.map((i) => `B${i.bench || 1}`)).size;
  const lastIncidentTime = incidents.length > 0 ? incidents[incidents.length - 1].timestamp : 'None';

  const filteredIncidents = incidents.filter((inc) => {
    if (selectedBenchFilter === 'ALL') return true;
    return `B${inc.bench || 1}` === selectedBenchFilter || inc.benchId === selectedBenchFilter;
  });

  const handleOpenIncident = (incident) => {
    setSelectedIncidentForModal(incident);
  };

  const handleDirectViewInVideo = (incident) => {
    handleSeekVideo(incident.timeSec || 0, incident.seatId);
    navigate('/');
  };

  const handleConfirmClear = async () => {
    await clearAllIncidents();
    setShowClearConfirm(false);
    setToastMessage('✓ Incident history cleared successfully');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2.5">
              <History className="w-6 h-6 text-blue-600" />
              <span>Suspicious Movement Incident History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Traditional Computer Vision boundary violation and neighbor zone audit trail
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Clear Flagged History Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={incidents.length === 0}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              title="Permanently remove all recorded incidents"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Flagged History</span>
            </button>

            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center space-x-2 w-fit"
            >
              <span>Back to Video & Classroom</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="app-card p-5 border border-red-200 bg-red-50/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Incidents</span>
              <div className="p-2 rounded-xl bg-red-100 text-red-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-red-600 font-sans">{totalIncidentsCount}</div>
            <p className="mt-1 text-[11px] text-slate-500">Recorded Boundary Violations</p>
          </div>

          <div className="app-card p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Students Flagged</span>
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 font-sans">{uniqueFlaggedStudents}</div>
            <p className="mt-1 text-[11px] text-slate-500">Associated With Movement Events</p>
          </div>

          <div className="app-card p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Benches Involved</span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <School className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 font-sans">{uniqueFlaggedBenches}</div>
            <p className="mt-1 text-[11px] text-slate-500">Classroom Desks Flagged</p>
          </div>

          <div className="app-card p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Latest Timestamp</span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-mono font-black text-slate-900">{lastIncidentTime}</div>
            <p className="mt-1 text-[11px] text-slate-500">Most Recent Incident Time</p>
          </div>
        </div>

        {/* Incident Table */}
        <div className="app-card border border-slate-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Suspicious Activity Audit Log ({filteredIncidents.length})
              </h3>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-semibold">Filter Bench:</span>
              <select
                value={selectedBenchFilter}
                onChange={(e) => setSelectedBenchFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-semibold focus:outline-none"
              >
                <option value="ALL">All Benches</option>
                <option value="B01">Bench 1 (B01)</option>
                <option value="B02">Bench 2 (B02)</option>
                <option value="B03">Bench 3 (B03)</option>
                <option value="B04">Bench 4 (B04)</option>
              </select>
            </div>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/80 mb-2" />
              <p className="font-semibold text-slate-600">No boundary violation incidents recorded.</p>
              <p className="text-slate-400">Classroom surveillance is clear or history has been cleared.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Incident ID</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Location (R-B-S)</th>
                    <th className="px-5 py-3">Incident Type</th>
                    <th className="px-5 py-3">Outside Ratio</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Video Time</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.map((inc) => {
                    const isNeighbor = inc.type === 'NEIGHBOR_ZONE_MOVEMENT';

                    return (
                      <tr key={inc.id || inc._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{inc.id || inc._id}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{inc.studentName}</td>
                        <td className="px-5 py-3.5 font-mono">
                          Row {inc.row}, Bench {inc.bench}, Seat {inc.seat}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              isNeighbor
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isNeighbor ? 'NEIGHBOR ZONE' : 'BOUNDARY VIOLATION'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          {Math.round((inc.outsideRatio || 0.35) * 100)}%
                        </td>
                        <td className="px-5 py-3.5 font-mono">{inc.duration}s</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-blue-700">{inc.timestamp}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                            {inc.status || 'Needs Review'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenIncident(inc)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDirectViewInVideo(inc)}
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            title="Jump to Video"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal for Clearing Flagged Incident History */}
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
                This will permanently remove all recorded incidents and reset flagged student badges.
              </p>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 text-left mt-3">
                <strong>Note:</strong> Student ROIs, student details, and classroom configurations will <u>NOT</u> be deleted.
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
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      <IncidentModal />
    </div>
  );
};

export default IncidentHistoryPage;
