import React from 'react';
import Navbar from '../components/Navbar';
import VideoSection from '../components/VideoSection';
import BenchConfigSection from '../components/BenchConfigSection';
import IncidentModal from '../components/IncidentModal';

const MainDetectionPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Main 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE (5 cols on large screens): Upload & Video Player */}
          <div className="lg:col-span-6 xl:col-span-6">
            <VideoSection />
          </div>

          {/* RIGHT SIDE (6 cols on large screens): Bench & Student Configuration */}
          <div className="lg:col-span-6 xl:col-span-6">
            <BenchConfigSection />
          </div>
        </div>
      </main>

      {/* Incident Details Modal if triggered */}
      <IncidentModal />
    </div>
  );
};

export default MainDetectionPage;
