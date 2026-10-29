import React, { useState } from 'react';
import { Users, Search, Smartphone, ShieldAlert, CheckCircle2, Clock, Filter, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/DetectionBadge';
import { useDetection } from '../context/DetectionContext';

const StudentsPage = () => {
  const { students } = useDetection();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cameraFilter, setCameraFilter] = useState('ALL');

  const filteredStudents = students.filter(stu => {
    const matchesSearch =
      stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.seat.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || stu.status === statusFilter;
    const matchesCamera = cameraFilter === 'ALL' || stu.camera === cameraFilter;

    return matchesSearch && matchesStatus && matchesCamera;
  });

  const reviewCount = students.filter(s => s.status === 'Review Required' || s.status === 'Confirmed').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-brand-400" />
            <span>Student Seating & Monitoring Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time student seat allocation and mobile phone detection records
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-dark-800 border border-slate-700 text-slate-300">
            Total Students: <strong className="text-white font-mono">{students.length}</strong>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
            {reviewCount} Flagged For Review
          </div>
        </div>
      </div>

      {/* Academic Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">Academic Project Demonstration:</strong> All student names, IDs, and seats listed below are fictional for demonstration purposes. The AI system detects mobile phone objects and requires invigilator verification.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, ID, seat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Review Required">Review Required</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Clear">Clear</option>
          </select>

          <select
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Cameras</option>
            <option value="CAM-01">CAM-01 (Room A101)</option>
            <option value="CAM-02">CAM-02 (Room A102)</option>
            <option value="CAM-03">CAM-03 (Room A103)</option>
            <option value="CAM-04">CAM-04 (Room A104)</option>
          </select>
        </div>
      </div>

      {/* Students Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((stu) => {
          const hasDetections = stu.detectionsCount > 0;

          return (
            <div
              key={stu.id}
              className={`glass-panel p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                hasDetections
                  ? 'border-alert-500/30 hover:border-alert-500/60 bg-dark-850/80 shadow-glow-alert'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-400">{stu.id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-semibold text-slate-300">{stu.seat}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{stu.name}</h3>
                </div>

                <StatusBadge status={stu.status} />
              </div>

              {/* Details */}
              <div className="p-3 rounded-xl bg-dark-900/80 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Assigned Camera:</span>
                  <span className="font-semibold text-white">{stu.camera} ({stu.room})</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Phone Detections:</span>
                  <span className={`font-mono font-bold ${hasDetections ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stu.detectionsCount} {stu.detectionsCount === 1 ? 'Instance' : 'Instances'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Last Detection:</span>
                  <span className="font-mono text-slate-300">{stu.lastDetection}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>SEAT VERIFIED</span>
                <span>HALL-A 2026</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentsPage;
