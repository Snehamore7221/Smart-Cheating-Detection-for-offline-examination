import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Clock, Calendar, Sparkles, AlertTriangle } from 'lucide-react';
import { useDetection } from '../context/DetectionContext';

const Header = () => {
  const { stats, activeAlert, alertHistory, triggerMockAlert } = useDetection();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="bg-dark-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center space-x-2.5">
          <h2 className="text-lg font-bold text-white tracking-tight">Smart Cheating Detection</h2>
          <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>AI YOLOv8 Phone Detector</span>
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          AI-powered examination surveillance & real-time mobile phone detection
        </p>
      </div>

      {/* Status Indicators & Live Clock */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Exam Session Status */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-slate-700/60 text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-medium text-slate-200">Exam Hall Session A</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">120 Seated</span>
        </div>

        {/* Date & Time Widget */}
        <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-dark-800 border border-slate-700/60 text-slate-300">
          <div className="flex items-center space-x-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-slate-200 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* AI Detection Active Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AI Detection Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
