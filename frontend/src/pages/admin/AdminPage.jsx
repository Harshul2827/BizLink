import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Flag,
  Filter,
  Check,
  Ban,
  Award
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

  // User Moderation State
  const [userIdInput, setUserIdInput] = useState('');
  const [userStatusResult, setUserStatusResult] = useState(null);

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
      const res = await api.patch(`/admin/businesses/${bizIdInput.trim()}/status`, { status });
      setBizStatusResult({
        type: 'success',
        message: `Business #${bizIdInput} status updated to ${status}`
      });
    } catch (err) {
      setBizStatusResult({
        type: 'error',
        message: err.message || 'Failed to update business status'
      });
    }
  };

  const handleUpdateUserStatus = async (status) => {
    if (!userIdInput.trim()) return;
    try {
      const res = await api.patch(`/admin/users/${userIdInput.trim()}/status`, { status });
      setUserStatusResult({
        type: 'success',
        message: `User #${userIdInput} status updated to ${status}`
      });
    } catch (err) {
      setUserStatusResult({
        type: 'error',
        message: err.message || 'Failed to update user status'
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <span>System Admin Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 dark:text-white">
              Platform Administration & Moderation
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-t border-surface-200/60 dark:border-surface-800 pt-4">
          {[
            { id: 'reports', label: 'Moderation Reports Queue', icon: Flag },
            { id: 'business_mod', label: 'Business Verification & Status', icon: Building2 },
            { id: 'user_mod', label: 'User Account Moderation', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
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
            <h2 className="font-bold text-base text-surface-900 dark:text-white">User Submitted Reports</h2>
            <div className="flex items-center space-x-2">
              {['OPEN', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white'
                      : 'glass text-surface-600 dark:text-surface-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingReports ? (
            <div className="text-center py-8 text-xs text-surface-400">Loading reports queue...</div>
          ) : reports.length === 0 ? (
            <div className="glass-card p-10 rounded-3xl text-center text-xs text-surface-500">
              No reports in this queue.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.report_id}
                  className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-surface-900 dark:text-white">
                        Report #{r.report_id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                        {r.target_type} ID: {r.target_id}
                      </span>
                      <span className="text-[10px] text-surface-400">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-surface-700 dark:text-surface-300 font-medium">
                      Reason: "{r.reason}"
                    </p>
                    <p className="text-[11px] text-surface-400">
                      Reported by {r.reporter_name} ({r.reporter_email})
                    </p>
                  </div>

                  {r.status === 'OPEN' ? (
                    <button
                      onClick={() => handleResolveReport(r.report_id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 2: Business Verification & Moderation ───────────────── */}
      {activeTab === 'business_mod' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="font-bold text-lg text-surface-900 dark:text-white">
            Moderate Business Profile Status
          </h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                Target Business ID
              </label>
              <input
                type="number"
                value={bizIdInput}
                onChange={(e) => setBizIdInput(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => handleUpdateBusinessStatus('VERIFIED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Set VERIFIED Badge</span>
              </button>
              <button
                onClick={() => handleUpdateBusinessStatus('ACTIVE')}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm"
              >
                Set ACTIVE
              </button>
              <button
                onClick={() => handleUpdateBusinessStatus('SUSPENDED')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend Business</span>
              </button>
            </div>

            {bizStatusResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                bizStatusResult.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              }`}>
                <span>{bizStatusResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab 3: User Moderation ──────────────────────────────────── */}
      {activeTab === 'user_mod' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="font-bold text-lg text-surface-900 dark:text-white">
            Moderate User Account Status
          </h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                Target User ID
              </label>
              <input
                type="number"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="e.g. 2"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => handleUpdateUserStatus('ACTIVE')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
              >
                Set ACTIVE
              </button>
              <button
                onClick={() => handleUpdateUserStatus('SUSPENDED')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend User</span>
              </button>
            </div>

            {userStatusResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                userStatusResult.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
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
