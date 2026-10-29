import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider, useExam } from './context/ExamContext';
import LoginPage from './pages/LoginPage';
import MainDetectionPage from './pages/MainDetectionPage';
import IncidentHistoryPage from './pages/IncidentHistoryPage';

// Protected Route Wrapper enforcing Faculty Authentication
const ProtectedRoute = ({ children }) => {
  const { facultyUser } = useExam();
  if (!facultyUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Faculty Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Main Detection Page (Left Video, Right Bench Config) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainDetectionPage />
          </ProtectedRoute>
        }
      />

      {/* 3. Incident History Page & Dashboard */}
      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <IncidentHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ExamProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ExamProvider>
  );
}

export default App;
