import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Business Pages
import DashboardPage from './pages/business/DashboardPage';
import CreateBusinessPage from './pages/business/CreateBusinessPage';
import BusinessProfilePage from './pages/business/BusinessProfilePage';

// Discovery & Networking Pages
import DiscoverPage from './pages/discovery/DiscoverPage';
import ConnectionsPage from './pages/connections/ConnectionsPage';
import MessagesPage from './pages/messaging/MessagesPage';

// Placeholder for remaining track pages
function PlaceholderView({ title, description }) {
  return (
    <div className="py-12 max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl space-y-4 shadow-xl">
        <h1 className="text-2xl font-bold font-display text-surface-900 dark:text-white">{title}</h1>
        <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/business/:id" element={<BusinessProfilePage />} />

        {/* Protected Feature Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business/create"
          element={
            <ProtectedRoute>
              <CreateBusinessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoverPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <ConnectionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/collaborations"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="Collaborations & Contracts"
                description="Manage structured B2B collaborations across negotiation, execution, and milestone review phases."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="Business Opportunity Feed"
                description="Corporate announcements, requirement postings, and partner achievements."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <PlaceholderView
                title="Administration & Moderation"
                description="Enterprise moderation queue for business verification, user reports resolution, and audit logs."
              />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
