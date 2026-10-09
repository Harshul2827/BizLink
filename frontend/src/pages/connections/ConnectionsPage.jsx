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
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-10 rounded-2xl shadow-enterprise text-center max-w-md mx-auto my-12 space-y-3">
        <Users2 className="w-12 h-12 text-brand-600 mx-auto" />
        <h2 className="font-bold text-base text-surface-900 dark:text-white">Select a Business</h2>
        <p className="text-xs text-surface-500">Please choose or register a business profile to manage commercial network relationships.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* ─── Header & Request Form ──────────────────────────────────── */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-2xl shadow-enterprise space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-200 dark:border-brand-800">
              <Users2 className="w-3.5 h-3.5" />
              <span>Commercial Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-surface-900 dark:text-white">
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
              className="px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors w-44"
            />
            <button
              type="submit"
              disabled={sendingRequest}
              className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Connect</span>
            </button>
          </form>
        </div>

        {feedback && (
          <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-teal-50 text-accent-700 dark:bg-teal-950/40 dark:text-accent-300 border border-teal-200 dark:border-teal-900'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 border-t border-surface-200 dark:border-surface-800 pt-4">
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
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

      {/* ─── Connections List ────────────────────────────────────────── */}
      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-xs text-surface-500 font-medium">Loading connections...</p>
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-10 rounded-2xl shadow-enterprise text-center text-surface-500 text-xs space-y-2">
          <Users2 className="w-8 h-8 text-surface-400 mx-auto" />
          <p>No connections found under this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {connections.map((c) => {
            const isRequester = Number(c.requester_business_id) === Number(activeBusiness.business_id);
            const partnerName = isRequester ? c.receiver_business_name : c.requester_business_name;
            const partnerId = isRequester ? c.receiver_business_id : c.requester_business_id;

            return (
              <div key={c.connection_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl shadow-enterprise flex items-center justify-between hover:border-brand-600/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <Link to={`/business/${partnerId}`} className="font-bold text-xs sm:text-sm text-surface-900 dark:text-white hover:text-brand-600 hover:underline">
                      {partnerName}
                    </Link>
                    <p className="text-[11px] text-surface-400">
                      Requested {new Date(c.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions based on tab */}
                <div className="flex items-center space-x-1.5">
                  {activeTab === 'active' && (
                    <>
                      <Link
                        to={`/messages?connection=${c.connection_id}`}
                        className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/collaborations?partner=${partnerId}`}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        Collaborate
                      </Link>
                    </>
                  )}

                  {activeTab === 'incoming' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(c.connection_id, 'ACCEPTED')}
                        className="p-1.5 rounded-lg bg-teal-50 text-accent-700 dark:bg-teal-950 dark:text-accent-300 hover:bg-teal-100 text-xs font-semibold flex items-center space-x-1 border border-teal-200 dark:border-teal-800 cursor-pointer"
                        title="Accept Request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(c.connection_id, 'REJECTED')}
                        className="p-1.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-red-100 text-xs font-semibold flex items-center space-x-1 border border-red-200 dark:border-red-800 cursor-pointer"
                        title="Decline Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {activeTab === 'outgoing' && (
                    <button
                      onClick={() => handleUpdateStatus(c.connection_id, 'CANCELLED')}
                      className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer"
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
