import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Users2,
  UserCheck,
  Clock,
  Send,
  MessageSquare,
  Briefcase,
  Check,
  X,
  AlertCircle,
  Building2,
  ArrowRight
} from 'lucide-react';

export default function ConnectionsPage() {
  const { activeBusiness } = useAuth();
  const [searchParams] = useSearchParams();
  const targetBizFromUrl = searchParams.get('target');

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'incoming' | 'outgoing'
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestTargetId, setRequestTargetId] = useState(targetBizFromUrl || '');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadConnections = useCallback(async () => {
    if (!activeBusiness?.business_id) return;
    try {
      setLoading(true);
      const res = await api.get('/connections', {
        params: {
          business_id: activeBusiness.business_id,
          direction: activeTab === 'incoming' ? 'RECEIVED' : activeTab === 'outgoing' ? 'SENT' : 'ALL',
          status: activeTab === 'active' ? 'ACCEPTED' : 'PENDING'
        }
      });
      setConnections(res.data || []);
    } catch (err) {
      console.warn('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness, activeTab]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!requestTargetId.trim()) return;
    try {
      setSendingRequest(true);
      setFeedback(null);
      await api.post('/connections', {
        requester_business_id: activeBusiness.business_id,
        receiver_business_id: Number(requestTargetId)
      });
      setFeedback({ type: 'success', message: 'Connection request sent successfully!' });
      setRequestTargetId('');
      if (activeTab === 'outgoing') loadConnections();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send request.' });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUpdateStatus = async (connectionId, newStatus) => {
    try {
      await api.patch(`/connections/${connectionId}`, { status: newStatus });
      loadConnections();
    } catch (err) {
      alert(err.message || 'Failed to update connection');
    }
  };

  if (!activeBusiness) {
    return (
      <div className="glass-card p-10 rounded-3xl text-center max-w-md mx-auto my-12 space-y-3">
        <Users2 className="w-12 h-12 text-brand-500 mx-auto" />
        <h2 className="font-bold text-lg text-surface-900 dark:text-white">Select a Business</h2>
        <p className="text-xs text-surface-500">Please choose or register a business profile to manage commercial network relationships.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* ─── Header & Request Form ──────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold">
              <Users2 className="w-3.5 h-3.5" />
              <span>B2B Commercial Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 dark:text-white">
              Business Connections
            </h1>
          </div>

          {/* Connect Bar */}
          <form onSubmit={handleCreateRequest} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="number"
              placeholder="Partner Business ID..."
              value={requestTargetId}
              onChange={(e) => setRequestTargetId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 w-44"
            />
            <button
              type="submit"
              disabled={sendingRequest}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 flex items-center space-x-1 transition-all disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Connect</span>
            </button>
          </form>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-t border-surface-200/60 dark:border-surface-800 pt-4">
          {[
            { id: 'active', label: 'Connected Network', icon: UserCheck },
            { id: 'incoming', label: 'Incoming Requests', icon: Clock },
            { id: 'outgoing', label: 'Sent Requests', icon: Send }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold'
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

      {/* ─── Connections List ────────────────────────────────────────── */}
      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-xs text-surface-500 font-medium">Loading connections...</p>
        </div>
      ) : connections.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center text-surface-500 text-xs space-y-2">
          <Users2 className="w-8 h-8 text-surface-400 mx-auto" />
          <p>No connections found under this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((c) => {
            const isRequester = Number(c.requester_business_id) === Number(activeBusiness.business_id);
            const partnerName = isRequester ? c.receiver_business_name : c.requester_business_name;
            const partnerId = isRequester ? c.receiver_business_id : c.requester_business_id;

            return (
              <div key={c.connection_id} className="glass-card p-5 rounded-2xl flex items-center justify-between hover:border-brand-500/30 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <Link to={`/business/${partnerId}`} className="font-bold text-sm text-surface-900 dark:text-white hover:underline">
                      {partnerName}
                    </Link>
                    <p className="text-[11px] text-surface-400">
                      Requested {new Date(c.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions based on tab */}
                <div className="flex items-center space-x-2">
                  {activeTab === 'active' && (
                    <>
                      <Link
                        to={`/messages?connection=${c.connection_id}`}
                        className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/collaborations?partner=${partnerId}`}
                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm"
                      >
                        Collaborate
                      </Link>
                    </>
                  )}

                  {activeTab === 'incoming' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(c.connection_id, 'ACCEPTED')}
                        className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold flex items-center space-x-1"
                        title="Accept Request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(c.connection_id, 'REJECTED')}
                        className="p-1.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 text-xs font-semibold flex items-center space-x-1"
                        title="Decline Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {activeTab === 'outgoing' && (
                    <button
                      onClick={() => handleUpdateStatus(c.connection_id, 'CANCELLED')}
                      className="px-3 py-1.5 rounded-xl bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-medium hover:bg-rose-100 hover:text-rose-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
