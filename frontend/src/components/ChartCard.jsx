import React from 'react';
import { BarChart3, TrendingUp, Smartphone, Cctv, Award, FileVideo } from 'lucide-react';

export const DetectionsOverTimeChart = () => {
  // 6 intervals throughout the 3-hour exam session
  const data = [
    { time: '09:00', detections: 0 },
    { time: '09:30', detections: 1 },
    { time: '10:00', detections: 3 },
    { time: '10:30', detections: 2 },
    { time: '11:00', detections: 1 },
    { time: '11:30', detections: 0 },
  ];

  const maxDetections = 4;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <span>Phone Detections Over Time</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Timeline distribution of detected phone objects during examination</p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
          Peak at 10:00 AM
        </span>
      </div>

      {/* SVG Line / Bar visualization */}
      <div className="h-48 w-full flex items-end justify-between pt-6 pb-2 px-3 relative border-b border-slate-800">
        {/* Horizontal grid guide lines */}
        <div className="absolute inset-x-0 top-6 border-b border-slate-800/40 text-[9px] text-slate-600 pl-1">3 events</div>
        <div className="absolute inset-x-0 top-24 border-b border-slate-800/40 text-[9px] text-slate-600 pl-1">2 events</div>
        <div className="absolute inset-x-0 top-40 border-b border-slate-800/40 text-[9px] text-slate-600 pl-1">1 event</div>

        {data.map((item, idx) => {
          const heightPercent = (item.detections / maxDetections) * 100;
          return (
            <div key={idx} className="flex flex-col items-center space-y-2 group relative z-10 w-12">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-dark-900 border border-brand-500/40 text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none">
                {item.detections} {item.detections === 1 ? 'phone' : 'phones'}
              </div>

              {/* Bar column */}
              <div className="w-8 bg-dark-800/80 rounded-t-lg overflow-hidden h-36 flex items-end p-0.5 border border-slate-700/50">
                <div
                  className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 rounded-t transition-all duration-500 group-hover:from-red-500 group-hover:to-amber-400 shadow-glow-brand"
                  style={{ height: `${Math.max(8, heightPercent)}%` }}
                ></div>
              </div>

              {/* Time Label */}
              <span className="text-[11px] font-mono text-slate-400 font-medium">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CameraBreakdownChart = () => {
  const cameraData = [
    { name: 'Camera 01', room: 'Room A101', count: 2, percent: 65, color: 'from-brand-600 to-indigo-400' },
    { name: 'Camera 02', room: 'Room A102', count: 1, percent: 35, color: 'from-blue-600 to-cyan-400' },
    { name: 'Camera 03', room: 'Room A103', count: 3, percent: 90, color: 'from-red-600 to-amber-500' },
    { name: 'Camera 04', room: 'Room A104', count: 1, percent: 35, color: 'from-emerald-600 to-teal-400' },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
            <Cctv className="w-4 h-4 text-brand-400" />
            <span>Camera-wise Detections</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Distribution of detected phones by examination room camera</p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 font-mono">4 Cameras Active</span>
      </div>

      <div className="space-y-4 my-auto">
        {cameraData.map((cam, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{cam.name} <span className="text-slate-400 font-normal">({cam.room})</span></span>
              <span className="font-mono font-bold text-brand-400">{cam.count} {cam.count === 1 ? 'Phone' : 'Phones'}</span>
            </div>

            <div className="h-3 bg-dark-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className={`h-full bg-gradient-to-r ${cam.color} rounded-full transition-all duration-700`}
                style={{ width: `${cam.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SummaryStatsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5">
        <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium uppercase">Total Phones Detected</span>
          <p className="text-xl font-bold text-white">7 Phones</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5">
        <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium uppercase">Average Confidence</span>
          <p className="text-xl font-bold text-white">91.8%</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5">
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium uppercase">Highest Detection Room</span>
          <p className="text-xl font-bold text-white">Room A103 (3)</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5">
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <FileVideo className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium uppercase">Total Footage Analyzed</span>
          <p className="text-xl font-bold text-white">3h 45m</p>
        </div>
      </div>
    </div>
  );
};

export default { DetectionsOverTimeChart, CameraBreakdownChart, SummaryStatsGrid };
