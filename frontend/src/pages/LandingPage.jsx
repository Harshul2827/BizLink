import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Award,
  Zap,
  Lock,
  FileCheck
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F0FDFA] dark:bg-[#042F2E] border border-[#CCFBF1] dark:border-[#115E59] text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#14B8A6] shrink-0" />
          <span>Verified Corporate Partnership & Collaboration Network</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-[#0F172A] dark:text-white tracking-tight leading-[1.15]">
          Connect, collaborate, and scale with{' '}
          <span className="text-[#2563EB] dark:text-[#3B82F6]">verified enterprises</span>
        </h1>

        <p className="text-base sm:text-lg text-[#475569] dark:text-[#94A3B8] max-w-2xl mx-auto font-normal leading-relaxed">
          BizLink provides commercial enterprises with deterministic service matching, milestone-driven contract tracking, and peer reviews verified strictly by completed deliverables.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={isAuthenticated ? '/discover' : '/register'}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-subtle flex items-center justify-center space-x-2 transition-colors"
          >
            <span>{isAuthenticated ? 'Open Marketplace' : 'Register Business'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/discover"
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] font-semibold text-sm shadow-subtle transition-colors flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>Explore Active Directory</span>
          </Link>
        </div>

        {/* Value Proof Strip */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          {[
            { label: 'Rule-Based Matching', desc: 'Deterministic multi-factor score calculation', icon: Zap },
            { label: 'Verified Identity', desc: 'Administrative vetting & corporate badges', icon: ShieldCheck },
            { label: 'Lifecycle Contracts', desc: 'Structured milestones from draft to delivery', icon: FileCheck },
            { label: 'Authenticated Reviews', desc: 'Strictly restricted to fulfilled contracts', icon: Award },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-lg bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] shadow-subtle"
              >
                <div className="w-8 h-8 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-[#0F172A] dark:text-white">{item.label}</div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-snug">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Core Pillars ────────────────────────────────────────────── */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Engineered for institutional credibility
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            Facilitate high-value B2B commercial engagements with complete relationship transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 rounded-lg space-y-3 shadow-subtle hover:border-[#2563EB]/40 transition-colors">
            <div className="w-10 h-10 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Deterministic Capability Matching</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Match open commercial requirements with qualified supplier services based on category alignment, budget compatibility, and location proximity.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 rounded-lg space-y-3 shadow-subtle hover:border-[#2563EB]/40 transition-colors">
            <div className="w-10 h-10 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Structured Commercial Lifecycle</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Manage commercial engagements through audited status stages: proposal request, counterparty negotiation, active execution, and signed deliverable completion.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 rounded-lg space-y-3 shadow-subtle hover:border-[#2563EB]/40 transition-colors">
            <div className="w-10 h-10 rounded-md bg-[#F0FDFA] dark:bg-[#042F2E] text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#14B8A6]" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Tamper-Proof Reputation Network</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Counterparty reviews and performance metrics are locked exclusively to confirmed contract fulfillment, eliminating anonymous feedback and false claims.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Call to Action Banner ───────────────────────────────────── */}
      <section className="rounded-xl bg-[#0F172A] dark:bg-[#0B1220] border border-[#1E293B] text-white p-8 sm:p-10 shadow-elevated">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#1E293B] text-[#93C5FD] text-xs font-semibold border border-[#334155]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Commercial Growth</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ready to discover verified enterprise partners?
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-[#94A3B8]">
            Join verified organizations establishing compliant partnerships, discovering vetted service providers, and executing commercial contracts with confidence.
          </p>
          <div className="pt-2">
            <Link
              to={isAuthenticated ? '/discover' : '/register'}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition-colors shadow-subtle"
            >
              <span>{isAuthenticated ? 'Browse Marketplace' : 'Register Enterprise Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

