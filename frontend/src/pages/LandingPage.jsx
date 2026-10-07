import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users2,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24 py-6 sm:py-12">
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Verified B2B Collaboration</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-surface-900 dark:text-white tracking-tight leading-[1.15]">
          Connect, collaborate, and grow with <span className="text-gradient">verified businesses</span>
        </h1>

        <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto font-normal leading-relaxed">
          BizLink eliminates partnership friction through rule-based service matching, verified business profiles, milestone-driven collaboration, and authenticated peer reviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={isAuthenticated ? '/discover' : '/register'}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <span>{isAuthenticated ? 'Go to Marketplace' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/discover"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-card text-surface-800 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 font-semibold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-brand-500" />
            <span>Browse Active Needs & Services</span>
          </Link>
        </div>

        {/* Quick Highlights Strip */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          {[
            { label: 'Deterministic Matching', desc: 'Category, budget & city scores' },
            { label: 'End-to-End Tracking', desc: 'Draft to completed collaborations' },
            { label: '100% Authenticated', desc: 'Reviews tied to real deliverables' },
            { label: 'Verified Profiles', desc: 'Official administrative badge checks' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl glass-card border border-surface-200/60 dark:border-surface-800/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold text-xs text-surface-900 dark:text-surface-100">{item.label}</div>
              <div className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Core Pillars ────────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-display font-bold text-surface-900 dark:text-white">
            Engineered for enterprise trust & discovery
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Every feature on BizLink is designed to facilitate real commercial transactions without noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl space-y-4 hover:border-brand-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white">Rule-Based Matching</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              Match your business needs with ideal suppliers based on exact category alignments, budget overlapping calculations, and location proximity scoring.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4 hover:border-violet-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white">Lifecycle Collaborations</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              Move from connection request to structured negotiation, active execution, and project milestone completion with audited timeline transparency.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white">Proof-Backed Trust</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              Only businesses that successfully complete collaborative engagements can author verified reviews, guaranteeing accurate and tamper-free reputation data.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Call to Action Banner ───────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900 via-indigo-950 to-surface-950 p-8 sm:p-14 text-white shadow-2xl border border-brand-800/40">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Ready to scale your commercial partnerships?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Join hundreds of companies doing business on BizLink.
          </h2>
          <p className="text-surface-300 text-sm leading-relaxed">
            Create your verified business profile today, publish your first need or offer, and start discovering high-scoring partners immediately.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
