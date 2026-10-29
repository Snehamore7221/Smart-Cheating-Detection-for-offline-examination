import React, { useState } from 'react';
import {
  FileSearch,
  Smartphone,
  Users,
  Award,
  Layers,
  Sparkles,
  Download,
  Share2,
  CheckCircle2
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import DetectionTimeline from '../components/DetectionTimeline';
import DetectionTable from '../components/DetectionTable';
import { useDetection } from '../context/DetectionContext';

const DetectionResultsPage = () => {
  const { analyzedVideoResult, detectionLogs, handleUpdateStatus, exportCSV } = useDetection();
  const [currentSeekTime, setCurrentSeekTime] = useState(0);

  // Fallback data if no video was uploaded yet in the current session
  const activeResult = analyzedVideoResult || {
    videoName: 'examination_hall_cctv_sample.mp4',
    framesAnalyzed: 8420,
    phonesDetected: 6,
    accuracy: '95.4%',
    duration: '00:05:30',
    detections: [
      { id: 'D-101', timeSec: 4.2, timestamp: '00:04', camera: 'CAM-01', studentId: 'STU-012', studentName: 'Rahul Sharma', object: 'Mobile Phone', confidence: 96, status: 'Confirmed', box: { x: 42, y: 55, w: 14, h: 22 } },
      { id: 'D-102', timeSec: 9.1, timestamp: '00:09', camera: 'CAM-01', studentId: 'STU-027', studentName: 'Priya Patel', object: 'Mobile Phone', confidence: 91, status: 'Review Required', box: { x: 70, y: 48, w: 12, h: 20 } },
      { id: 'D-103', timeSec: 15.0, timestamp: '00:15', camera: 'CAM-01', studentId: 'STU-012', studentName: 'Rahul Sharma', object: 'Mobile Phone', confidence: 94, status: 'Confirmed', box: { x: 43, y: 54, w: 13, h: 21 } },
      { id: 'D-104', timeSec: 21.3, timestamp: '00:21', camera: 'CAM-01', studentId: 'STU-008', studentName: 'Kavya Pillai', object: 'Mobile Phone', confidence: 89, status: 'Review Required', box: { x: 26, y: 50, w: 15, h: 23 } },
      { id: 'D-105', timeSec: 28.5, timestamp: '00:28', camera: 'CAM-01', studentId: 'STU-094', studentName: 'Karan Mehra', object: 'Mobile Phone', confidence: 92, status: 'Review Required', box: { x: 60, y: 40, w: 12, h: 18 } },
      { id: 'D-106', timeSec: 34.0, timestamp: '00:34', camera: 'CAM-01', studentId: 'STU-102', studentName: 'Ananya Gupta', object: 'Mobile Phone', confidence: 95, status: 'Confirmed', box: { x: 78, y: 64, w: 14, h: 22 } },
    ]
  };

  const detections = activeResult.detections || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <FileSearch className="w-6 h-6 text-brand-400" />
            <span>Detection Results</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed computer vision analysis for <span className="text-slate-200 font-mono font-medium">{activeResult.videoName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-white font-sans">32</div>
          <p className="mt-1 text-[11px] text-slate-400">Room A101 Examination Hall</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-alert-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Phones Detected</span>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-red-400 font-sans">{activeResult.phonesDetected}</div>
          <p className="mt-1 text-[11px] text-slate-400">Requires Invigilator Review</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Accuracy</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-400 font-sans">{activeResult.accuracy}</div>
          <p className="mt-1 text-[11px] text-slate-400">YOLOv8 Phone Model Confidence</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frames Analyzed</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-white font-mono">{activeResult.framesAnalyzed.toLocaleString()}</div>
          <p className="mt-1 text-[11px] text-slate-400">30 FPS Frame-by-Frame Inference</p>
        </div>
      </div>

      {/* Video Player + Synchronized Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Video Player with Phone Bounding Boxes */}
        <div className="lg:col-span-2">
          <VideoPlayer
            videoTitle={activeResult.videoName}
            detections={detections}
            currentTimeSec={currentSeekTime}
            onTimeUpdate={(time) => setCurrentSeekTime(time)}
          />
        </div>

        {/* Right (1 col): Detection Timeline */}
        <div className="lg:col-span-1">
          <DetectionTimeline
            detections={detections}
            currentSeekTime={currentSeekTime}
            onSeekTo={(sec) => setCurrentSeekTime(sec)}
          />
        </div>
      </div>

      {/* Detection Table */}
      <DetectionTable
        detections={detections}
        onUpdateStatus={handleUpdateStatus}
        title="Detected Mobile Phone Events Log"
      />
    </div>
  );
};

export default DetectionResultsPage;
