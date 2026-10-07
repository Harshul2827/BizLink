import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 glass-card rounded-2xl max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center mb-4 text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-surface-600 dark:text-surface-300 mb-6">
          This area requires administrative privileges. Your current role is <strong>{user?.role}</strong>.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
}
