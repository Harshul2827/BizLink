import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { MessageSquare, Send, Building2, User, Clock, AlertCircle } from 'lucide-react';

export default function MessagesPage() {
  const { user, activeBusiness } = useAuth();
  const [searchParams] = useSearchParams();
  const paramConnId = searchParams.get('connection');

  const [conversations, setConversations] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(paramConnId || null);
  const [messages, setMessages] = useState([]);
  const [bodyText, setBodyText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      const res = await api.get('/conversations');
      const list = res.data || [];
      setConversations(list);
      if (!activeConnectionId && list.length > 0) {
        setActiveConnectionId(list[0].connection_id);
      }
    } catch (err) {
      console.warn('Error loading conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, [activeConnectionId]);

  const loadMessages = useCallback(async (connId) => {
    if (!connId) return;
    try {
      setLoadingMsgs(true);
      const res = await api.get(`/conversations/${connId}/messages`);
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.warn('Error loading messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConnectionId) {
      loadMessages(activeConnectionId);
    }
  }, [activeConnectionId, loadMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!bodyText.trim() || !activeConnectionId || !activeBusiness?.business_id) return;

    try {
      setSending(true);
      const res = await api.post(`/conversations/${activeConnectionId}/messages`, {
        sender_business_id: activeBusiness.business_id,
        body: bodyText.trim()
      });

      setMessages((prev) => [...prev, res.data]);
      setBodyText('');
      setTimeout(scrollToBottom, 50);
      loadConversations();
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => String(c.connection_id) === String(activeConnectionId));

  return (
    <div className="w-full py-2">
      <div className="bg-white dark:bg-[#131C2E] rounded-lg shadow-subtle overflow-hidden border border-[#E2E8F0] dark:border-[#22314A] grid grid-cols-1 md:grid-cols-12 min-h-[75vh]">
        
        {/* ─── Left Pane: Conversations List ─────────────────────────── */}
        <div className="md:col-span-4 border-r border-[#E2E8F0] dark:border-[#22314A] flex flex-col bg-[#F8FAFC] dark:bg-[#0B1220]">
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#22314A] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <h2 className="font-bold text-sm text-[#0F172A] dark:text-white">Commercial Messaging</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] font-semibold border border-[#DBEAFE] dark:border-[#1E40AF]">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]/70 dark:divide-[#22314A]/70">
            {loadingConvs ? (
              <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8] space-y-2">
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-[#94A3B8]">Establish a B2B network connection to begin direct messaging.</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = String(c.connection_id) === String(activeConnectionId);
                const isRequester = Number(c.requester_business_id) === Number(activeBusiness?.business_id);
                const partnerName = isRequester ? c.receiver_business_name : c.requester_business_name;

                return (
                  <button
                    key={c.connection_id}
                    onClick={() => setActiveConnectionId(c.connection_id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFF6FF] dark:bg-[#172554]/70 border-l-2 border-[#2563EB]'
                        : 'hover:bg-white dark:hover:bg-[#131C2E]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-subtle">
                      {partnerName ? partnerName.charAt(0).toUpperCase() : 'B'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-[#0F172A] dark:text-white truncate">
                          {partnerName}
                        </h4>
                        {c.last_message_at && (
                          <span className="text-[10px] text-[#94A3B8]">
                            {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
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
        <div className="md:col-span-8 flex flex-col justify-between h-full bg-white dark:bg-[#131C2E]">
          {activeConnectionId ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#22314A] flex items-center space-x-3">
                <div className="w-9 h-9 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF] flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                    {activeConv
                      ? (Number(activeConv.requester_business_id) === Number(activeBusiness?.business_id)
                          ? activeConv.receiver_business_name
                          : activeConv.requester_business_name)
                      : 'Commercial Partner'}
                  </h3>
                  <p className="text-[10px] text-[#0F766E] dark:text-[#2DD4BF] font-medium">
                    Verified Commercial Channel
                  </p>
                </div>
              </div>

              {/* Message Timeline */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 max-h-[55vh] bg-[#F8FAFC]/50 dark:bg-[#0B1220]/40">
                {loadingMsgs ? (
                  <div className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] py-8">Loading history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] py-12">
                    No messages in this conversation yet. Send a direct message below.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = Number(m.sender_user_id) === Number(user?.userId);
                    return (
                      <div
                        key={m.message_id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mb-0.5 px-1">
                          {isMe ? 'You' : m.sender_business_name || m.sender_name}
                        </div>
                        <div
                          className={`max-w-md p-3 rounded-md text-xs leading-relaxed ${
                            isMe
                              ? 'bg-[#2563EB] text-white rounded-br-none shadow-subtle'
                              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] rounded-bl-none border border-[#E2E8F0] dark:border-[#334155]'
                          }`}
                        >
                          {m.body}
                        </div>
                        <div className="text-[9px] text-[#94A3B8] mt-1 px-1 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E2E8F0] dark:border-[#22314A] flex items-center space-x-2 bg-white dark:bg-[#131C2E]">
                <input
                  type="text"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Type a corporate message..."
                  className="flex-1 px-3.5 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
                <button
                  type="submit"
                  disabled={sending || !bodyText.trim()}
                  className="p-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-subtle disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 text-[#94A3B8]">
              <MessageSquare className="w-10 h-10" />
              <p className="text-xs font-semibold text-[#0F172A] dark:text-white">Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

