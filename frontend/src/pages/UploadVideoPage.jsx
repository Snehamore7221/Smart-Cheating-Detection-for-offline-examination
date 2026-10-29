import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileVideo,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Layers,
  ArrowRight,
  Clock,
  HardDrive,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import detectionService from '../services/detectionService';

const UploadVideoPage = () => {
  const navigate = useNavigate();
  const { setAnalyzedVideoResult } = useDetection();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processState, setProcessState] = useState(null); // { percent, currentFrames, totalFrames, stage }
  const [completedResult, setCompletedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (file) => {
    if (!file) return;
    const validExtensions = ['.mp4', '.mov', '.avi'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Invalid file format. Please upload MP4, MOV, or AVI examination footage.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setCompletedResult(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const startDetection = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const result = await detectionService.processExaminationVideo(selectedFile, (progress) => {
        setProcessState(progress);
      });

      setCompletedResult(result);
      setAnalyzedVideoResult(result);
      setIsProcessing(false);
    } catch (err) {
      setErrorMsg('Error processing footage with AI detector: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
          <Upload className="w-6 h-6 text-brand-400" />
          <span>Upload Examination Footage</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload recorded classroom CCTV footage for automated offline mobile phone detection & analytics
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Box / Processing / Completed States */}
      {!isProcessing && !completedResult && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-panel rounded-3xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-4 ${
            isDragging
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-slate-700/80 hover:border-brand-500/50 hover:bg-slate-800/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files[0])}
            accept=".mp4,.mov,.avi,video/*"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center shadow-glow-brand">
            <FileVideo className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Upload Examination Footage</h3>
            <p className="text-xs text-slate-400 mt-1">
              Drag and drop your video here or <span className="text-brand-400 font-semibold underline">browse files</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
            <span>Supported formats:</span>
            <span className="px-2 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-300">MP4</span>
            <span className="px-2 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-300">MOV</span>
            <span className="px-2 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-300">AVI</span>
          </div>
        </div>
      )}

      {/* Selected Video Metadata Details */}
      {selectedFile && !isProcessing && !completedResult && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">Ready for AI object detection analysis</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Change Video
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">File Size</span>
              <span className="font-semibold text-white font-mono mt-0.5 block">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Estimated Duration</span>
              <span className="font-semibold text-white font-mono mt-0.5 block">~05:30 min</span>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Detection Target</span>
              <span className="font-semibold text-brand-400 font-mono mt-0.5 block">Mobile Phones</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={startDetection}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-brand transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Detection</span>
            </button>
          </div>
        </div>
      )}

      {/* Analyzing / Processing State Screen */}
      {isProcessing && (
        <div className="glass-panel p-10 rounded-3xl border border-brand-500/40 text-center space-y-6 shadow-glow-brand animate-pulse-subtle">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mx-auto shadow-glow-brand">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Analyzing Examination Footage...</h3>
            <p className="text-xs text-brand-400 mt-1 font-mono">
              {processState?.stage || 'Running YOLOv8 inference frame-by-frame...'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="h-3 w-full bg-dark-800 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-200"
                style={{ width: `${processState?.percent || 5}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{processState?.currentFrames || 420} / {processState?.totalFrames || 8420} Frames</span>
              <span className="font-bold text-white">{processState?.percent || 5}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Completed State Card */}
      {completedResult && (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 space-y-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ANALYSIS COMPLETE
              </span>
              <h3 className="text-base font-bold text-white mt-1">Detection Complete</h3>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Frames Analyzed</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                {completedResult.framesAnalyzed.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Phones Detected</span>
              <span className="text-xl font-bold text-red-400 font-mono mt-1 block">
                {completedResult.phonesDetected} Instances
              </span>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Processing Time</span>
              <span className="text-xl font-bold text-brand-400 font-mono mt-1 block">
                {completedResult.processingTime}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={() => {
                setSelectedFile(null);
                setCompletedResult(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
            >
              Analyze Another Video
            </button>

            <button
              onClick={() => navigate('/results')}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-brand transition-all flex items-center space-x-2"
            >
              <span>View Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadVideoPage;
