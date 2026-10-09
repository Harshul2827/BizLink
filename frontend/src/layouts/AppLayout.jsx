import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1120] text-[#1D2226] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Corporate Professional Footer */}
      <footer className="border-t border-[#D9E2EC] dark:border-[#22314A] bg-white dark:bg-[#131C2E] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5E6C76] dark:text-[#94A3B8] gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#1D2226] dark:text-white">BizLink</span>
            <span>&bull;</span>
            <span>Enterprise B2B Collaboration & Trust Platform</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#about" className="hover:text-[#0A66C2] transition-colors">About</a>
            <a href="#privacy" className="hover:text-[#0A66C2] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#0A66C2] transition-colors">Terms of Service</a>
            <a href="#support" className="hover:text-[#0A66C2] transition-colors">Help Center</a>
            <span>&copy; {new Date().getFullYear()} BizLink Corporation.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
