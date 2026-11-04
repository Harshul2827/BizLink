import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Logo from '../../components/common/Logo';
import OtpInput from '../../components/auth/OtpInput';
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step state: 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS'
  const [step, setStep] = useState('EMAIL');

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [devOtp, setDevOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Mask email helper
  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name[0]}${'*'.repeat(Math.max(1, name.length - 2))}${name.slice(-1)}@${domain}`;
  };

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // ─── Step 1: Request Reset Code ──────────────────────────────────────────────
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!email.trim()) {
      setError('Please enter your registered work email.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', {
        email: email.trim()
      });

      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp);
      }

      setFeedback(res.data?.message || 'We have received your request. If an account exists, a 6-digit code has been sent.');
      setResendCooldown(60);
      setStep('OTP');
    } catch (err) {
      setError(err.message || 'Failed to initiate password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify Reset OTP ────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setFeedback(null);

    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit reset code.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/verify-reset-otp', {
        email: email.trim(),
        otp: otp.trim()
      });

      const token = res.data?.resetToken;
      if (!token) {
        throw new Error('Reset authorization token missing from response.');
      }

      setResetToken(token);
      setStep('PASSWORD');
    } catch (err) {
      setError(err.message || 'Invalid or expired reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    try {
      setResending(true);
      setError(null);
      setFeedback(null);

      const res = await api.post('/auth/resend-reset-otp', {
        email: email.trim()
      });

      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp);
      }

      setFeedback(res.data?.message || 'A fresh reset code has been sent if the account exists.');
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend reset code.');
    } finally {
      setResending(false);
    }
  };

  // ─── Step 3: Set New Password ────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter matching passwords.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
        confirmPassword
      });

      setStep('SUCCESS');
    } catch (err) {
      setError(err.message || 'Failed to update password. Authorization may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#131C2E] p-8 sm:p-10 rounded-lg shadow-elevated border border-[#E2E8F0] dark:border-[#22314A]">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo variant="mark" size={36} />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold border border-[#DBEAFE] dark:border-[#1E40AF]">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Institutional Credential Recovery</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            {step === 'EMAIL' && 'Reset your password'}
            {step === 'OTP' && 'Enter recovery passcode'}
            {step === 'PASSWORD' && 'Create new password'}
            {step === 'SUCCESS' && 'Password updated'}
          </h2>

          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {step === 'EMAIL' && 'Provide your registered work email to receive a secure recovery code.'}
            {step === 'OTP' && `A 6-digit authorization code was sent to ${maskEmail(email)}.`}
            {step === 'PASSWORD' && 'Create a strong, secure password for your operator account.'}
            {step === 'SUCCESS' && 'Your credentials have been securely reset. You can now log in.'}
          </p>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && (
          <div className="flex items-center space-x-2 p-3 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-teal-800 dark:text-teal-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* ─── STEP 1: Enter Email ─────────────────────────────────────────── */}
        {step === 'EMAIL' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                Registered Work Email *
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
                  placeholder="operator@company.com"
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Records...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Passcode</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-[#E2E8F0] dark:border-[#22314A]">
              <Link
                to="/login"
                className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
              >
                Return to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* ─── STEP 2: Enter OTP ───────────────────────────────────────────── */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {devOtp && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-md text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-semibold">Development Notice (SMTP unconfigured in .env):</span>
                    <p className="mt-1">
                      Your 6-digit passcode is <strong className="font-mono text-sm tracking-wider text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">{devOtp}</strong> (auto-filled).
                    </p>
                    <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                      To deliver real emails to your Gmail inbox, add your Gmail address and 16-character App Password to <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">backend/.env</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-center text-[#475569] dark:text-[#CBD5E1] mb-3">
                Enter 6-Digit Password Reset Passcode
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
                hasError={!!error}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires in 10m</span>
              </span>

              <button
                type="button"
                disabled={resendCooldown > 0 || resending}
                onClick={handleResendOtp}
                className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline disabled:text-[#94A3B8] disabled:no-underline disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resending ? 'Sending...' : 'Resend Code'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed to Reset</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#22314A] text-xs">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
              >
                &larr; Change Email
              </button>
              <Link
                to="/login"
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}

        {/* ─── STEP 3: Enter New Password ──────────────────────────────────── */}
        {step === 'PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Password must be at least 8 characters. Any active sessions on other devices will be terminated upon reset.
            </p>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── STEP 4: Success View ────────────────────────────────────────── */}
        {step === 'SUCCESS' && (
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
                Password Successfully Reset
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Your corporate password has been updated. You can now authenticate with your new credentials.
              </p>
            </div>

            <button
              onClick={() => navigate('/login', { state: { email } })}
              className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

