import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Smartphone,
  Eye,
  Cctv,
  Cpu,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">SMART SURVEILLANCE</h1>
            <p className="text-[11px] text-brand-400 font-semibold">AI Cheating Detection System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>YOLOv8 Phone Model Active</span>
          </div>

          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-brand flex items-center space-x-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Computer Vision Surveillance</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl leading-[1.15]">
          Smart Cheating Detection
        </h1>
        
        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          AI-powered mobile phone detection for secure and fair examinations. Real-time CCTV analysis, instant invigilator alerts, and forensic footage review.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all shadow-glow-brand flex items-center justify-center space-x-2.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/monitoring"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4 text-brand-400" />
            <span>View Live CCTV Demo</span>
          </Link>
        </div>

        {/* Hero Computer Vision Classroom Mockup */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-slate-700/50 to-slate-900/80 border border-slate-700 shadow-2xl relative">
          <div className="aspect-[16/9] w-full rounded-xl bg-dark-950 relative overflow-hidden flex items-center justify-center border border-slate-800">
            {/* Perspective classroom grid background */}
            <div className="absolute inset-0 grid-bg opacity-30"></div>

            {/* Classroom Simulation with Students & Phone Bounding Box Overlays */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              {/* Top HUD */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-dark-900/80 px-4 py-2 rounded-lg border border-slate-800 backdrop-blur-sm">
                <span className="flex items-center space-x-2 text-red-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>LIVE SURVEILLANCE FEED • CAM-01 [ROOM A101]</span>
                </span>
                <span>FPS: 30.0 • YOLOv8 DETECTOR • 32 SEATS MONITORED</span>
              </div>

              {/* Classroom Seating Grid Representation */}
              <div className="grid grid-cols-4 gap-6 my-auto">
                {Array.from({ length: 8 }).map((_, i) => {
                  const hasPhone = i === 2 || i === 5;
                  return (
                    <div
                      key={i}
                      className={`relative aspect-[4/3] rounded-xl border p-3 flex flex-col justify-between ${
                        hasPhone
                          ? 'border-red-500/80 bg-red-500/10 shadow-glow-alert animate-pulse-subtle'
                          : 'border-slate-800 bg-dark-850/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">SEAT A0{i+1}</span>
                        {hasPhone && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white flex items-center space-x-1">
                            <Smartphone className="w-2.5 h-2.5" />
                            <span>PHONE 96%</span>
                          </span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-xs text-slate-400 font-mono">
                        S-{i+1}
                      </div>

                      <div className="w-full h-3 bg-slate-700/40 rounded"></div>

                      {/* Phone Bounding Box Highlight on Target */}
                      {hasPhone && (
                        <div className="absolute inset-2 border-2 border-red-500 rounded-lg pointer-events-none">
                          <span className="absolute -top-3 left-2 bg-red-600 text-white font-black text-[9px] px-1.5 rounded tracking-wider shadow">
                            PHONE DETECTED
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Alert Ticker */}
              <div className="flex items-center justify-between text-xs bg-dark-900/90 px-4 py-2.5 rounded-lg border border-red-500/40 text-red-300">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="font-semibold">ALERT: 2 Mobile Phones Detected in Room A101</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Confidence: 96% & 91%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-6 lg:px-12 py-16 bg-dark-850/50 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Designed for Strict Examination Integrity
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Purpose-built to detect unauthorized mobile phone usage with precision and speed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow-brand">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Detection</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Processes video frames with low latency, immediately drawing bounding boxes over mobile phones in active examination feeds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow-brand">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">AI-Powered Analysis</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Powered by state-of-the-art computer vision models trained specifically to identify handheld smartphones in classroom lighting.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                <Cctv className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">CCTV Integration</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Connects seamlessly to existing examination hall IP cameras or uploaded MP4/MOV footage from CCTV recorders.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Detailed Reports</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Generates verifiable audit logs, timestamped evidence clips, and exportable PDF/CSV reports for invigilator review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-6 px-6 lg:px-12 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>Smart Cheating Detection System • Academic Examination Surveillance Project</span>
        <span className="flex items-center space-x-1 text-slate-400">
          <Lock className="w-3.5 h-3.5 text-brand-400" />
          <span>Strict Privacy & Secure Exam Hall Architecture</span>
        </span>
      </footer>
    </div>
  );
};

export default LandingPage;
