import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Smartphone,
  Cctv,
  Save,
  CheckCircle2,
  Lock,
  Bell,
  Eye,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';

const SettingsPage = () => {
  const { confidenceThreshold, handleSetConfidenceThreshold } = useDetection();
  const [threshold, setThreshold] = useState(confidenceThreshold || 75);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveLogs, setAutoSaveLogs] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    handleSetConfidenceThreshold(threshold);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Settings className="w-6 h-6 text-brand-400" />
            <span>Surveillance System Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure AI computer vision confidence filters, active object classes, and camera streams
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-brand transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved and applied to all live detection pipelines successfully.</span>
        </div>
      )}

      {/* 1. Detection Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Detection Sensitivity</h3>
            <p className="text-xs text-slate-400">Control YOLOv8 confidence thresholds for mobile phone triggers</p>
          </div>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Confidence Threshold:</span>
            <span className="font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/30">
              {threshold}%
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={95}
            step={1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>50% (More sensitive)</span>
            <span>75% (Recommended standard)</span>
            <span>95% (High precision)</span>
          </div>
        </div>

        {/* Object Classes Checkbox Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Surveillance Detection Classes:</span>
            <span className="text-[11px] text-brand-400 font-medium">Focused Surveillance Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Active Class: Mobile Phone */}
            <label className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/40 flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2.5 text-white font-semibold">
                <input type="checkbox" checked readOnly className="accent-brand-500 rounded w-4 h-4" />
                <Smartphone className="w-4 h-4 text-brand-400" />
                <span>Mobile Phone (YOLOv8)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                ACTIVE
              </span>
            </label>

            {/* Disabled Classes */}
            <label className="p-3 rounded-xl bg-dark-850/50 border border-slate-800/80 flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="flex items-center space-x-2.5 text-slate-400 font-medium">
                <input type="checkbox" disabled className="rounded w-4 h-4" />
                <span>Suspicious Body Motion</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-500 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Disabled</span>
              </span>
            </label>

            <label className="p-3 rounded-xl bg-dark-850/50 border border-slate-800/80 flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="flex items-center space-x-2.5 text-slate-400 font-medium">
                <input type="checkbox" disabled className="rounded w-4 h-4" />
                <span>Head / Gaze Tracking</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-500 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Disabled</span>
              </span>
            </label>

            <label className="p-3 rounded-xl bg-dark-850/50 border border-slate-800/80 flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="flex items-center space-x-2.5 text-slate-400 font-medium">
                <input type="checkbox" disabled className="rounded w-4 h-4" />
                <span>Whispering / Audio</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-500 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Disabled</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Camera Configuration Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Cctv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">CCTV Hardware Feed Configuration</h3>
            <p className="text-xs text-slate-400">Manage input video stream parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Primary Feed Resolution</label>
            <select className="w-full bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500">
              <option>1080p FHD (1920 × 1080) — High Accuracy</option>
              <option>720p HD (1280 × 720) — Standard</option>
              <option>4K UHD (3840 × 2160) — Ultra High</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Inference Sampling Rate</label>
            <select className="w-full bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500">
              <option>30 FPS (Full Real-Time Stream)</option>
              <option>15 FPS (Resource Optimized)</option>
              <option>10 FPS (Low Latency)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. System & Notification Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Invigilator Notification Preferences</h3>
            <p className="text-xs text-slate-400">Control alert popups and evidence storage</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-white block">Real-time Alert Banner</span>
              <span className="text-slate-400 text-[11px]">Show floating notifications when a phone is detected</span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="accent-brand-500 rounded w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-white block">Auto-Save Detection Log Audit</span>
              <span className="text-slate-400 text-[11px]">Persist all timestamped detections to examination database</span>
            </div>
            <input
              type="checkbox"
              checked={autoSaveLogs}
              onChange={(e) => setAutoSaveLogs(e.target.checked)}
              className="accent-brand-500 rounded w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
