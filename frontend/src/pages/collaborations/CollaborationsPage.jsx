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
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'NEGOTIATING':
        return 'bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[#1E40AF]';
      case 'ACCEPTED':
        return 'bg-[#F0FDFA] text-[#0F766E] dark:bg-[#042F2E] dark:text-[#2DD4BF] border border-[#CCFBF1] dark:border-[#115E59]';
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'COMPLETED':
        return 'bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[#1E40AF]';
      case 'DECLINED':
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800';
      default:
        return 'bg-[#F1F5F9] text-[#475569] dark:bg-[#1E293B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]';
    }
  };

  if (!activeBusiness) {
    return (
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-10 rounded-lg shadow-subtle text-center max-w-md mx-auto my-12 space-y-3">
        <Briefcase className="w-12 h-12 text-[#2563EB] dark:text-[#3B82F6] mx-auto" />
        <h2 className="font-bold text-base text-[#0F172A] dark:text-white">Select a Business</h2>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Please choose an active business profile to manage commercial contracts and collaborations.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-2">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 sm:p-7 rounded-lg shadow-subtle space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold border border-[#DBEAFE] dark:border-[#1E40AF]">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Commercial Collaborations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Contracts & Lifecycle Engagements
            </h1>
          </div>

          <button
            onClick={() => {
              setFormError(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Collaboration</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1 border-t border-[#E2E8F0] dark:border-[#22314A] pt-4 overflow-x-auto">
          {['ALL', 'ACTIVE', 'REQUESTED', 'NEGOTIATING', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[#1E40AF]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
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
          <div className="w-8 h-8 border-2 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin" />
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Loading commercial engagements...</p>
        </div>
      ) : collaborations.length === 0 ? (
        <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-12 rounded-lg shadow-subtle text-center space-y-3">
          <Briefcase className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white">No collaborations found</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
            Click "+ Initiate Collaboration" or browse directory suppliers on the marketplace to launch a partnership.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collaborations.map((collab) => {
            const isInitiator = Number(collab.initiator_business_id) === Number(activeBusiness.business_id);

            return (
              <div
                key={collab.collaboration_id}
                className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle space-y-3 hover:border-[#2563EB]/30 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      ID: #{collab.collaboration_id}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(collab.status)}`}>
                      {collab.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-white">
                    {collab.title}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Initiated by: <strong className="text-[#0F172A] dark:text-white">{collab.initiator_business_name}</strong></span>
                    {isInitiator && <span className="text-[10px] text-[#2563EB] dark:text-[#3B82F6] font-semibold">(You)</span>}
                  </div>

                  {(collab.start_date || collab.end_date) && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Timeline: {collab.start_date || 'TBD'} &rarr; {collab.end_date || 'In Progress'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Transitions & Action Bar */}
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#22314A] flex flex-wrap items-center justify-between gap-2">
                  {collab.status === 'REQUESTED' && (
                    <div className="flex items-center space-x-2 w-full justify-end">
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'NEGOTIATING')}
                        className="px-3 py-1.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] text-xs font-semibold hover:bg-[#DBEAFE] border border-[#DBEAFE] dark:border-[#1E40AF] cursor-pointer"
                      >
                        Negotiate
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'ACCEPTED')}
                        className="px-3 py-1.5 rounded-md bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] shadow-subtle cursor-pointer"
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'DECLINED')}
                        className="px-3 py-1.5 rounded-md bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {collab.status === 'NEGOTIATING' && (
                    <div className="flex items-center space-x-2 w-full justify-end">
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'ACCEPTED')}
                        className="px-3 py-1.5 rounded-md bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] shadow-subtle cursor-pointer"
                      >
                        Accept Terms
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'DECLINED')}
                        className="px-3 py-1.5 rounded-md bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {collab.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(collab.collaboration_id, 'ACTIVE')}
                      className="w-full py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer"
                    >
                      Start Active Execution
                    </button>
                  )}

                  {collab.status === 'ACTIVE' && (
                    <div className="flex items-center space-x-2 w-full justify-between">
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-md text-red-600 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        Cancel Contract
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(collab.collaboration_id, 'COMPLETED')}
                        className="px-4 py-1.5 rounded-md bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#0D9488] shadow-subtle transition-colors cursor-pointer"
                      >
                        Confirm Deliverables Fulfilled
                      </button>
                    </div>
                  )}

                  {collab.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-[#0F766E] dark:text-[#2DD4BF] font-semibold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
                        <span>Deliverables Fulfilled</span>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCollabForReview(collab);
                          setReviewModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Submit Peer Review</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#131C2E] w-full max-w-lg rounded-lg p-6 sm:p-7 space-y-5 shadow-elevated relative border border-[#E2E8F0] dark:border-[#22314A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#22314A]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-md bg-[#2563EB] text-white">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
                  Initiate B2B Collaboration
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center space-x-2 p-2.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCollaboration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                  Project / Agreement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Joint Industrial Supply Agreement"
                  className="w-full px-3.5 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                  Partner Business ID *
                </label>
                <input
                  type="number"
                  required
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full px-3.5 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle disabled:opacity-60 transition-colors cursor-pointer"
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

