import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 transition-colors duration-200">
      {/* Dynamic background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800/80 bg-surface-100/50 dark:bg-surface-900/30 backdrop-blur-sm relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-500 dark:text-surface-400 gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-surface-700 dark:text-surface-300">BizLink Platform</span>
            <span>&bull;</span>
            <span>High-Trust B2B Collaboration</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-surface-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-surface-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#support" className="hover:text-surface-900 dark:hover:text-white transition-colors">Support</a>
            <span>&copy; {new Date().getFullYear()} BizLink. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
