import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('OWNER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password,
        role
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white dark:bg-[#131C2E] p-8 sm:p-10 rounded-lg shadow-elevated border border-[#E2E8F0] dark:border-[#22314A]">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo variant="mark" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Create your account
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Join the verified B2B collaboration and commercial networking platform
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
          <button
            type="button"
            onClick={() => setRole('OWNER')}
            className={`py-2 px-3 rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              role === 'OWNER'
                ? 'bg-white dark:bg-[#131C2E] text-[#2563EB] dark:text-[#3B82F6] shadow-subtle border border-[#E2E8F0] dark:border-[#334155]'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business Owner</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('PARTNER')}
            className={`py-2 px-3 rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              role === 'PARTNER'
                ? 'bg-white dark:bg-[#131C2E] text-[#2563EB] dark:text-[#3B82F6] shadow-subtle border border-[#E2E8F0] dark:border-[#334155]'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Solution Partner</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                Work Email *
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
                  placeholder="jane@company.com"
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-10 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 mt-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-subtle flex items-center justify-center space-x-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Agree & Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#22314A] text-center">
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Already on BizLink?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

