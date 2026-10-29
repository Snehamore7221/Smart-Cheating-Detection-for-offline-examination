import React, { createContext, useContext, useState, useEffect } from 'react';
import detectionService from '../services/detectionService';

const DetectionContext = createContext(null);

export const DetectionProvider = ({ children }) => {
  const [stats, setStats] = useState(detectionService.getDashboardStats());
  const [cameras, setCameras] = useState(detectionService.getCameras());
  const [students, setStudents] = useState(detectionService.getStudents());
  const [detectionLogs, setDetectionLogs] = useState(detectionService.getDetections());
  const [confidenceThreshold, setConfidenceThreshold] = useState(detectionService.getConfidenceThreshold());
  const [analyzedVideoResult, setAnalyzedVideoResult] = useState(null);
  
  // Alert panel state
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertHistory, setAlertHistory] = useState([
    {
      id: 'ALT-01',
      camera: 'Camera 01',
      room: 'Room A101',
      studentId: 'STU-012',
      studentName: 'Rahul Sharma',
      confidence: 96,
      timestamp: '10:14:21',
      status: 'Confirmed'
    },
    {
      id: 'ALT-02',
      camera: 'Camera 01',
      room: 'Room A101',
      studentId: 'STU-027',
      studentName: 'Priya Patel',
      confidence: 91,
      timestamp: '10:19:14',
      status: 'Review Required'
    }
  ]);

  const refreshData = () => {
    setStats(detectionService.getDashboardStats());
    setCameras(detectionService.getCameras());
    setStudents(detectionService.getStudents());
    setDetectionLogs(detectionService.getDetections());
  };

  const handleUpdateStatus = (detectionId, newStatus) => {
    const updated = detectionService.updateDetectionStatus(detectionId, newStatus);
    setDetectionLogs(updated);
    
    // Update matching student if applicable
    const targetDet = updated.find(d => d.id === detectionId);
    if (targetDet) {
      setStudents(prev => prev.map(s => {
        if (s.id === targetDet.studentId) {
          return { ...s, status: newStatus };
        }
        return s;
      }));
    }

    refreshData();
  };

  const handleSetConfidenceThreshold = (val) => {
    detectionService.setConfidenceThreshold(val);
    setConfidenceThreshold(Number(val));
    setDetectionLogs(detectionService.getDetections());
  };

  const triggerMockAlert = (camera, student) => {
    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      camera: camera?.name || 'Camera 01',
      room: camera?.room || 'Room A101',
      studentId: student?.id || 'STU-012',
      studentName: student?.name || 'Rahul Sharma',
      confidence: 96,
      timestamp: new Date().toLocaleTimeString(),
      status: 'Review Required'
    };

    setActiveAlert(newAlert);
    setAlertHistory(prev => [newAlert, ...prev]);
  };

  const dismissActiveAlert = () => {
    setActiveAlert(null);
  };

  return (
    <DetectionContext.Provider
      value={{
        stats,
        cameras,
        students,
        detectionLogs,
        confidenceThreshold,
        analyzedVideoResult,
        setAnalyzedVideoResult,
        activeAlert,
        alertHistory,
        handleUpdateStatus,
        handleSetConfidenceThreshold,
        triggerMockAlert,
        dismissActiveAlert,
        exportCSV: () => detectionService.exportCSV()
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};
