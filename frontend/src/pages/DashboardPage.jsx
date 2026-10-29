import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cctv,
  Users,
  Smartphone,
  ShieldAlert,
  ArrowRight,
  Upload,
  BarChart3,
  CheckCircle2,
  Clock,
  Radio,
  Eye,
  Sparkles
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CameraCard from '../components/CameraCard';
import DetectionTable from '../components/DetectionTable';
import { useDetection } from '../context/DetectionContext';

const DashboardPage = () => {
  const { stats, cameras, detectionLogs, handleUpdateStatus, triggerMockAlert } = useDetection();

  return (
    <div className="space-y-8">
      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Cameras"
          value={stats.activeCameras}
          icon={Cctv}
          change="4 Feeds Online"
          subtitle="CAM-01 to CAM-04 streaming"
          color="emerald"
        />

        <StatCard
          title="Students Monitored"
          value={stats.studentsMonitored}
          icon={Users}
          change="100% Verified"
          subtitle="4 Examination Rooms"
          color="brand"
        />

        <StatCard
          title="Phones Detected"
          value={stats.phonesDetected}
          icon={Smartphone}
          change="Requires Review"
          changeType="alert"
          subtitle="AI YOLOv8 Model Filtered"
          color="alert"
        />

        <StatCard
          title="Alerts Generated"
          value={stats.alertsGenerated}
          icon={ShieldAlert}
          change="Active Alerts"
          changeType="alert"
          subtitle="Invigilator notifications"
          color="amber"
        />
      </div>

      {/* Live Monitoring Camera Previews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
              <Cctv className="w-5 h-5 text-brand-400" />
              <span>Live Examination Surveillance Feeds</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time object detection stream across all active exam halls</p>
          </div>

          <Link
            to="/monitoring"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1.5 transition-colors"
          >
            <span>View All Camera Feeds</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cameras.map((cam) => (
            <CameraCard key={cam.id} camera={cam} />
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5 bg-gradient-to-r from-dark-850 via-dark-800 to-indigo-950/40">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow-brand shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Have Recorded Examination Footage?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload MP4, MOV, or AVI CCTV recordings to run offline AI mobile phone detection and generate forensic reports.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/upload"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-brand flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Footage</span>
          </Link>

          <Link
            to="/reports"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Detections Log Table */}
      <DetectionTable
        detections={detectionLogs}
        onUpdateStatus={handleUpdateStatus}
        title="Recent Mobile Phone Detection Incidents"
      />
    </div>
  );
};

export default DashboardPage;
