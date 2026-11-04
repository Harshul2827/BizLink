import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
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
  ArrowRight,
  Search,
  Loader2
} from 'lucide-react';

// Memoized Connection Card
const ConnectionCard = memo(function ConnectionCard({
  connection,
  activeBusinessId,
  activeTab,
  onUpdateStatus
}) {
  const c = connection;
  const isRequester = Number(c.requester_business_id) === Number(activeBusinessId);
  const partnerName = isRequester ? c.receiver_business_name : c.requester_business_name;
  const partnerId = isRequester ? c.receiver_business_id : c.requester_business_id;

  return (
    <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-4 rounded-lg shadow-subtle flex items-center justify-between hover:border-[#2563EB]/30 transition-colors">
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
              onClick={() => onUpdateStatus(c.connection_id, 'ACCEPTED')}
              className="p-1.5 rounded-md bg-[#F0FDFA] text-[#0F766E] dark:bg-[#042F2E] dark:text-[#2DD4BF] hover:bg-[#CCFBF1] text-xs font-semibold flex items-center space-x-1 border border-[#CCFBF1] dark:border-[#115E59] cursor-pointer"
              title="Accept Request"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStatus(c.connection_id, 'REJECTED')}
              className="p-1.5 rounded-md bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-red-100 text-xs font-semibold flex items-center space-x-1 border border-red-200 dark:border-red-900 cursor-pointer"
              title="Decline Request"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        {activeTab === 'outgoing' && (
          <button
            onClick={() => onUpdateStatus(c.connection_id, 'CANCELLED')}
            className="px-3 py-1.5 rounded-md border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] text-xs font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-subtle transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
});

export default function ConnectionsPage() {
  const { activeBusiness } = useAuth();
  const [searchParams] = useSearchParams();
  const targetBizFromUrl = searchParams.get('target');

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'incoming' | 'outgoing'
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Search & Autocomplete Partner Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Pre-load target business if passed in query string (e.g. ?target=3)
  useEffect(() => {
    if (!targetBizFromUrl) return;
    const num = Number(targetBizFromUrl);
    if (!Number.isInteger(num) || num <= 0) return;

    let mounted = true;
    const fetchTarget = async () => {
      try {
        const res = await api.get(`/business/${num}`);
        const biz = res.data?.business || res.data;
        if (biz && mounted) {
          setSelectedPartner(biz);
          setSearchQuery(biz.name || `Business #${biz.business_id}`);
        }
      } catch (err) {
        console.warn('Could not pre-fetch target business:', err);
      }
    };
    fetchTarget();
    return () => { mounted = false; };
  }, [targetBizFromUrl]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for partner businesses
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || (selectedPartner && q === selectedPartner.name)) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get('/discover/businesses', {
          params: { search: q, limit: 6 }
        });
        const items = (res.data?.businesses || res.data || []).filter(
          (b) => Number(b.business_id) !== Number(activeBusiness?.business_id)
        );
        setSearchResults(items);
        setShowDropdown(true);
      } catch (err) {
        console.warn('Search businesses error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeBusiness, selectedPartner]);

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

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Reject negative numbers immediately
    if (val.includes('-')) {
      setFeedback({
        type: 'error',
        message: 'Partner ID must be a positive integer. Negative values are not permitted.'
      });
      return;
    }
    if (selectedPartner && val !== selectedPartner.name) {
      setSelectedPartner(null);
    }
    setSearchQuery(val);
    setFeedback(null);
  };

  const handleSelectPartner = (biz) => {
    setSelectedPartner(biz);
    setSearchQuery(biz.name);
    setShowDropdown(false);
    setFeedback(null);
  };

  const handleClearPartner = () => {
    setSelectedPartner(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setFeedback(null);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFeedback(null);

    let targetId = selectedPartner ? selectedPartner.business_id : null;

    // Check if input is a direct numeric ID
    if (!targetId && searchQuery.trim()) {
      const parsed = Number(searchQuery.trim());
      if (Number.isInteger(parsed) && parsed > 0) {
        targetId = parsed;
      }
    }

    if (!targetId) {
      setFeedback({
        type: 'error',
        message: 'Please search and select a business partner or enter a valid positive business ID.'
      });
      return;
    }

    if (Number(targetId) <= 0) {
      setFeedback({
        type: 'error',
        message: 'Business partner ID must be a valid positive number.'
      });
      return;
    }

    if (Number(targetId) === Number(activeBusiness?.business_id)) {
      setFeedback({
        type: 'error',
        message: 'A business cannot establish a connection with itself.'
      });
      return;
    }

    try {
      setSendingRequest(true);
      await api.post('/connections', {
        requester_business_id: activeBusiness.business_id,
        receiver_business_id: Number(targetId)
      });
      setFeedback({
        type: 'success',
        message: `Connection request submitted successfully${selectedPartner ? ` to ${selectedPartner.name}` : ''}.`
      });
      setSelectedPartner(null);
      setSearchQuery('');
      setShowDropdown(false);
      loadConnections();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit connection request.'
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUpdateStatus = useCallback(async (connectionId, newStatus) => {
    try {
      await api.patch(`/connections/${connectionId}`, { status: newStatus });
      loadConnections();
    } catch (err) {
      alert(err.message || 'Failed to update connection status');
    }
  }, [loadConnections]);

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

          {/* Connect Search & Selection Bar */}
          <form onSubmit={handleCreateRequest} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80" ref={searchContainerRef}>
              {selectedPartner ? (
                /* Selected Partner Badge */
                <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#EFF6FF] dark:bg-[#172554] border border-[#BFDBFE] dark:border-[#1E40AF] text-[#1E3A8A] dark:text-[#93C5FD] text-xs shadow-sm">
                  <div className="flex items-center space-x-2 truncate pr-1">
                    <Building2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                    <span className="font-semibold truncate">{selectedPartner.name}</span>
                    <span className="text-[10px] font-mono bg-[#DBEAFE] dark:bg-[#1E3A8A] px-1.5 py-0.5 rounded text-[#1D4ED8] dark:text-[#93C5FD] shrink-0">
                      ID #{selectedPartner.business_id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearPartner}
                    className="text-[#64748B] hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                    title="Change partner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Search / ID Input */
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    inputMode="text"
                    placeholder="Search partner by name or enter ID..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    className="w-full pl-8 pr-8 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                  {isSearching && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  )}
                </div>
              )}

              {/* Autocomplete Results Dropdown */}
              {showDropdown && !selectedPartner && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((b) => (
                      <button
                        key={b.business_id}
                        type="button"
                        onClick={() => handleSelectPartner(b)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#EFF6FF] dark:hover:bg-[#172554] flex items-center justify-between transition-colors border-b last:border-b-0 border-[#F1F5F9] dark:border-[#334155]/60 cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-xs text-[#0F172A] dark:text-white truncate">
                            {b.name}
                          </div>
                          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                            {b.city ? `${b.city}${b.state ? `, ${b.state}` : ''}` : 'Commercial Member'}
                            {b.primary_category_name ? ` • ${b.primary_category_name}` : ''}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-semibold bg-[#F1F5F9] dark:bg-[#0F172A] text-[#2563EB] dark:text-[#60A5FA] px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#334155] shrink-0">
                          ID #{b.business_id}
                        </span>
                      </button>
                    ))
                  ) : searchQuery.trim() && !isSearching ? (
                    <div className="p-3 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                      No businesses found matching "{searchQuery}". Enter a valid ID or try a different name.
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={sendingRequest || (!selectedPartner && !searchQuery.trim())}
              className="px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {sendingRequest ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Connect</span>
                </>
              )}
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
            { id: 'active', label: 'Active Network', icon: UserCheck },
            { id: 'incoming', label: 'Incoming Requests', icon: Clock },
            { id: 'outgoing', label: 'Pending Outgoing', icon: Send }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] text-white shadow-subtle'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Network List View ───────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-12 rounded-lg shadow-subtle text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
            Loading network relationship directory...
          </div>
        ) : connections.length === 0 ? (
          <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-12 rounded-lg shadow-subtle text-center space-y-2">
            <Users2 className="w-10 h-10 text-[#94A3B8] mx-auto opacity-70" />
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
              {activeTab === 'active' && 'No active connection records'}
              {activeTab === 'incoming' && 'No pending incoming connection requests'}
              {activeTab === 'outgoing' && 'No pending outgoing connection requests'}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
              {activeTab === 'active' && 'Use the Connect bar above or browse the public directory to find enterprise counterparties.'}
              {activeTab === 'incoming' && 'When other companies request commercial partnerships with your business, they will appear here.'}
              {activeTab === 'outgoing' && 'Outgoing collaboration and connection requests awaiting confirmation will display here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connections.map((c) => (
              <ConnectionCard
                key={c.connection_id}
                connection={c}
                activeBusinessId={activeBusiness.business_id}
                activeTab={activeTab}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
