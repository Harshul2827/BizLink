import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import ReviewModal from '../../components/trust/ReviewModal';
import {
  Briefcase,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MessageSquare,
  Award,
  ArrowRight,
  X
} from 'lucide-react';

export default function CollaborationsPage() {
  const { activeBusiness } = useAuth();
  const [searchParams] = useSearchParams();

  const partnerParam = searchParams.get('partner');
  const serviceParam = searchParams.get('service');
  const needParam = searchParams.get('need');

  const [collaborations, setCollaborations] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // New Collaboration Modal State
  const [modalOpen, setModalOpen] = useState(!!partnerParam);
  const [title, setTitle] = useState('');
  const [partnerId, setPartnerId] = useState(partnerParam || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCollabForReview, setSelectedCollabForReview] = useState(null);

  const loadCollaborations = useCallback(async () => {
    if (!activeBusiness?.business_id) return;
    try {
      setLoading(true);
      const res = await api.get('/collaborations', {
        params: {
          business_id: activeBusiness.business_id,
          status: activeTab === 'ALL' ? undefined : activeTab
        }
      });
      setCollaborations(res.data || []);
    } catch (err) {
      console.warn('Failed to load collaborations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness, activeTab]);

  useEffect(() => {
    loadCollaborations();
  }, [loadCollaborations]);

  const handleCreateCollaboration = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !partnerId) {
      setFormError('Please provide a project title and partner business ID.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/collaborations', {
        initiator_business_id: Number(activeBusiness.business_id),
        partner_business_ids: [Number(partnerId)],
        title: title.trim(),
        service_id: serviceParam ? Number(serviceParam) : null,
        need_id: needParam ? Number(needParam) : null,
        start_date: startDate || null,
        end_date: endDate || null
      });

      setModalOpen(false);
      setTitle('');
      loadCollaborations();
    } catch (err) {
      setFormError(err.message || 'Failed to initiate collaboration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (collabId, nextStatus) => {
    try {
      await api.patch(`/collaborations/${collabId}/status`, { status: nextStatus });
      loadCollaborations();
    } catch (err) {
      alert(err.message || 'Failed to update collaboration status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'NEGOTIATING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'ACCEPTED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      case 'DECLINED':
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
      default:
        return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-300';
    }
  };

  if (!activeBusiness) {
    return (
      <div className="glass-card p-10 rounded-3xl text-center max-w-md mx-auto my-12 space-y-3">
        <Briefcase className="w-12 h-12 text-violet-500 mx-auto" />
        <h2 className="font-bold text-lg text-surface-900 dark:text-white">Select a Business</h2>
        <p className="text-xs text-surface-500">Please choose an active business profile to manage collaborations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Commercial Collaborations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 dark:text-white">
              Contracts & Lifecycle Projects
            </h1>
          </div>

          <button
            onClick={() => {
              setFormError(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/25 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start Collaboration</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 border-t border-surface-200/60 dark:border-surface-800 pt-4 overflow-x-auto">
          {['ALL', 'ACTIVE', 'REQUESTED', 'NEGOTIATING', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Collaborations Grid ─────────────────────────────────────── */}
      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-violet-500/20 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-xs text-surface-500 font-medium">Loading projects...</p>
        </div>
      ) : collaborations.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3">
          <Briefcase className="w-12 h-12 text-surface-400 mx-auto" />
          <h3 className="font-bold text-base text-surface-900 dark:text-white">No collaborations found</h3>
          <p className="text-xs text-surface-500 max-w-sm mx-auto">
            Click "+ Start Collaboration" or discover matching suppliers on the marketplace to begin a new engagement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collaborations.map((collab) => {
            const isInitiator = Number(collab.initiator_business_id) === Number(activeBusiness.business_id);

            return (
              <div
                key={collab.collaboration_id}
                className="glass-card p-6 rounded-3xl space-y-4 hover:border-violet-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-surface-400">
                      ID: #{collab.collaboration_id}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(collab.status)}`}>
                      {collab.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-surface-900 dark:text-white">
                    {collab.title}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs text-surface-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Initiated by: <strong>{collab.initiator_business_name}</strong></span>
                    {isInitiator && <span className="text-[10px] text-brand-600 font-bold">(You)</span>}
                  </div>

                  {(collab.start_date || collab.end_date) && (
                    <div className="flex items-center space-x-2 text-[11px] text-surface-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Timeline: {collab.start_date || 'TBD'} &rarr; {collab.end_date || 'In Progress'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Transitions & Action Bar */}
                <div className="pt-4 border-t border-surface-200/60 dark:border-surface-800 flex flex-wrap items-center justify-between gap-2">
                  {collab.status === 'REQUESTED' && (
                    <div className="flex items-center space-x-2 w-full justify-end">
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'NEGOTIATING')}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                      >
                        Negotiate
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'ACCEPTED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-sm"
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'DECLINED')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {collab.status === 'NEGOTIATING' && (
                    <div className="flex items-center space-x-2 w-full justify-end">
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'ACCEPTED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                      >
                        Accept Terms
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'DECLINED')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {collab.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(collab.collaboration_id, 'ACTIVE')}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-sm hover:opacity-90"
                    >
                      Start Active Execution
                    </button>
                  )}

                  {collab.status === 'ACTIVE' && (
                    <div className="flex items-center space-x-2 w-full justify-between">
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-xl text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        Cancel Contract
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'COMPLETED')}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-md shadow-purple-500/20"
                      >
                        Complete Deliverables
                      </button>
                    </div>
                  )}

                  {collab.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Deliverables Fulfilled</span>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCollabForReview(collab);
                          setReviewModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold shadow-md shadow-amber-500/20 flex items-center space-x-1 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Write Review</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Start Collaboration Modal ───────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border border-surface-200 dark:border-surface-700">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-violet-600 text-white">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">
                  Initiate B2B Collaboration
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCollaboration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                  Project / Agreement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Joint Cloud Security Architecture Rollout"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                  Partner Business ID *
                </label>
                <input
                  type="number"
                  required
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-surface-600 hover:bg-surface-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-500/20 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Author Review Modal ─────────────────────────────────────── */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedCollabForReview(null);
        }}
        collaboration={selectedCollabForReview}
        reviewerBusinessId={activeBusiness.business_id}
        onSuccess={loadCollaborations}
      />
    </div>
  );
}
