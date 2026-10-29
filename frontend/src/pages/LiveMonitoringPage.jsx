import React, { useState } from 'react';
import { Cctv, Radio, Smartphone, Users, Maximize2, X, ShieldAlert, Sparkles, Filter, RefreshCw } from 'lucide-react';
import CameraCard from '../components/CameraCard';
import { useDetection } from '../context/DetectionContext';

const LiveMonitoringPage = () => {
  const { cameras, stats, handleUpdateStatus } = useDetection();
  const [selectedInspectCamera, setSelectedInspectCamera] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'focus'

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Cctv className="w-6 h-6 text-brand-400" />
            <span>Live CCTV Examination Monitoring</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized multi-camera surveillance with real-time AI mobile phone detection overlays
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>4 FEEDS STREAMING (30 FPS)</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold animate-pulse-subtle">
            <Smartphone className="w-4 h-4" />
            <span>{stats.phonesDetected} Active Detections</span>
          </div>
        </div>
      </div>

      {/* 4-Camera CCTV Multi-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            onInspect={(cam) => setSelectedInspectCamera(cam)}
          />
        ))}
      </div>

      {/* Camera Inspection Modal */}
      {selectedInspectCamera && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel bg-dark-900 border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  ● LIVE STREAM
                </span>
                <h3 className="text-sm font-bold text-white">
                  {selectedInspectCamera.name} • {selectedInspectCamera.room}
                </h3>
              </div>

              <button
                onClick={() => setSelectedInspectCamera(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Canvas Viewport */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-dark-950 opacity-90"></div>
              <div className="absolute inset-0 grid-bg opacity-30"></div>

              {/* HUD */}
              <div className="absolute top-4 left-4 bg-dark-900/80 px-3 py-1 rounded text-xs font-mono text-slate-300 border border-slate-800">
                {selectedInspectCamera.id} • {selectedInspectCamera.resolution} • LOW LATENCY STREAM
              </div>

              {/* Bounding Boxes on Full View */}
              {selectedInspectCamera.activeDetections.map((det) => (
                <div
                  key={det.id}
                  className="absolute border-2 border-red-500 bg-red-500/25 rounded-lg shadow-glow-alert flex flex-col justify-between"
                  style={{
                    left: `${det.box.x}%`,
                    top: `${det.box.y}%`,
                    width: `${det.box.w}%`,
                    height: `${det.box.h}%`,
                  }}
                >
                  <div className="bg-red-600 text-white font-black text-xs px-2 py-0.5 rounded-t flex items-center justify-between tracking-wider">
                    <span>PHONE DETECTED</span>
                    <span>{det.confidence}%</span>
                  </div>
                  <div className="bg-dark-900/90 text-amber-300 text-[10px] font-mono px-2 py-0.5 text-center">
                    {det.studentName} ({det.studentId}) • {det.seat}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-dark-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <span>Students: <strong className="text-white">{selectedInspectCamera.studentsCount}</strong></span>
                <span>Active Detections: <strong className="text-red-400">{selectedInspectCamera.phonesDetected}</strong></span>
              </div>

              <button
                onClick={() => setSelectedInspectCamera(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
              >
                Close Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitoringPage;
