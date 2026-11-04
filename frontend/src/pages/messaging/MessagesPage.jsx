import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  MessageSquare,
  Send,
  Building2,
  Clock,
  Search,
  CheckCheck,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-teal-600',
  'bg-amber-600',
  'bg-rose-600'
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MessagesPage() {
  const { user, activeBusiness, businesses } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramConnId = searchParams.get('connection');

  const [conversations, setConversations] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(paramConnId || null);
  const [messages, setMessages] = useState([]);
  const [bodyText, setBodyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Sync activeConnectionId when param changes
  useEffect(() => {
    if (paramConnId && String(paramConnId) !== String(activeConnectionId)) {
      setActiveConnectionId(paramConnId);
    }
  }, [paramConnId]);

  // Helper to extract partner details
  const getPartnerDetails = useCallback((c) => {
    if (!c) return { name: 'Commercial Partner', city: '', category: '', initial: 'B' };
    const myBizId = activeBusiness?.business_id;
    const isRequester = myBizId ? Number(c.requester_business_id) === Number(myBizId) : false;

    const name = isRequester
      ? (c.receiver_business_name || c.receiver_name || `Business #${c.receiver_business_id}`)
      : (c.requester_business_name || c.requester_name || `Business #${c.requester_business_id}`);

    const city = isRequester ? (c.receiver_city || '') : (c.requester_city || '');
    const category = isRequester ? (c.receiver_category || '') : (c.requester_category || '');
    const initial = name && name.trim() ? name.trim().charAt(0).toUpperCase() : 'B';

    return { name, city, category, initial, isRequester };
  }, [activeBusiness]);

  // Load conversation threads
  const loadConversations = useCallback(async (options = {}) => {
    const isSilent = options.silent === true;
    try {
      if (!isSilent) setLoadingConvs(true);
      const res = await api.get('/conversations');
      const list = res.data || [];
      setConversations(list);

      setActiveConnectionId((currentId) => {
        if (currentId && list.some((c) => String(c.connection_id) === String(currentId))) {
          return currentId;
        }
        if (paramConnId && list.some((c) => String(c.connection_id) === String(paramConnId))) {
          return paramConnId;
        }
        return list.length > 0 ? list[0].connection_id : null;
      });
    } catch (err) {
      console.warn('Error loading conversations:', err);
    } finally {
      if (!isSilent) setLoadingConvs(false);
    }
  }, [paramConnId]);

  // Load message thread for active connection
  const loadMessages = useCallback(async (connId, options = {}) => {
    if (!connId) return;
    const isSilent = options.silent === true;
    try {
      if (!isSilent) setLoadingMsgs(true);
      const res = await api.get(`/conversations/${connId}/messages`);
      const fetched = res.data || [];
      setMessages((prev) => {
        // If count or latest message changed, update state
        if (prev.length !== fetched.length || JSON.stringify(prev) !== JSON.stringify(fetched)) {
          setTimeout(() => scrollToBottom(isSilent ? 'auto' : 'smooth'), 50);
          return fetched;
        }
        return prev;
      });
    } catch (err) {
      console.warn('Error loading messages:', err);
    } finally {
      if (!isSilent) setLoadingMsgs(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConnectionId) {
      loadMessages(activeConnectionId);
    } else {
      setMessages([]);
    }
  }, [activeConnectionId, loadMessages]);

  // Live background polling (every 3.5s) for WhatsApp-like auto update
  useEffect(() => {
    if (!activeConnectionId) return;
    const interval = setInterval(() => {
      loadMessages(activeConnectionId, { silent: true });
      loadConversations({ silent: true });
    }, 3500);

    return () => clearInterval(interval);
  }, [activeConnectionId, loadMessages, loadConversations]);

  // Select conversation and sync URL
  const handleSelectConversation = (connId) => {
    setActiveConnectionId(connId);
    setSearchParams({ connection: connId }, { replace: true });
  };

  const activeConv = conversations.find((c) => String(c.connection_id) === String(activeConnectionId));
  const activePartner = getPartnerDetails(activeConv);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!bodyText.trim() || !activeConnectionId || !activeConv) return;

    // Resolve current user's business participating in this connection
    let senderBizId = activeBusiness?.business_id;
    if (
      !senderBizId ||
      (Number(senderBizId) !== Number(activeConv.requester_business_id) &&
       Number(senderBizId) !== Number(activeConv.receiver_business_id))
    ) {
      const matchInList = (businesses || []).find(
        (b) =>
          Number(b.business_id) === Number(activeConv.requester_business_id) ||
          Number(b.business_id) === Number(activeConv.receiver_business_id)
      );
      if (matchInList) {
        senderBizId = matchInList.business_id;
      } else {
        // If logged-in user owns the receiver, use receiver; else requester
        senderBizId = activePartner.isRequester
          ? activeConv.requester_business_id
          : activeConv.receiver_business_id;
      }
    }

    try {
      setSending(true);
      const res = await api.post(`/conversations/${activeConnectionId}/messages`, {
        sender_business_id: senderBizId,
        body: bodyText.trim()
      });

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setBodyText('');
      setTimeout(() => scrollToBottom('smooth'), 50);
      loadConversations({ silent: true });
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const details = getPartnerDetails(c);
    const q = searchTerm.toLowerCase();
    return (
      details.name.toLowerCase().includes(q) ||
      (details.city && details.city.toLowerCase().includes(q)) ||
      (details.category && details.category.toLowerCase().includes(q)) ||
      (c.last_message_body && c.last_message_body.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full py-2">
      <div className="bg-white dark:bg-[#131C2E] rounded-xl shadow-subtle overflow-hidden border border-[#E2E8F0] dark:border-[#22314A] grid grid-cols-1 md:grid-cols-12 min-h-[78vh]">
        
        {/* ─── Left Pane: Conversations List ─────────────────────────── */}
        <div className="md:col-span-4 border-r border-[#E2E8F0] dark:border-[#22314A] flex flex-col bg-[#F8FAFC] dark:bg-[#0B1220]">
          
          {/* Header */}
          <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#22314A] flex items-center justify-between bg-white dark:bg-[#131C2E]">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#3B82F6]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[#0F172A] dark:text-white">Commercial Messaging</h2>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Direct enterprise counterparties</p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] font-bold border border-[#DBEAFE] dark:border-[#1E40AF]">
              {conversations.length}
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-2.5 border-b border-[#E2E8F0]/80 dark:border-[#22314A]/80 bg-[#F8FAFC] dark:bg-[#0B1220]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search connected businesses..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]/60 dark:divide-[#22314A]/60">
            {loadingConvs ? (
              <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8] space-y-2">
                <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading conversation threads...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8] space-y-2">
                <p>{searchTerm ? 'No counterparties matching search.' : 'No active connections yet.'}</p>
                <p className="text-[11px] text-[#94A3B8]">
                  {searchTerm ? 'Try a different business name.' : 'Accept incoming requests or connect with businesses in Network.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = String(c.connection_id) === String(activeConnectionId);
                const partner = getPartnerDetails(c);
                const avatarBg = getAvatarColor(partner.name);
                const timeStr = c.last_message_at || c.last_message_time;

                return (
                  <button
                    key={c.connection_id}
                    onClick={() => handleSelectConversation(c.connection_id)}
                    className={`w-full text-left p-3 transition-colors flex items-start space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFF6FF] dark:bg-[#1E293B] border-l-4 border-[#2563EB]'
                        : 'hover:bg-white dark:hover:bg-[#131C2E]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl ${avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}>
                      {partner.initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-[#0F172A] dark:text-white truncate">
                          {partner.name}
                        </h4>
                        {timeStr && (
                          <span className="text-[10px] text-[#94A3B8] shrink-0 ml-1">
                            {new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {/* Sub-info: City & Category */}
                      {(partner.category || partner.city) && (
                        <div className="flex items-center space-x-1.5 text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          {partner.category && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#22314A] text-slate-700 dark:text-slate-300 font-medium">
                              {partner.category}
                            </span>
                          )}
                          {partner.city && (
                            <span className="flex items-center text-[#94A3B8]">
                              <MapPin className="w-2.5 h-2.5 mr-0.5 inline" />
                              {partner.city}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Last Message Preview */}
                      <p className={`text-xs truncate mt-1 ${c.last_message_body ? 'text-[#334155] dark:text-[#CBD5E1]' : 'text-[#94A3B8] italic'}`}>
                        {c.last_message_body || 'Start a conversation...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ─── Right Pane: Active Message Thread ──────────────────────── */}
        <div className="md:col-span-8 flex flex-col justify-between h-full bg-[#F8FAFC]/40 dark:bg-[#0B1220]/60">
          {activeConnectionId && activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#22314A] flex items-center justify-between bg-white dark:bg-[#131C2E]">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl ${getAvatarColor(activePartner.name)} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                    {activePartner.initial}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                        {activePartner.name}
                      </h3>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      {activePartner.category && <span>{activePartner.category}</span>}
                      {activePartner.category && activePartner.city && <span>•</span>}
                      {activePartner.city && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5" />
                          {activePartner.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1E293B] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                    Connection #{activeConnectionId}
                  </span>
                </div>
              </div>

              {/* Message Timeline */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 max-h-[62vh]">
                {loadingMsgs ? (
                  <div className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] py-12 space-y-2">
                    <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] py-16 space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-sm text-[#0F172A] dark:text-white">
                      Start your discussion with {activePartner.name}
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                      All messages exchanged here are encrypted, permanently saved to your BizLink records, and visible to verified members of both businesses.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const myUserId = user?.userId || user?.user_id;
                    const myBizId = activeBusiness?.business_id;

                    const isMe =
                      (myUserId && Number(m.sender_user_id) === Number(myUserId)) ||
                      (myBizId && Number(m.sender_business_id) === Number(myBizId));

                    const showDateSeparator =
                      idx === 0 ||
                      formatDateLabel(messages[idx - 1]?.sent_at) !== formatDateLabel(m.sent_at);

                    return (
                      <React.Fragment key={m.message_id || idx}>
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-3">
                            <span className="text-[10px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-slate-200/70 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-slate-800 shadow-xs">
                              {formatDateLabel(m.sent_at)}
                            </span>
                          </div>
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mb-1 px-1 font-medium">
                            {isMe ? 'You' : m.sender_business_name || m.sender_name || activePartner.name}
                          </div>
                          
                          <div
                            className={`max-w-md px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-[#2563EB] text-white rounded-tr-none'
                                : 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white rounded-tl-none border border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          </div>

                          <div className="text-[9px] text-[#94A3B8] mt-1 px-1 flex items-center space-x-1">
                            <span>
                              {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-[#2563EB] dark:text-[#60A5FA]" />}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer (Sticky Footer) */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#E2E8F0] dark:border-[#22314A] flex items-center space-x-2 bg-white dark:bg-[#131C2E]"
              >
                <input
                  type="text"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder={`Message ${activePartner.name}...`}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#22314A] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !bodyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs shadow-sm disabled:opacity-50 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <span>{sending ? 'Sending...' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-[#94A3B8]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#1E293B] flex items-center justify-center text-slate-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">Select a business counterparty</p>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-xs">
                  Choose a verified connection from the left panel to review past messages or send a new direct business message.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
