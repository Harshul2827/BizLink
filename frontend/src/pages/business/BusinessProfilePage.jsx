import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  Tag,
  Briefcase,
  Target,
  MessageSquare,
  Users2,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function BusinessProfilePage() {
  const { id } = useParams();
  const { activeBusiness, isAuthenticated } = useAuth();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [reviewData, setReviewData] = useState({ stats: { totalReviews: 0, averageRating: 0 }, reviews: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const [bizRes, srvRes, needRes, revRes] = await Promise.allSettled([
          api.get(`/businesses/${id}`),
          api.get(`/businesses/${id}/services`),
          api.get(`/businesses/${id}/needs`),
          api.get(`/businesses/${id}/reviews`)
        ]);

        if (bizRes.status === 'fulfilled') {
          setBusiness(bizRes.value.data);
        } else {
          throw new Error('Business profile not found');
        }

        if (srvRes.status === 'fulfilled') setServices(srvRes.value.data || []);
        if (needRes.status === 'fulfilled') setNeeds(needRes.value.data || []);
        if (revRes.status === 'fulfilled') setReviewData(revRes.value.data || { stats: { totalReviews: 0, averageRating: 0 }, reviews: [] });
      } catch (err) {
        setError(err.message || 'Failed to load business profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">Loading corporate profile...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-8 rounded-lg shadow-subtle space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">Profile Not Available</h2>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{error || 'Unable to locate the requested business.'}</p>
        <Link to="/discover" className="inline-block px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-subtle transition-colors">
          Return to Directory
        </Link>
      </div>
    );
  }

  const isMyBusiness = activeBusiness?.business_id === business.business_id;

  return (
    <div className="w-full space-y-6 py-2">
      {/* ─── Profile Header ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 sm:p-7 rounded-lg shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF] flex items-center justify-center font-bold text-xl shrink-0 shadow-subtle">
              {business.name ? business.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                  {business.name}
                </h1>
                {business.status === 'VERIFIED' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#F0FDFA] dark:bg-[#042F2E] text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold border border-[#CCFBF1] dark:border-[#115E59]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                {business.category_name && (
                  <span className="flex items-center space-x-1 font-semibold text-[#2563EB] dark:text-[#3B82F6]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{business.category_name}</span>
                  </span>
                )}
                {(business.city || business.state) && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{[business.city, business.state, business.country].filter(Boolean).join(', ')}</span>
                  </span>
                )}
                <div className="flex items-center space-x-1 font-semibold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{reviewData.stats.averageRating > 0 ? reviewData.stats.averageRating.toFixed(1) : 'New'}</span>
                  <span className="text-[#94A3B8] font-normal">({reviewData.stats.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          {!isMyBusiness && isAuthenticated && (
            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <Link
                to={`/connections?target=${business.business_id}`}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>Connect</span>
              </Link>
              <Link
                to={`/collaborations?partner=${business.business_id}`}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-md bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold shadow-subtle flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Collaborate</span>
              </Link>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-[#E2E8F0] dark:border-[#22314A] pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', count: null },
            { id: 'services', label: 'Services & Capabilities', count: services.length },
            { id: 'needs', label: 'Commercial Needs', count: needs.length },
            { id: 'reviews', label: 'Verified Reviews', count: reviewData.stats.totalReviews }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[#1E40AF] shadow-subtle'
                  : 'border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#131C2E] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count != null && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 sm:p-7 rounded-lg shadow-subtle space-y-3">
          <h2 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider text-xs">
            About the Enterprise
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed whitespace-pre-line">
            {business.description || 'No detailed commercial description provided by this business.'}
          </p>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-8 rounded-lg text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
              No active services listed by this business.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {services.map((s) => (
                <div
                  key={s.service_id}
                  className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-4 rounded-lg shadow-subtle space-y-2 hover:border-[#2563EB]/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">{s.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[#1E40AF]">
                      {s.status}
                    </span>
                  </div>
                  {(s.price_min != null || s.price_max != null) && (
                    <div className="flex items-center space-x-1 text-xs font-bold text-[#0F172A] dark:text-white">
                      <DollarSign className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>
                        {s.price_min != null && s.price_max != null
                          ? `$${s.price_min} - $${s.price_max}`
                          : s.price_min != null
                          ? `From $${s.price_min}`
                          : `Up to $${s.price_max}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'needs' && (
        <div className="space-y-3">
          {needs.length === 0 ? (
            <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-8 rounded-lg text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
              No open commercial requirements posted by this business.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {needs.map((n) => (
                <div
                  key={n.need_id}
                  className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-4 rounded-lg shadow-subtle space-y-2 hover:border-[#14B8A6]/30 transition-colors"
                >
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">{n.title}</h3>
                  <div className="flex items-center justify-between text-xs">
                    {(n.budget_min != null || n.budget_max != null) && (
                      <span className="font-bold text-[#0F766E] dark:text-[#2DD4BF]">
                        Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flexible'}
                      </span>
                    )}
                    {n.deadline && (
                      <span className="flex items-center space-x-1 text-[#64748B] dark:text-[#94A3B8]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due {n.deadline.slice(0, 10)}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviewData.reviews.length === 0 ? (
            <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-8 rounded-lg text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
              No reviews received yet. Reviews are unlocked strictly upon fulfilling collaborative contracts.
            </div>
          ) : (
            <div className="space-y-3">
              {reviewData.reviews.map((r) => (
                <div
                  key={r.review_id}
                  className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-4 rounded-lg shadow-subtle space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                        {r.reviewer_business_name}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        By {r.author_name} &bull; {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{r.rating}/5</span>
                    </div>
                  </div>
                  {r.title && <p className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">{r.title}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

