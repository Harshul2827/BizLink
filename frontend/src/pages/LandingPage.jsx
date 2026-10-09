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
  Layers,
  TrendingUp,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EEF6FC] dark:bg-[#1E2E48] border border-[#B5DAF4] dark:border-[#22314A] text-[#0A66C2] dark:text-[#388FE5] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
          <span>The Professional B2B Collaboration & Trust Network</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D2226] dark:text-white tracking-tight leading-[1.2]">
          Connect, collaborate, and scale with <span className="text-[#0A66C2] dark:text-[#388FE5]">verified enterprises</span>
        </h1>

        <p className="text-base sm:text-lg text-[#5E6C76] dark:text-[#94A3B8] max-w-2xl mx-auto font-normal leading-relaxed">
          BizLink powers corporate partnerships through rule-based service matching, milestone-driven contract tracking, and authenticated peer reviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={isAuthenticated ? '/discover' : '/register'}
            className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm shadow-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <span>{isAuthenticated ? 'Open Marketplace' : 'Join as Business'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/discover"
            className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#FFFFFF] dark:bg-[#131C2E] border border-[#D9E2EC] dark:border-[#22314A] text-[#1D2226] dark:text-white hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D] font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-[#0A66C2]" />
            <span>Explore Active Needs & Services</span>
          </Link>
        </div>

        {/* Value Proof Strip */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          {[
            { label: 'Rule-Based Matching', desc: 'Deterministic score calculation', icon: Zap },
            { label: 'Verified Businesses', desc: 'Official administrative badge', icon: ShieldCheck },
            { label: 'Lifecycle Contracts', desc: 'Draft to completed milestones', icon: Users2 },
            { label: 'Authenticated Reviews', desc: 'Tied to fulfilled deliverables', icon: Award },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#131C2E] border border-[#D9E2EC] dark:border-[#22314A] shadow-sm">
                <Icon className="w-5 h-5 text-[#0A66C2] dark:text-[#388FE5] mb-2" />
                <div className="font-bold text-xs text-[#1D2226] dark:text-white">{item.label}</div>
                <div className="text-[11px] text-[#5E6C76] dark:text-[#94A3B8] mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Core Pillars ────────────────────────────────────────────── */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1D2226] dark:text-white">
            Built for enterprise credibility & growth
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6C76] dark:text-[#94A3B8]">
            Facilitate high-value B2B commercial transactions with complete relationship transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFFFF] dark:bg-[#131C2E] border border-[#D9E2EC] dark:border-[#22314A] p-6 rounded-xl space-y-3 shadow-sm hover:border-[#0A66C2] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EEF6FC] dark:bg-[#1E2E48] text-[#0A66C2] dark:text-[#388FE5] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D2226] dark:text-white">Deterministic Need Matching</h3>
            <p className="text-xs text-[#5E6C76] dark:text-[#94A3B8] leading-relaxed">
              Match your open commercial requirements with qualified supplier services based on category alignment, budget compatibility, and location proximity.
            </p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#131C2E] border border-[#D9E2EC] dark:border-[#22314A] p-6 rounded-xl space-y-3 shadow-sm hover:border-[#0A66C2] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EEF6FC] dark:bg-[#1E2E48] text-[#0A66C2] dark:text-[#388FE5] flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D2226] dark:text-white">Structured Collaborations</h3>
            <p className="text-xs text-[#5E6C76] dark:text-[#94A3B8] leading-relaxed">
              Manage commercial engagements through audited status stages: proposal request, negotiation, active execution, and verified completion.
            </p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#131C2E] border border-[#D9E2EC] dark:border-[#22314A] p-6 rounded-xl space-y-3 shadow-sm hover:border-[#0A66C2] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EEF6FC] dark:bg-[#1E2E48] text-[#0A66C2] dark:text-[#388FE5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D2226] dark:text-white">Tamper-Proof Reputation</h3>
            <p className="text-xs text-[#5E6C76] dark:text-[#94A3B8] leading-relaxed">
              Reviews and rating scores are strictly restricted to businesses with verified completed collaborations, eliminating spam and fabricated feedback.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Call to Action Banner ───────────────────────────────────── */}
      <section className="rounded-2xl bg-[#004182] text-white p-8 sm:p-12 shadow-md">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0A66C2] text-white text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Expand Your Commercial Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to discover verified enterprise partners?
          </h2>
          <p className="text-surface-200 text-xs sm:text-sm leading-relaxed text-[#B5DAF4]">
            Register your company on BizLink today, publish your first commercial need or service offer, and connect with high-scoring suppliers.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#1B8AD6] text-white font-semibold text-xs transition-colors"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
