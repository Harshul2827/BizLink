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
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-xs font-medium text-surface-500">Loading business profile...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-8 rounded-2xl shadow-enterprise space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Profile Not Available</h2>
        <p className="text-xs text-surface-500 dark:text-surface-400">{error || 'Unable to locate the requested business.'}</p>
        <Link to="/discover" className="inline-block px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-colors">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isMyBusiness = activeBusiness?.business_id === business.business_id;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* ─── Profile Header ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-2xl shadow-enterprise space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                  {business.name}
                </h1>
                {business.status === 'VERIFIED' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-accent-600 dark:text-accent-400 text-xs font-semibold border border-teal-200 dark:border-teal-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
                {business.category_name && (
                  <span className="flex items-center space-x-1 font-medium text-brand-600 dark:text-brand-400">
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
                  <span className="text-surface-400 font-normal">({reviewData.stats.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          {!isMyBusiness && isAuthenticated && (
            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <Link
                to={`/connections?target=${business.business_id}`}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>Connect</span>
              </Link>
              <Link
                to={`/collaborations?partner=${business.business_id}`}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Collaborate</span>
              </Link>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-surface-200 dark:border-surface-800 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', count: null },
            { id: 'services', label: 'Services & Capabilities', count: services.length },
            { id: 'needs', label: 'Commercial Needs', count: needs.length },
            { id: 'reviews', label: 'Verified Reviews', count: reviewData.stats.totalReviews }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count != null && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-2xl shadow-enterprise space-y-3">
          <h2 className="text-base font-bold text-surface-900 dark:text-white">About the Business</h2>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed whitespace-pre-line">
            {business.description || 'No detailed description provided by this business yet.'}
          </p>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-8 rounded-2xl text-center text-surface-500 dark:text-surface-400 text-xs">
              No active services listed by this business.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {services.map((s) => (
                <div key={s.service_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl shadow-enterprise space-y-2 hover:border-brand-600/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-surface-900 dark:text-white">{s.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {s.status}
                    </span>
                  </div>
                  {(s.price_min != null || s.price_max != null) && (
                    <div className="flex items-center space-x-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                      <DollarSign className="w-3.5 h-3.5" />
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
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-8 rounded-2xl text-center text-surface-500 dark:text-surface-400 text-xs">
              No open commercial needs posted by this business.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {needs.map((n) => (
                <div key={n.need_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl shadow-enterprise space-y-2 hover:border-accent-500/30 transition-colors">
                  <h3 className="font-bold text-xs sm:text-sm text-surface-900 dark:text-white">{n.title}</h3>
                  <div className="flex items-center justify-between text-xs">
                    {(n.budget_min != null || n.budget_max != null) && (
                      <span className="font-semibold text-accent-600 dark:text-accent-400">
                        Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flexible'}
                      </span>
                    )}
                    {n.deadline && (
                      <span className="flex items-center space-x-1 text-surface-500">
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
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-8 rounded-2xl text-center text-surface-500 dark:text-surface-400 text-xs">
              No reviews received yet. Reviews are unlocked upon completing collaborative contracts.
            </div>
          ) : (
            <div className="space-y-3">
              {reviewData.reviews.map((r) => (
                <div key={r.review_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl shadow-enterprise space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-surface-900 dark:text-white">
                        {r.reviewer_business_name}
                      </div>
                      <div className="text-[11px] text-surface-400">
                        By {r.author_name} &bull; {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{r.rating}/5</span>
                    </div>
                  </div>
                  {r.title && <p className="text-xs font-semibold text-surface-700 dark:text-surface-200">{r.title}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
