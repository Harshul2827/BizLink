import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Flag,
  Check,
  Ban,
  Award,
  Clock,
  Search
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'business_mod' | 'user_mod'

  // Reports Queue State
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [loadingReports, setLoadingReports] = useState(false);

  // Business Moderation State
  const [bizIdInput, setBizIdInput] = useState('');
  const [bizStatusResult, setBizStatusResult] = useState(null);
  const [bizSubmitting, setBizSubmitting] = useState(false);

  // User Moderation State
  const [userIdInput, setUserIdInput] = useState('');
  const [userStatusResult, setUserStatusResult] = useState(null);
  const [userSubmitting, setUserSubmitting] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const res = await api.get('/admin/reports', {
        params: { status: statusFilter }
      });
      setReports(res.data || []);
    } catch (err) {
      console.warn('Error loading reports queue:', err);
    } finally {
      setLoadingReports(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, loadReports]);

  const handleResolveReport = async (reportId) => {
    try {
      await api.patch(`/admin/reports/${reportId}/resolve`);
      loadReports();
    } catch (err) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  const handleUpdateBusinessStatus = async (status) => {
    if (!bizIdInput.trim()) return;
    try {
      setBizSubmitting(true);
      await api.patch(`/admin/businesses/${bizIdInput.trim()}/status`, { status });
      setBizStatusResult({
        type: 'success',
        message: `Business entity #${bizIdInput} status successfully updated to ${status}.`
      });
    } catch (err) {
      setBizStatusResult({
        type: 'error',
        message: err.message || 'Failed to update business status.'
      });
    } finally {
      setBizSubmitting(false);
    }
  };

  const handleUpdateUserStatus = async (status) => {
    if (!userIdInput.trim()) return;
    try {
      setUserSubmitting(true);
      await api.patch(`/admin/users/${userIdInput.trim()}/status`, { status });
      setUserStatusResult({
        type: 'success',
        message: `User account #${userIdInput} status successfully updated to ${status}.`
      });
    } catch (err) {
      setUserStatusResult({
        type: 'error',
        message: err.message || 'Failed to update user status.'
      });
    } finally {
      setUserSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0B1220] border border-surface-200 dark:border-surface-800 p-6 sm:p-7 rounded-lg shadow-enterprise space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-md bg-brand-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                <span>Enterprise Governance</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-surface-900 dark:text-white">
                Platform Governance & Compliance Console
              </h1>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Audit logs, KYB verification authority, and counterparty moderation.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-md border border-surface-200 dark:border-surface-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Root Admin Role Authenticated</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 border-t border-surface-200 dark:border-surface-800 pt-3.5 overflow-x-auto">
          {[
            { id: 'reports', label: 'Compliance Reports Queue', icon: Flag },
            { id: 'business_mod', label: 'Business Verification & Standing', icon: Building2 },
            { id: 'user_mod', label: 'User Account Access Control', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-xs'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab 1: Reports Queue ────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-surface-900 dark:text-white">
                Member Escalations & Integrity Reports
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Filter by resolution status to review flagged listings, profiles, or engagements.
              </p>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-surface-100 dark:bg-[#070D18] p-1 rounded-md border border-surface-200 dark:border-surface-800">
              {['OPEN', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xs border border-surface-200 dark:border-surface-700'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingReports ? (
            <div className="text-center py-12 text-xs text-surface-400">Loading audit log queue...</div>
          ) : reports.length === 0 ? (
            <div className="bg-white dark:bg-[#0B1220] border border-surface-200 dark:border-surface-800 p-12 rounded-lg shadow-enterprise text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto" />
              <p className="text-sm font-bold text-surface-900 dark:text-white">Queue Clear</p>
              <p className="text-xs text-surface-500">No {statusFilter.toLowerCase()} reports require moderation review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.report_id}
                  className="bg-white dark:bg-[#0B1220] border border-surface-200 dark:border-surface-800 p-4 sm:p-5 rounded-lg shadow-enterprise flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-surface-900 dark:text-white">
                        Case #{r.report_id}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-bold border border-red-200 dark:border-red-800">
                        {r.target_type} ID: {r.target_id}
                      </span>
                      <span className="text-[11px] text-surface-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(r.created_at).toLocaleString()}</span>
                      </span>
                    </div>

                    <p className="text-xs text-surface-800 dark:text-surface-200 font-medium">
                      <span className="text-surface-500 font-normal">Stated Reason: </span>
                      "{r.reason}"
                    </p>

                    <p className="text-[11px] text-surface-500 dark:text-surface-400">
                      Filed by: <strong className="text-surface-700 dark:text-surface-300">{r.reporter_name}</strong> ({r.reporter_email})
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {r.status === 'OPEN' ? (
                      <button
                        onClick={() => handleResolveReport(r.report_id)}
                        className="px-3.5 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve Case</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Case Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 2: Business Verification & Moderation ───────────────── */}
      {activeTab === 'business_mod' && (
        <div className="bg-white dark:bg-[#0B1220] border border-surface-200 dark:border-surface-800 p-6 sm:p-7 rounded-lg shadow-enterprise space-y-5">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-surface-900 dark:text-white">
              Business Profile Standing & Verification Badge
            </h2>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Apply institutional KYC/KYB standing, grant official verification seal, or restrict non-compliant profiles.
            </p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Target Business Entity ID *
              </label>
              <input
                type="number"
                value={bizIdInput}
                onChange={(e) => setBizIdInput(e.target.value)}
                placeholder="Enter Business ID (e.g. 1)"
                className="w-full px-3.5 py-2 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={bizSubmitting || !bizIdInput.trim()}
                onClick={() => handleUpdateBusinessStatus('VERIFIED')}
                className="px-3.5 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Grant VERIFIED Seal</span>
              </button>

              <button
                type="button"
                disabled={bizSubmitting || !bizIdInput.trim()}
                onClick={() => handleUpdateBusinessStatus('ACTIVE')}
                className="px-3.5 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Set ACTIVE Standard
              </button>

              <button
                type="button"
                disabled={bizSubmitting || !bizIdInput.trim()}
                onClick={() => handleUpdateBusinessStatus('SUSPENDED')}
                className="px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend Entity</span>
              </button>
            </div>

            {bizStatusResult && (
              <div className={`p-3 rounded-md text-xs flex items-center space-x-2 ${
                bizStatusResult.type === 'success'
                  ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                <span>{bizStatusResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab 3: User Moderation ──────────────────────────────────── */}
      {activeTab === 'user_mod' && (
        <div className="bg-white dark:bg-[#0B1220] border border-surface-200 dark:border-surface-800 p-6 sm:p-7 rounded-lg shadow-enterprise space-y-5">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-surface-900 dark:text-white">
              Individual User Account Moderation
            </h2>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Manage login privilege and authentication status for registered operators.
            </p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Target User Account ID *
              </label>
              <input
                type="number"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="Enter User ID (e.g. 2)"
                className="w-full px-3.5 py-2 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={userSubmitting || !userIdInput.trim()}
                onClick={() => handleUpdateUserStatus('ACTIVE')}
                className="px-3.5 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Set ACTIVE Status
              </button>

              <button
                type="button"
                disabled={userSubmitting || !userIdInput.trim()}
                onClick={() => handleUpdateUserStatus('SUSPENDED')}
                className="px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend User Access</span>
              </button>
            </div>

            {userStatusResult && (
              <div className={`p-3 rounded-md text-xs flex items-center space-x-2 ${
                userStatusResult.type === 'success'
                  ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                <span>{userStatusResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
