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
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-2xl shadow-enterprise space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <span>System Admin Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-surface-900 dark:text-white">
              Platform Administration & Moderation
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 border-t border-surface-200 dark:border-surface-800 pt-4 overflow-x-auto">
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
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800'
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
            <h2 className="font-bold text-sm sm:text-base text-surface-900 dark:text-white">User Submitted Reports</h2>
            <div className="flex items-center space-x-1.5">
              {['OPEN', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
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
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-10 rounded-2xl shadow-enterprise text-center text-xs text-surface-500">
              No reports in this queue.
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map((r) => (
                <div
                  key={r.report_id}
                  className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-5 rounded-xl shadow-enterprise flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-surface-900 dark:text-white">
                        Report #{r.report_id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold border border-red-200 dark:border-red-800">
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
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center space-x-1">
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
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-2xl shadow-enterprise space-y-5">
          <h2 className="font-bold text-base sm:text-lg text-surface-900 dark:text-white">
            Moderate Business Profile Status
          </h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Target Business ID
              </label>
              <input
                type="number"
                value={bizIdInput}
                onChange={(e) => setBizIdInput(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-3.5 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleUpdateBusinessStatus('VERIFIED')}
                className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Set VERIFIED Badge</span>
              </button>
              <button
                onClick={() => handleUpdateBusinessStatus('ACTIVE')}
                className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Set ACTIVE
              </button>
              <button
                onClick={() => handleUpdateBusinessStatus('SUSPENDED')}
                className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend Business</span>
              </button>
            </div>

            {bizStatusResult && (
              <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                bizStatusResult.type === 'success'
                  ? 'bg-teal-50 text-accent-700 dark:bg-teal-950/40 dark:text-accent-300 border border-teal-200'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200'
              }`}>
                <span>{bizStatusResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab 3: User Moderation ──────────────────────────────────── */}
      {activeTab === 'user_mod' && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-2xl shadow-enterprise space-y-5">
          <h2 className="font-bold text-base sm:text-lg text-surface-900 dark:text-white">
            Moderate User Account Status
          </h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Target User ID
              </label>
              <input
                type="number"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="e.g. 2"
                className="w-full px-3.5 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleUpdateUserStatus('ACTIVE')}
                className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Set ACTIVE
              </button>
              <button
                onClick={() => handleUpdateUserStatus('SUSPENDED')}
                className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend User</span>
              </button>
            </div>

            {userStatusResult && (
              <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                userStatusResult.type === 'success'
                  ? 'bg-teal-50 text-accent-700 dark:bg-teal-950/40 dark:text-accent-300 border border-teal-200'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200'
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
