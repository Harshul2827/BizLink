import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = null, requiredRole = null }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-pulse">
          <Logo variant="mark" size={32} />
        </div>
        <p className="text-xs font-medium text-text-muted">Authenticating enterprise session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role restrictions (support allowedRoles array or legacy requiredRole string)
  const allowed = allowedRoles
    ? Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles]
    : requiredRole
    ? [requiredRole]
    : null;

  if (allowed && (!user?.role || !allowed.includes(user.role))) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-card bg-card border border-border shadow-subtle text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-error-tint text-red-error flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-text-primary">Access Restricted</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              This section is restricted to authorized administrative accounts. Your current profile does not have permission to view this resource.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-btn bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-subtle transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
