import React from 'react';
import { Smartphone, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const ConfidenceBadge = ({ confidence }) => {
  const conf = Number(confidence) || 0;
  let style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  
  if (conf < 85) {
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (conf >= 90) {
    style = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{conf}%</span>
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Confirmed':
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Confirmed</span>
        </span>
      );
    case 'Review Required':
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          <span>Review Required</span>
        </span>
      );
    case 'Dismissed':
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
          <XCircle className="w-3.5 h-3.5" />
          <span>Dismissed</span>
        </span>
      );
    case 'Clear':
    default:
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Clear</span>
        </span>
      );
  }
};

export default { ConfidenceBadge, StatusBadge };
