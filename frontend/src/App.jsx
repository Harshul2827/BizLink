import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Placeholder views for subsequent track pages
function PlaceholderView({ title, description }) {
  return (
    <div className="py-12 max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl space-y-4">
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

        {/* Protected Feature Routes */}
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="Discover Marketplace"
                description="Rule-based matching and directory discovery across active needs and services."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="Business Dashboard"
                description="Manage your business profiles, service offerings, and open commercial needs."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="B2B Connections"
                description="Manage incoming and outgoing B2B connection requests and verified network relationships."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="Messages & Conversations"
                description="Real-time direct messaging between connected commercial partners."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/collaborations"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="Collaborations & Contracts"
                description="Track lifecycle collaborations from draft proposal to completion and reviews."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PlaceholderView
                title="Business Feed"
                description="Commercial updates, opportunity announcements, and partner milestone feed."
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
                description="Administrative queue for entity verification, user reports resolution, and platform moderation."
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
