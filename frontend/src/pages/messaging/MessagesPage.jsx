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
    <div className="max-w-6xl mx-auto py-2">
      <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border border-surface-200 dark:border-surface-800 grid grid-cols-1 md:grid-cols-12 min-h-[75vh]">
        
        {/* ─── Left Pane: Conversations List ─────────────────────────── */}
        <div className="md:col-span-4 border-r border-surface-200/60 dark:border-surface-800 flex flex-col bg-surface-50/50 dark:bg-surface-900/30">
          <div className="p-4 border-b border-surface-200/60 dark:border-surface-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="font-bold text-base text-surface-900 dark:text-white">Conversations</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-semibold">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/60">
            {loadingConvs ? (
              <div className="p-8 text-center text-xs text-surface-500">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-surface-500 space-y-2">
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-surface-400">Establish a B2B connection to begin messaging partners.</p>
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
                    className={`w-full text-left p-4 transition-all flex items-start space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50/80 dark:bg-brand-950/40 border-l-4 border-brand-600'
                        : 'hover:bg-surface-100/60 dark:hover:bg-surface-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {partnerName ? partnerName[0] : 'B'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-surface-900 dark:text-white truncate">
                          {partnerName}
                        </h4>
                        {c.last_message_at && (
                          <span className="text-[10px] text-surface-400">
                            {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-500 dark:text-surface-400 truncate mt-0.5">
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
        <div className="md:col-span-8 flex flex-col justify-between h-full bg-white/40 dark:bg-surface-950/40">
          {activeConnectionId ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-surface-200/60 dark:border-surface-800 flex items-center space-x-3 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-surface-900 dark:text-white">
                    {activeConv
                      ? (Number(activeConv.requester_business_id) === Number(activeBusiness?.business_id)
                          ? activeConv.receiver_business_name
                          : activeConv.requester_business_name)
                      : 'Commercial Partner'}
                  </h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Verified Direct Commercial Channel
                  </p>
                </div>
              </div>

              {/* Message Timeline */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[55vh]">
                {loadingMsgs ? (
                  <div className="text-center text-xs text-surface-400 py-8">Loading chat history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs text-surface-400 py-12">
                    No messages in this conversation yet. Send a greeting below.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = Number(m.sender_user_id) === Number(user?.userId);
                    return (
                      <div
                        key={m.message_id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-surface-400 mb-1 px-1">
                          {isMe ? 'You' : m.sender_business_name || m.sender_name}
                        </div>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-none'
                              : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-bl-none border border-surface-200/50 dark:border-surface-700/50'
                          }`}
                        >
                          {m.body}
                        </div>
                        <div className="text-[9px] text-surface-400 mt-1 px-1 flex items-center space-x-1">
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
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-surface-200/60 dark:border-surface-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Type a secure message..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="submit"
                  disabled={sending || !bodyText.trim()}
                  className="p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 text-surface-400">
              <MessageSquare className="w-12 h-12" />
              <p className="text-sm font-semibold">Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
