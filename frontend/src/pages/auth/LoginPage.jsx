import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const from = location.state?.from?.pathname || '/discover';

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED' || err.message?.toLowerCase().includes('not been verified')) {
        setUnverifiedEmail(email.trim());
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#131C2E] p-8 sm:p-10 rounded-lg shadow-elevated border border-[#E2E8F0] dark:border-[#22314A]">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo variant="mark" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Sign in to BizLink
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Access your verified B2B corporate network and commercial partnerships
          </p>
        </div>

        {/* Unverified Email Warning Banner */}
        {unverifiedEmail && (
          <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Email Verification Required</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              Your account <strong>{unverifiedEmail}</strong> has not been verified yet. Unverified accounts cannot access enterprise services.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}&resend=true`)}
              className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>Verify Email Now & Resend Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-[#2563EB] dark:text-[#3B82F6] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#E2E8F0] dark:border-[#22314A]">
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Need a verified commercial account?{' '}
            <Link to="/register" className="text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline">
              Register company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
