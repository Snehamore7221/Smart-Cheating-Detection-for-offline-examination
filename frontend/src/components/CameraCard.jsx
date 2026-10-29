import React, { useState } from 'react';
import { Maximize2, Radio, Smartphone, Users, ShieldAlert, Eye } from 'lucide-react';

const CameraCard = ({ camera, onInspect }) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const hasPhones = camera.phonesDetected > 0;

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col group hover:border-slate-700 transition-all duration-200">
      {/* Card Header */}
      <div className="p-4 bg-dark-850/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-white tracking-wide">{camera.id}</h4>
            <p className="text-[11px] text-slate-400 font-medium">{camera.room}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-[11px] font-medium text-slate-300 bg-dark-700/80 px-2 py-1 rounded-lg border border-slate-700/60">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span>{camera.studentsCount} Students</span>
          </div>

          <div className={`flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
            hasPhones
              ? 'bg-alert-500/20 text-red-400 border-red-500/40 animate-pulse-subtle'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <Smartphone className="w-3.5 h-3.5" />
            <span>{camera.phonesDetected} {camera.phonesDetected === 1 ? 'Phone' : 'Phones'}</span>
          </div>
        </div>
      </div>

      {/* CCTV Camera Canvas Feed Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden select-none">
        {/* Synthetic Classroom Graphic Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-dark-900 opacity-90"></div>

        {/* Perspective Classroom Desks Representation */}
        <div className="absolute inset-0 flex flex-col justify-around p-6 opacity-60">
          <div className="grid grid-cols-4 gap-4 h-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-slate-800 rounded-lg bg-slate-800/30 flex flex-col items-center justify-center p-2 relative">
                <div className="w-8 h-8 rounded-full bg-slate-700/60 mb-1 border border-slate-600/40 flex items-center justify-center text-[9px] text-slate-400 font-mono">
                  S-{i + 1}
                </div>
                <div className="w-full h-3 bg-slate-700/40 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* CCTV Watermark HUD */}
        <div className="absolute top-3 left-3 flex items-center space-x-2 bg-dark-900/80 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>{camera.id} • {camera.fps} FPS • {camera.resolution}</span>
        </div>

        {/* Detection Bounding Boxes */}
        {showBoxes && camera.activeDetections && camera.activeDetections.map((det) => (
          <div
            key={det.id}
            className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-glow-alert flex flex-col justify-between transition-all duration-300 pointer-events-none"
            style={{
              left: `${det.box.x}%`,
              top: `${det.box.y}%`,
              width: `${det.box.w}%`,
              height: `${det.box.h}%`,
            }}
          >
            {/* Top Label Tag */}
            <div className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-t flex items-center justify-between tracking-wider shadow">
              <span className="flex items-center space-x-1">
                <Smartphone className="w-2.5 h-2.5" />
                <span>PHONE</span>
              </span>
              <span>{det.confidence}%</span>
            </div>

            {/* Bottom Student Tag */}
            <div className="bg-dark-900/90 text-amber-300 text-[8px] font-mono px-1 py-0.5 text-center border-t border-red-500/40">
              {det.studentId}
            </div>
          </div>
        ))}

        {/* Hover Controls */}
        <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 backdrop-blur-[2px]">
          <button
            onClick={() => onInspect && onInspect(camera)}
            className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold shadow-glow-brand hover:bg-brand-500 transition-colors flex items-center space-x-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Inspect Camera</span>
          </button>
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="p-3 bg-dark-900 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Feed Synchronized</span>
        </span>
        <button
          onClick={() => setShowBoxes(!showBoxes)}
          className="text-xs text-brand-400 hover:text-brand-300 font-medium"
        >
          {showBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
        </button>
      </div>
    </div>
  );
};

export default CameraCard;
