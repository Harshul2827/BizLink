import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Logo from '../components/common/Logo';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-app text-text-primary transition-colors duration-150">
      {/* Unified Enterprise Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 enterprise-container py-6">
        <Outlet />
      </main>

      {/* Trustworthy Enterprise Footer */}
      <footer className="border-t border-border bg-card py-6 mt-12 transition-colors">
        <div className="enterprise-container flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <div className="flex items-center space-x-2">
            <Logo variant="full" size="sm" />
            <span className="text-border">|</span>
            <span>Verified B2B Collaboration Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-text-secondary">
            <Link to="/discover" className="hover:text-brand-blue transition-colors">Marketplace</Link>
            <Link to="/posts" className="hover:text-brand-blue transition-colors">Network Feed</Link>
            <Link to="/collaborations" className="hover:text-brand-blue transition-colors">Contracts</Link>
            <Link to="/dashboard" className="hover:text-brand-blue transition-colors">Dashboard</Link>
            <span>&copy; {new Date().getFullYear()} BizLink Technologies Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
