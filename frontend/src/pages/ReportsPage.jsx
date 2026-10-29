import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Cctv,
  Smartphone
} from 'lucide-react';
import { DetectionsOverTimeChart, CameraBreakdownChart, SummaryStatsGrid } from '../components/ChartCard';
import DetectionTable from '../components/DetectionTable';
import { useDetection } from '../context/DetectionContext';

const ReportsPage = () => {
  const { stats, detectionLogs, handleUpdateStatus, exportCSV } = useDetection();
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    setReportGenerated(true);
    setTimeout(() => {
      setReportGenerated(false);
    }, 4000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <span>Surveillance Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical breakdown of mobile phone detection events across examination halls
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-brand flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4 text-brand-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {reportGenerated && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Executive Examination Audit Report generated successfully. Ready for export.</span>
          </div>
          <span className="font-mono text-[11px]">REPORT-ID: EXAM-2026-A1</span>
        </div>
      )}

      {/* 4 Summary Stats Cards */}
      <SummaryStatsGrid />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetectionsOverTimeChart />
        <CameraBreakdownChart />
      </div>

      {/* Comprehensive Log Table */}
      <DetectionTable
        detections={detectionLogs}
        onUpdateStatus={handleUpdateStatus}
        title="Complete Audit Log for Examination Session A"
      />
    </div>
  );
};

export default ReportsPage;
