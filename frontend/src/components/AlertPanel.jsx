import React from 'react';
import { Smartphone, AlertTriangle, CheckCircle2, Clock, XCircle, X, ShieldAlert } from 'lucide-react';
import { useDetection } from '../context/DetectionContext';

const AlertPanel = () => {
  const { activeAlert, dismissActiveAlert, handleUpdateStatus } = useDetection();

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short">
      <div className="glass-panel bg-dark-900/95 border-2 border-alert-500/80 rounded-2xl p-5 shadow-glow-alert backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-alert-500/20 text-red-400 border border-alert-500/40">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  LIVE AI ALERT
                </span>
                <span className="text-xs text-slate-400 font-mono">{activeAlert.timestamp}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">Mobile Phone Detected</h4>
            </div>
          </div>

          <button
            onClick={dismissActiveAlert}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Details (Neutral Language) */}
        <div className="mt-3.5 p-3 rounded-xl bg-dark-800/80 border border-slate-700/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Location:</span>
            <span className="font-semibold text-white">{activeAlert.camera} • {activeAlert.room}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Target Student:</span>
            <span className="font-semibold text-amber-300">{activeAlert.studentName} ({activeAlert.studentId})</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Model Confidence:</span>
            <span className="font-bold text-brand-400">{activeAlert.confidence}% Confidence</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-700/50">
            <span className="text-slate-400">Status:</span>
            <span className="text-amber-400 font-medium">Requires Invigilator Review</span>
          </div>
        </div>

        {/* Invigilator Action Buttons */}
        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={() => {
              handleUpdateStatus(activeAlert.id, 'Confirmed');
              dismissActiveAlert();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-glow-alert"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm Alert</span>
          </button>

          <button
            onClick={() => {
              handleUpdateStatus(activeAlert.id, 'Review Required');
              dismissActiveAlert();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Mark For Review</span>
          </button>

          <button
            onClick={dismissActiveAlert}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
