import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AlertPanel from './AlertPanel';

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex font-sans antialiased">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        
        <main className="flex-1 p-6 md:p-8 bg-dark-900">
          <Outlet />
        </main>
      </div>

      {/* Global Real-time Mobile Phone Alert Notification Overlay */}
      <AlertPanel />
    </div>
  );
};

export default Layout;
