import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Layers,
  Heart,
  MessageSquare,
  Send,
  Building2,
  Share2,
  Flag,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function PostsPage() {
  const { user, activeBusiness } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Expanded comments state: { [postId]: { open: boolean, comments: [], loading: boolean, newComment: '' } }
  const [commentsState, setCommentsState] = useState({});

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      setPosts(res.data || []);
    } catch (err) {
      console.warn('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !activeBusiness?.business_id) return;

    try {
      setPosting(true);
      await api.post('/posts', {
        business_id: activeBusiness.business_id,
        content: newContent.trim()
      });
      setNewContent('');
      loadFeed();
    } catch (err) {
      alert(err.message || 'Failed to publish post');
    } finally {
      setPosting(false);
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/interactions`, {
        interaction_type: 'LIKE'
      });

      // Optimistically update like count
      setPosts((prev) =>
        prev.map((p) => {
          if (p.post_id === postId) {
            const isLiked = res.data?.action === 'LIKED';
            return {
              ...p,
              like_count: Math.max(0, (p.like_count || 0) + (isLiked ? 1 : -1))
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.warn('Like error:', err);
    }
  };

  const toggleComments = async (postId) => {
    const currentState = commentsState[postId] || { open: false, comments: [], loading: false, newComment: '' };

    if (!currentState.open) {
      // Open and load comments
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...currentState, open: true, loading: true }
      }));

      try {
        const res = await api.get(`/posts/${postId}/interactions`, {
          params: { interactionType: 'COMMENT' }
        });
        setCommentsState((prev) => ({
          ...prev,
          [postId]: { ...prev[postId], comments: res.data || [], loading: false }
        }));
      } catch (err) {
        setCommentsState((prev) => ({
          ...prev,
          [postId]: { ...prev[postId], loading: false }
        }));
      }
    } else {
      // Close
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...currentState, open: false }
      }));
    }
  };

  const handleAddComment = async (postId) => {
    const cState = commentsState[postId];
    if (!cState?.newComment?.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/interactions`, {
        interaction_type: 'COMMENT',
        body: cState.newComment.trim()
      });

      setCommentsState((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: [...(prev[postId]?.comments || []), res.data],
          newComment: ''
        }
      }));
    } catch (err) {
      alert(err.message || 'Failed to submit comment');
    }
  };

  const handleReportPost = async (postId) => {
    const reason = window.prompt('Please enter the reason for reporting this post:');
    if (!reason?.trim()) return;

    try {
      await api.post('/reports', {
        target_type: 'POST',
        target_id: postId,
        reason: reason.trim()
      });
      alert('Report submitted to moderation queue.');
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-2">
      {/* ─── Create Post Card ────────────────────────────────────────── */}
      {activeBusiness ? (
        <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF] flex items-center justify-center font-bold text-sm shrink-0">
              {activeBusiness.name ? activeBusiness.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                {activeBusiness.name}
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Share commercial updates, announcements, or requirements</p>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What commercial update, need, or capability would you like to publish?"
              className="w-full p-3 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Broadcast to verified directory members</span>
              <button
                type="submit"
                disabled={posting || !newContent.trim()}
                className="px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle disabled:opacity-50 transition-colors cursor-pointer"
              >
                {posting ? 'Publishing...' : 'Share Update'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 rounded-lg shadow-subtle text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
          Select or register an active business profile to publish corporate updates.
        </div>
      )}

      {/* ─── Feed Timeline ───────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 space-y-2">
          <div className="w-8 h-8 border-2 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Loading commercial feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-10 rounded-lg shadow-subtle text-center space-y-2 text-[#94A3B8]">
          <Layers className="w-10 h-10 mx-auto text-[#94A3B8]" />
          <p className="font-semibold text-sm text-[#0F172A] dark:text-white">No announcements published yet</p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Be the first to share an announcement or commercial opportunity.</p>
        </div>
      ) : (
        posts.map((p) => {
          const cState = commentsState[p.post_id] || { open: false, comments: [], loading: false, newComment: '' };

          return (
            <div
              key={p.post_id}
              className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle space-y-3.5 hover:border-[#2563EB]/30 transition-colors"
            >
              {/* Author & Business Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF] flex items-center justify-center font-bold text-xs shrink-0">
                    {p.business_name ? p.business_name.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div>
                    <Link
                      to={`/business/${p.business_id}`}
                      className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white hover:text-[#2563EB] dark:hover:text-[#3B82F6] hover:underline line-clamp-1"
                    >
                      {p.business_name}
                    </Link>
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span>{p.author_name}</span>
                      <span>&bull;</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleReportPost(p.post_id)}
                  className="p-1.5 rounded text-[#94A3B8] hover:text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Report Post"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <p className="text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed whitespace-pre-line">
                {p.content}
              </p>

              {/* Action Bar */}
              <div className="pt-2.5 border-t border-[#E2E8F0] dark:border-[#22314A] flex items-center space-x-6 text-xs text-[#64748B] dark:text-[#94A3B8]">
                <button
                  onClick={() => handleLikeToggle(p.post_id)}
                  className="flex items-center space-x-1.5 hover:text-[#DC2626] transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span>{p.like_count || 0} Likes</span>
                </button>

                <button
                  onClick={() => toggleComments(p.post_id)}
                  className="flex items-center space-x-1.5 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Comments</span>
                </button>
              </div>

              {/* Comment Thread */}
              {cState.open && (
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#22314A] space-y-2.5">
                  {cState.loading ? (
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8] py-1">Loading comments...</div>
                  ) : (
                    <div className="space-y-1.5">
                      {cState.comments.length === 0 ? (
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] py-1">No comments yet. Start the conversation.</p>
                      ) : (
                        cState.comments.map((comment) => (
                          <div
                            key={comment.interaction_id}
                            className="p-2.5 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] text-xs space-y-0.5 border border-[#E2E8F0] dark:border-[#334155]"
                          >
                            <div className="font-semibold text-[11px] text-[#0F172A] dark:text-white">
                              {comment.user_name}
                            </div>
                            <div className="text-[#475569] dark:text-[#94A3B8]">{comment.body}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={cState.newComment || ''}
                      onChange={(e) =>
                        setCommentsState((prev) => ({
                          ...prev,
                          [p.post_id]: { ...prev[p.post_id], newComment: e.target.value }
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(p.post_id);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                    />
                    <button
                      onClick={() => handleAddComment(p.post_id)}
                      className="p-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

