import React from 'react';
import { Smartphone, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { ConfidenceBadge } from './DetectionBadge';

const DetectionTimeline = ({ detections = [], currentSeekTime = 0, onSeekTo }) => {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detection Timeline</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">{detections.length} Events</span>
      </div>

      <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        {detections.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No phone detections logged yet for this footage.
          </div>
        ) : (
          detections.map((det) => {
            const isCurrentlyActive = Math.abs((det.timeSec || 0) - currentSeekTime) <= 2.5;

            return (
              <div
                key={det.id}
                onClick={() => onSeekTo && onSeekTo(det.timeSec || 0)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isCurrentlyActive
                    ? 'bg-alert-500/15 border-alert-500/50 shadow-glow-alert'
                    : 'bg-dark-850/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isCurrentlyActive ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                  }`}>
                    <Smartphone className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-brand-400">{det.timestamp}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-semibold text-white">{det.studentId}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                      {det.studentName || 'Mobile phone detected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <ConfidenceBadge confidence={det.confidence} />
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DetectionTimeline;
