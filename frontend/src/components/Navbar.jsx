import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, History, LogOut, User, Smartphone, AlertCircle } from 'lucide-react';
import { useExam } from '../context/ExamContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { facultyUser, logoutFaculty, incidents } = useExam();

  const handleLogout = () => {
    logoutFaculty();
    navigate('/login');
  };

  const flaggedCount = incidents.length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Purpose */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900 leading-tight">Smart Cheating Detection System</h1>
              <p className="text-[11px] text-blue-600 font-medium">Faculty Examination Surveillance</p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              location.pathname === '/'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Main Detection</span>
          </Link>

          <Link
            to="/incidents"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              location.pathname === '/incidents'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>Incident History</span>
            {flaggedCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {flaggedCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Faculty Profile & Logout */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">{facultyUser?.name || 'Faculty Member'}</p>
              <span className="text-[10px] text-blue-600 font-semibold uppercase">FACULTY IN-CHARGE</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
