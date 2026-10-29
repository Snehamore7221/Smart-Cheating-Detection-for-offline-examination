import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Smartphone, Lock, Mail, ArrowRight, UserCheck, School } from 'lucide-react';
import { useExam } from '../context/ExamContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginFaculty } = useExam();

  const [email, setEmail] = useState('faculty@exam.edu');
  const [password, setPassword] = useState('Faculty@123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both faculty username/email and password.');
      return;
    }

    loginFaculty(email, password);
    navigate('/');
  };

  const handleDemoLogin = () => {
    loginFaculty('prof.sneha@exam.edu', 'Faculty@123');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <Smartphone className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Cheating Detection System</h2>
        <p className="mt-1 text-xs font-semibold text-blue-600 uppercase tracking-wider">
          Faculty Examination Portal
        </p>
        <p className="mt-1 text-xs text-slate-500">
          AI-powered mobile phone detection and bench association
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="app-card p-8 bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Faculty Authentication</h3>
            <p className="text-xs text-slate-500 mt-0.5">Please sign in with your official faculty credentials</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@exam.edu"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-blue text-xs flex items-center justify-center space-x-2 py-3 mt-2 shadow-md"
            >
              <span>Sign In to Surveillance Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Login Helper */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>1-Click Faculty Demo Login</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center space-x-1">
          <School className="w-3.5 h-3.5 text-slate-400" />
          <span>Academic Examination Hall Surveillance System</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
