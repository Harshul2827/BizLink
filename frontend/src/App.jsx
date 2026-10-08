import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Track 1: Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Track 2: Business Pages
import DashboardPage from './pages/business/DashboardPage';
import CreateBusinessPage from './pages/business/CreateBusinessPage';
import BusinessProfilePage from './pages/business/BusinessProfilePage';

// Track 3: Discovery
import DiscoverPage from './pages/discovery/DiscoverPage';

// Track 4: Networking & Messaging
import ConnectionsPage from './pages/connections/ConnectionsPage';
import MessagesPage from './pages/messaging/MessagesPage';

// Track 5: Collaborations, Posts & Admin
import CollaborationsPage from './pages/collaborations/CollaborationsPage';
import PostsPage from './pages/posts/PostsPage';
import AdminPage from './pages/admin/AdminPage';

// Track 6: Analytics
import AnalyticsPage from './pages/analytics/AnalyticsPage';

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
              <CollaborationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
