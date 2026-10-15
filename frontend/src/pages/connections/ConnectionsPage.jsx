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
      setFeedback({ type: 'success', message: 'Connection request submitted successfully.' });
      setRequestTargetId('');
      if (activeTab === 'outgoing') loadConnections();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit connection request.' });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUpdateStatus = async (connectionId, newStatus) => {
    try {
      await api.patch(`/connections/${connectionId}`, { status: newStatus });
      loadConnections();
    } catch (err) {
      alert(err.message || 'Failed to update connection status');
    }
  };

  if (!activeBusiness) {
    return (
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-10 rounded-lg shadow-subtle text-center max-w-md mx-auto my-12 space-y-3">
        <Users2 className="w-12 h-12 text-[#2563EB] dark:text-[#3B82F6] mx-auto" />
        <h2 className="font-bold text-base text-[#0F172A] dark:text-white">Select a Business</h2>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Please choose or register a business profile to manage commercial network relationships.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-2">
      {/* ─── Header & Request Form ──────────────────────────────────── */}
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 sm:p-7 rounded-lg shadow-subtle space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold border border-[#DBEAFE] dark:border-[#1E40AF]">
              <Users2 className="w-3.5 h-3.5" />
              <span>Commercial Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
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
              className="px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors w-44"
            />
            <button
              type="submit"
              disabled={sendingRequest}
              className="px-3.5 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center space-x-1.5 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Connect</span>
            </button>
          </form>
        </div>

        {feedback && (
          <div className={`p-3 rounded-md text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-[#F0FDFA] text-[#0F766E] dark:bg-[#042F2E] dark:text-[#2DD4BF] border border-[#CCFBF1] dark:border-[#115E59]'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/60'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 border-t border-[#E2E8F0] dark:border-[#22314A] pt-4">
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
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[#1E40AF]'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
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
          <div className="w-8 h-8 border-2 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin" />
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Loading network connections...</p>
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-10 rounded-lg shadow-subtle text-center text-[#64748B] dark:text-[#94A3B8] text-xs space-y-2">
          <Users2 className="w-8 h-8 text-[#94A3B8] mx-auto" />
          <p>No connections found in this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {connections.map((c) => {
            const isRequester = Number(c.requester_business_id) === Number(activeBusiness.business_id);
            const partnerName = isRequester ? c.receiver_business_name : c.requester_business_name;
            const partnerId = isRequester ? c.receiver_business_id : c.requester_business_id;

            return (
              <div
                key={c.connection_id}
                className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-4 rounded-lg shadow-subtle flex items-center justify-between hover:border-[#2563EB]/30 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF] flex items-center justify-center font-bold text-xs shrink-0">
                    {partnerName ? partnerName.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/business/${partnerId}`}
                      className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white hover:text-[#2563EB] dark:hover:text-[#3B82F6] hover:underline truncate block"
                    >
                      {partnerName}
                    </Link>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Requested {new Date(c.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions based on tab */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {activeTab === 'active' && (
                    <>
                      <Link
                        to={`/messages?connection=${c.connection_id}`}
                        className="p-1.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#EFF6FF] dark:hover:bg-[#172554] transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/collaborations?partner=${partnerId}`}
                        className="px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle transition-colors"
                      >
                        Collaborate
                      </Link>
                    </>
                  )}

                  {activeTab === 'incoming' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(c.connection_id, 'ACCEPTED')}
                        className="p-1.5 rounded-md bg-[#F0FDFA] text-[#0F766E] dark:bg-[#042F2E] dark:text-[#2DD4BF] hover:bg-[#CCFBF1] text-xs font-semibold flex items-center space-x-1 border border-[#CCFBF1] dark:border-[#115E59] cursor-pointer"
                        title="Accept Request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(c.connection_id, 'REJECTED')}
                        className="p-1.5 rounded-md bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-red-100 text-xs font-semibold flex items-center space-x-1 border border-red-200 dark:border-red-900 cursor-pointer"
                        title="Decline Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {activeTab === 'outgoing' && (
                    <button
                      onClick={() => handleUpdateStatus(c.connection_id, 'CANCELLED')}
                      className="px-3 py-1.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#94A3B8] text-xs font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer"
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

