import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import MatchScoreBadge from '../../components/discovery/MatchScoreBadge';
import {
  Compass,
  Search,
  Building2,
  Briefcase,
  Target,
  Sparkles,
  MapPin,
  Tag,
  Star,
  Users2,
  Filter,
  DollarSign,
  Calendar,
  ArrowRight
} from 'lucide-react';

export default function DiscoverPage() {
  const { activeBusiness, isAuthenticated } = useAuth();

  const [mode, setMode] = useState('businesses'); // 'businesses' | 'services' | 'needs' | 'matches'
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myNeeds, setMyNeeds] = useState([]);
  const [selectedNeedId, setSelectedNeedId] = useState('');

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Load user's business needs for Match explorer
  useEffect(() => {
    async function loadMyNeeds() {
      if (activeBusiness?.business_id) {
        try {
          const res = await api.get(`/businesses/${activeBusiness.business_id}/needs`);
          const list = res.data || [];
          setMyNeeds(list);
          if (list.length > 0 && !selectedNeedId) {
            setSelectedNeedId(String(list[0].need_id));
          }
        } catch (e) {
          console.warn('Error loading my needs:', e);
        }
      }
    }
    loadMyNeeds();
  }, [activeBusiness, selectedNeedId]);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (query.trim()) params.q = query.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      if (cityFilter.trim()) params.city = cityFilter.trim();

      let endpoint = '/discover/businesses';
      if (mode === 'services') endpoint = '/discover/services';
      if (mode === 'needs') endpoint = '/discover/needs';
      if (mode === 'matches') {
        if (!selectedNeedId) {
          setResults([]);
          setLoading(false);
          return;
        }
        endpoint = `/discover/needs/${selectedNeedId}/matches`;
      }

      const res = await api.get(endpoint, { params });
      setResults(res.data || []);
    } catch (err) {
      console.warn('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [mode, query, selectedCategory, cityFilter, selectedNeedId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* ─── Page Header & Mode Selector ─────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>B2B Commercial Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 dark:text-white">
              Discover Partners, Offers & Needs
            </h1>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 p-1.5 rounded-2xl bg-surface-100 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-800">
            {[
              { id: 'businesses', label: 'Businesses', icon: Building2 },
              { id: 'services', label: 'Services', icon: Briefcase },
              { id: 'needs', label: 'Open Needs', icon: Target },
              ...(activeBusiness ? [{ id: 'matches', label: 'Rule Matches', icon: Sparkles }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-md font-bold'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Search & Filters Bar ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {mode !== 'matches' ? (
            <>
              <div className="sm:col-span-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${mode} by keyword...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="Filter by city..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </>
          ) : (
            <div className="sm:col-span-12 flex items-center space-x-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-400 whitespace-nowrap">
                Match Against My Need:
              </label>
              <select
                value={selectedNeedId}
                onChange={(e) => setSelectedNeedId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                {myNeeds.map((n) => (
                  <option key={n.need_id} value={n.need_id}>
                    {n.title} (Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flex'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ─── Results Grid ────────────────────────────────────────────── */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-xs text-surface-500 font-medium">Querying marketplace...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3">
          <Compass className="w-12 h-12 text-surface-400 mx-auto" />
          <h3 className="font-bold text-base text-surface-900 dark:text-white">No listings found</h3>
          <p className="text-xs text-surface-500 max-w-sm mx-auto">
            Try adjusting your search terms, changing the category filter, or switching discovery modes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mode 1: Businesses */}
          {mode === 'businesses' && results.map((b) => (
            <div key={b.business_id} className="glass-card p-6 rounded-3xl space-y-4 hover:border-brand-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                    {b.name[0]}
                  </div>
                  {b.status === 'VERIFIED' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      VERIFIED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-1">{b.name}</h3>
                  <div className="flex items-center space-x-1 text-xs text-surface-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{[b.city, b.state].filter(Boolean).join(', ') || 'Global'}</span>
                  </div>
                </div>

                <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed">
                  {b.description || 'Verified enterprise member offering collaborative capabilities.'}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-200/60 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{b.category_name || 'Business'}</span>
                <Link
                  to={`/business/${b.business_id}`}
                  className="px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-xs font-semibold text-surface-800 dark:text-surface-200 flex items-center space-x-1"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {/* Mode 2: Services */}
          {mode === 'services' && results.map((s) => (
            <div key={s.service_id} className="glass-card p-6 rounded-3xl space-y-4 hover:border-brand-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                  {s.category_name || 'SERVICE'}
                </span>
                <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-2">{s.title}</h3>
                <div className="text-xs text-surface-500">
                  By <strong className="text-surface-700 dark:text-surface-300">{s.business_name}</strong> &bull; {s.city || 'Remote'}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-200/60 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {s.price_min != null || s.price_max != null
                    ? `$${s.price_min || 0} - $${s.price_max || 'N/A'}`
                    : 'Flexible Pricing'}
                </span>
                <Link
                  to={`/business/${s.business_id}`}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm"
                >
                  Connect
                </Link>
              </div>
            </div>
          ))}

          {/* Mode 3: Needs */}
          {mode === 'needs' && results.map((n) => (
            <div key={n.need_id} className="glass-card p-6 rounded-3xl space-y-4 hover:border-violet-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                  {n.category_name || 'COMMERCIAL NEED'}
                </span>
                <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-2">{n.title}</h3>
                <div className="text-xs text-surface-500">
                  From <strong className="text-surface-700 dark:text-surface-300">{n.business_name}</strong> &bull; {n.city || 'Remote'}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-200/60 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  Budget: ${n.budget_min || 0} - ${n.budget_max || 'Open'}
                </span>
                <Link
                  to={`/business/${n.business_id}`}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm"
                >
                  Offer Solution
                </Link>
              </div>
            </div>
          ))}

          {/* Mode 4: Rule Matches */}
          {mode === 'matches' && results.map((m, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl space-y-4 border-brand-500/30 hover:border-brand-500 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">
                    Supplier Capability
                  </span>
                  <MatchScoreBadge score={m.score} explanation={m.explanation} />
                </div>

                <h3 className="font-bold text-base text-surface-900 dark:text-white">{m.service_title}</h3>
                <div className="text-xs text-surface-500">
                  Supplier: <strong className="text-surface-700 dark:text-surface-300">{m.supplier_name}</strong>
                </div>

                <div className="text-xs text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-900/60 p-2.5 rounded-xl">
                  Price: ${m.price_min || 0} - ${m.price_max || 'N/A'} &bull; City: {m.city || 'N/A'}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-200/60 dark:border-surface-800 flex items-center justify-between">
                <Link
                  to={`/business/${m.supplier_business_id}`}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Supplier Profile
                </Link>
                <Link
                  to={`/collaborations?partner=${m.supplier_business_id}&service=${m.service_id}&need=${selectedNeedId}`}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20"
                >
                  Start Collaboration
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
