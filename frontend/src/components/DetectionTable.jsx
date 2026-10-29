import React, { useState } from 'react';
import { Smartphone, Search, Filter, CheckCircle2, Clock, XCircle, ArrowUpDown } from 'lucide-react';
import { ConfidenceBadge, StatusBadge } from './DetectionBadge';

const DetectionTable = ({ detections = [], onUpdateStatus, title = "Live Detection Log", showFilters = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cameraFilter, setCameraFilter] = useState('ALL');

  const filteredDetections = detections.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.studentName && item.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.camera.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesCamera = cameraFilter === 'ALL' || item.camera === cameraFilter;

    return matchesSearch && matchesStatus && matchesCamera;
  });

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-850/60">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {filteredDetections.length} of {detections.length} recorded mobile phone detection events
          </p>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID, Student, Camera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-48 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Review Required">Review Required</option>
              <option value="Dismissed">Dismissed</option>
            </select>

            {/* Camera Filter */}
            <select
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
              className="bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Cameras</option>
              <option value="CAM-01">CAM-01 (Room A101)</option>
              <option value="CAM-02">CAM-02 (Room A102)</option>
              <option value="CAM-03">CAM-03 (Room A103)</option>
              <option value="CAM-04">CAM-04 (Room A104)</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-dark-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Detection ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Camera</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Detected Object</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredDetections.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400 text-xs">
                  No detection logs found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredDetections.map((det) => (
                <tr key={det.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* ID */}
                  <td className="py-3 px-4 font-mono font-bold text-brand-400">
                    {det.id}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {det.timestamp}
                  </td>

                  {/* Camera */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                      {det.camera}
                    </span>
                  </td>

                  {/* Student ID & Name */}
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-white">{det.studentName || det.studentId}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{det.studentId}</span>
                    </div>
                  </td>

                  {/* Object */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                      <Smartphone className="w-3.5 h-3.5 text-red-400" />
                      <span>{det.object || 'Mobile Phone'}</span>
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4">
                    <ConfidenceBadge confidence={det.confidence} />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={det.status} />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {det.status !== 'Confirmed' && (
                        <button
                          onClick={() => onUpdateStatus && onUpdateStatus(det.id, 'Confirmed')}
                          title="Confirm Detection"
                          className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirm</span>
                        </button>
                      )}

                      {det.status !== 'Review Required' && (
                        <button
                          onClick={() => onUpdateStatus && onUpdateStatus(det.id, 'Review Required')}
                          title="Mark For Review"
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Review</span>
                        </button>
                      )}

                      {det.status !== 'Dismissed' && (
                        <button
                          onClick={() => onUpdateStatus && onUpdateStatus(det.id, 'Dismissed')}
                          title="Dismiss / False Positive"
                          className="px-2 py-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/60 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Dismiss</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetectionTable;
