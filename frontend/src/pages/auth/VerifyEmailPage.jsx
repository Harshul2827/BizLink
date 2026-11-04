import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import Logo from '../../components/common/Logo';
import OtpInput from '../../components/auth/OtpInput';
import {
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Edit2,
  Clock
} from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = searchParams.get('email') || '';
  const shouldAutoResend = searchParams.get('resend') === 'true';

  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [feedback, setFeedback] = useState(null);
  const [devOtp, setDevOtp] = useState(null);

  // Mask email for privacy (e.g. r***l@example.com)
  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name[0]}${'*'.repeat(Math.max(1, name.length - 2))}${name.slice(-1)}@${domain}`;
  };

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = useCallback(async (targetEmail) => {
    const emailToUse = targetEmail || email;
    if (!emailToUse.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setResending(true);
      setError(null);
      setFeedback(null);

      const res = await api.post('/auth/resend-verification-otp', {
        email: emailToUse.trim()
      });

      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp);
      }

      setFeedback(res.data?.message || 'A new verification code has been dispatched to your inbox.');
      setResendCooldown(60);
    } catch (err) {
      if (err.code === 'ALREADY_VERIFIED') {
        setSuccess(true);
      } else {
        setError(err.message || 'Failed to resend verification code.');
      }
    } finally {
      setResending(false);
    }
  }, [email]);

  // Handle auto-resend flag if directed from login screen
  useEffect(() => {
    if (shouldAutoResend && initialEmail) {
      handleResend(initialEmail);
    }
  }, [shouldAutoResend, initialEmail, handleResend]);

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setFeedback(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setVerifying(true);
      await api.post('/auth/verify-email', {
        email: email.trim(),
        otp: otp.trim()
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setVerifying(false);
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Corporate Identity Verification</span>
          </div>

          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            {success ? 'Account Verified!' : 'Verify your email address'}
          </h2>

          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {success
              ? 'Your corporate operator account has been authenticated and activated.'
              : 'Enter the 6-digit security code dispatched to your registered work email.'}
          </p>
        </div>

        {/* Success View */}
        {success ? (
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
                Verification Complete
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                <strong>{email}</strong> is now verified. You can sign in using your credentials to access the verified B2B marketplace.
              </p>
            </div>

            <button
              onClick={() => navigate('/login', { state: { email } })}
              className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Verification Form View */
          <div className="space-y-5 pt-1">
            {/* Target Email Box */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#22314A] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] dark:text-[#94A3B8] font-medium flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Destination Inbox</span>
                </span>
                {!isEditingEmail && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(true)}
                    className="text-[#2563EB] dark:text-[#60A5FA] hover:underline font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {isEditingEmail ? (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter registration email"
                    className="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (email.trim()) {
                        setIsEditingEmail(false);
                        handleResend(email.trim());
                      }
                    }}
                    className="px-3 py-1.5 rounded-md bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              ) : (
                <div className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">
                  {maskEmail(email)}
                </div>
              )}
            </div>

            {/* Notifications */}
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

            {devOtp && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-md text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-semibold">Development Notice (SMTP unconfigured in .env):</span>
                    <p className="mt-1">
                      Your verification passcode is <strong className="font-mono text-sm tracking-wider text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">{devOtp}</strong> (auto-filled).
                    </p>
                    <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                      To receive real emails in your inbox, set your Gmail credentials in <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">backend/.env</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-center text-[#475569] dark:text-[#CBD5E1] mb-3">
                  Enter 6-Digit Passcode
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  disabled={verifying}
                  hasError={!!error}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid for 10 minutes</span>
                </span>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || resending}
                  onClick={() => handleResend()}
                  className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline disabled:text-[#94A3B8] disabled:no-underline disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : resending ? 'Dispatching...' : 'Resend Code'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== 6}
                className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email & Activate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#E2E8F0] dark:border-[#22314A]">
              <Link
                to="/login"
                className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

