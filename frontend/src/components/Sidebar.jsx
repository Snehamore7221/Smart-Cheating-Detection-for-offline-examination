import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Cctv,
  Upload,
  FileSearch,
  Users,
  BarChart3,
  Settings,
  ShieldAlert,
  UserCheck,
  Radio
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Live Monitoring', icon: Cctv, badge: '4 LIVE' },
    { to: '/upload', label: 'Upload Video', icon: Upload },
    { to: '/results', label: 'Detection Results', icon: FileSearch },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide leading-tight">SMART SURVEILLANCE</h1>
            <p className="text-[11px] text-brand-400 font-medium">Exam Cheating Detection</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Surveillance Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-glow-brand font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{item.badge}</span>
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile / Invigilator Section */}
      <div className="p-4 border-t border-slate-800/80 bg-dark-850/60">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-semibold text-xs">
              <UserCheck className="w-4 h-4 text-brand-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-dark-900 rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Prof. Sneha More</p>
            <p className="text-[11px] text-slate-400 truncate flex items-center space-x-1">
              <span>Admin / Invigilator</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
