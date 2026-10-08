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
  Sparkles,
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
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* ─── Create Post Card ────────────────────────────────────────── */}
      {activeBusiness ? (
        <div className="glass-card p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-surface-900 dark:text-white">
                {activeBusiness.name}
              </h3>
              <p className="text-[11px] text-surface-400">Publish corporate announcement or partnership opportunity</p>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What commercial update, need, or capability would you like to share with the network?"
              className="w-full p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-surface-400">Visible to all verified members</span>
              <button
                type="submit"
                disabled={posting || !newContent.trim()}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {posting ? 'Publishing...' : 'Share Update'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-2xl text-center text-xs text-surface-500">
          Select or create an active business profile to publish posts to the feed.
        </div>
      )}

      {/* ─── Feed Timeline ───────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 space-y-2">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-surface-400">Loading opportunity feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center space-y-2 text-surface-400">
          <Layers className="w-10 h-10 mx-auto" />
          <p className="font-semibold text-sm">No posts published yet</p>
          <p className="text-xs">Be the first to share an announcement or commercial opportunity.</p>
        </div>
      ) : (
        posts.map((p) => {
          const cState = commentsState[p.post_id] || { open: false, comments: [], loading: false, newComment: '' };

          return (
            <div key={p.post_id} className="glass-card p-6 rounded-3xl shadow-lg space-y-4 hover:border-surface-300 dark:hover:border-surface-700 transition-all">
              {/* Author & Business Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <Link
                      to={`/business/${p.business_id}`}
                      className="font-bold text-sm text-surface-900 dark:text-white hover:underline line-clamp-1"
                    >
                      {p.business_name}
                    </Link>
                    <div className="flex items-center space-x-2 text-[11px] text-surface-400">
                      <span>By {p.author_name}</span>
                      <span>&bull;</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleReportPost(p.post_id)}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Report Post"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <p className="text-xs text-surface-800 dark:text-surface-200 leading-relaxed whitespace-pre-line">
                {p.content}
              </p>

              {/* Action Bar */}
              <div className="pt-3 border-t border-surface-200/60 dark:border-surface-800 flex items-center space-x-6 text-xs text-surface-500">
                <button
                  onClick={() => handleLikeToggle(p.post_id)}
                  className="flex items-center space-x-1.5 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>{p.like_count || 0} Likes</span>
                </button>

                <button
                  onClick={() => toggleComments(p.post_id)}
                  className="flex items-center space-x-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Comments</span>
                </button>
              </div>

              {/* Comment Thread */}
              {cState.open && (
                <div className="pt-3 border-t border-surface-100 dark:border-surface-800/60 space-y-3">
                  {cState.loading ? (
                    <div className="text-xs text-surface-400 py-2">Loading comments...</div>
                  ) : (
                    <div className="space-y-2">
                      {cState.comments.length === 0 ? (
                        <p className="text-[11px] text-surface-400 py-1">No comments yet. Start the conversation.</p>
                      ) : (
                        cState.comments.map((comment) => (
                          <div
                            key={comment.interaction_id}
                            className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/60 text-xs space-y-0.5"
                          >
                            <div className="font-bold text-[11px] text-surface-700 dark:text-surface-300">
                              {comment.user_name}
                            </div>
                            <div className="text-surface-800 dark:text-surface-200">{comment.body}</div>
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
                      className="flex-1 px-3.5 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-xs text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                    <button
                      onClick={() => handleAddComment(p.post_id)}
                      className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs"
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
