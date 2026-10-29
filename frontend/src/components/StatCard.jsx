import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', subtitle, color = 'brand' }) => {
  const colorMap = {
    brand: {
      border: 'border-brand-500/20 hover:border-brand-500/40',
      bgIcon: 'bg-brand-500/10 text-brand-400',
      glow: 'group-hover:shadow-glow-brand',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgIcon: 'bg-emerald-500/10 text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]',
    },
    alert: {
      border: 'border-alert-500/30 hover:border-alert-500/60',
      bgIcon: 'bg-alert-500/10 text-alert-500',
      glow: 'group-hover:shadow-glow-alert',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bgIcon: 'bg-amber-500/10 text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]',
    }
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className={`glass-panel p-5 rounded-2xl border ${scheme.border} transition-all duration-200 group ${scheme.glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bgIcon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-sans">
          {value}
        </div>
        {change && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            changeType === 'alert'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
          <span>{subtitle}</span>
        </p>
      )}
    </div>
  );
};

export default StatCard;
