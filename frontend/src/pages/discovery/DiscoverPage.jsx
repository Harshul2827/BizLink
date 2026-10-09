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
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* ─── Page Header & Mode Selector ─────────────────────────────── */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-2xl shadow-enterprise space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-200 dark:border-brand-800">
              <Compass className="w-3.5 h-3.5" />
              <span>Commercial Marketplace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-surface-900 dark:text-white">
              Discover Partners, Services & Needs
            </h1>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            {[
              { id: 'businesses', label: 'Companies', icon: Building2 },
              { id: 'services', label: 'Services', icon: Briefcase },
              { id: 'needs', label: 'Open Needs', icon: Target },
              ...(activeBusiness ? [{ id: 'matches', label: 'AI Matches', icon: Sparkles }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-sm border border-surface-200 dark:border-surface-700 font-bold'
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
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
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
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors cursor-pointer"
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
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors"
                />
              </div>
            </>
          ) : (
            <div className="sm:col-span-12 flex items-center space-x-3">
              <label className="text-xs font-semibold text-surface-600 dark:text-surface-400 whitespace-nowrap">
                Match Against My Need:
              </label>
              <select
                value={selectedNeedId}
                onChange={(e) => setSelectedNeedId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-colors cursor-pointer"
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
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-xs text-surface-500 font-medium">Querying marketplace...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-12 rounded-2xl shadow-enterprise text-center space-y-3">
          <Compass className="w-10 h-10 text-surface-400 mx-auto" />
          <h3 className="font-bold text-sm text-surface-900 dark:text-white">No listings found</h3>
          <p className="text-xs text-surface-500 max-w-sm mx-auto">
            Try adjusting your search terms, changing the category filter, or switching discovery modes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mode 1: Businesses */}
          {mode === 'businesses' && results.map((b) => (
            <div key={b.business_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-5 rounded-xl shadow-enterprise space-y-3 hover:border-brand-600/40 transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-bold text-sm">
                    {b.name[0]}
                  </div>
                  {b.status === 'VERIFIED' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-accent-600 dark:bg-teal-950 dark:text-accent-400 font-bold border border-teal-200 dark:border-teal-800">
                      VERIFIED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-surface-900 dark:text-white line-clamp-1">{b.name}</h3>
                  <div className="flex items-center space-x-1 text-xs text-surface-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{[b.city, b.state].filter(Boolean).join(', ') || 'Global'}</span>
                  </div>
                </div>

                <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed">
                  {b.description || 'Verified enterprise member offering collaborative capabilities.'}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">{b.category_name || 'Business'}</span>
                <Link
                  to={`/business/${b.business_id}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-50 dark:bg-surface-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-xs font-semibold text-surface-700 dark:text-surface-200 flex items-center space-x-1 border border-surface-200 dark:border-surface-700 transition-colors"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {/* Mode 2: Services */}
          {mode === 'services' && results.map((s) => (
            <div key={s.service_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-5 rounded-xl shadow-enterprise space-y-3 hover:border-brand-600/40 transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {s.category_name || 'SERVICE'}
                </span>
                <h3 className="font-bold text-sm text-surface-900 dark:text-white line-clamp-2">{s.title}</h3>
                <div className="text-xs text-surface-500">
                  By <strong className="text-surface-700 dark:text-surface-300">{s.business_name}</strong> &bull; {s.city || 'Remote'}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {s.price_min != null || s.price_max != null
                    ? `$${s.price_min || 0} - $${s.price_max || 'N/A'}`
                    : 'Flexible Pricing'}
                </span>
                <Link
                  to={`/business/${s.business_id}`}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Connect
                </Link>
              </div>
            </div>
          ))}

          {/* Mode 3: Needs */}
          {mode === 'needs' && results.map((n) => (
            <div key={n.need_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-5 rounded-xl shadow-enterprise space-y-3 hover:border-accent-500/40 transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-accent-700 dark:bg-teal-950 dark:text-accent-300 border border-teal-200 dark:border-teal-800">
                  {n.category_name || 'COMMERCIAL NEED'}
                </span>
                <h3 className="font-bold text-sm text-surface-900 dark:text-white line-clamp-2">{n.title}</h3>
                <div className="text-xs text-surface-500">
                  From <strong className="text-surface-700 dark:text-surface-300">{n.business_name}</strong> &bull; {n.city || 'Remote'}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs font-bold text-accent-600 dark:text-accent-400">
                  Budget: ${n.budget_min || 0} - ${n.budget_max || 'Open'}
                </span>
                <Link
                  to={`/business/${n.business_id}`}
                  className="px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Offer Solution
                </Link>
              </div>
            </div>
          ))}

          {/* Mode 4: Rule Matches */}
          {mode === 'matches' && results.map((m, idx) => (
            <div key={idx} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-5 rounded-xl shadow-enterprise space-y-3 hover:border-brand-600/40 transition-colors flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">
                    Supplier Capability
                  </span>
                  <MatchScoreBadge score={m.score} explanation={m.explanation} />
                </div>

                <h3 className="font-bold text-sm text-surface-900 dark:text-white">{m.service_title}</h3>
                <div className="text-xs text-surface-500">
                  Supplier: <strong className="text-surface-700 dark:text-surface-300">{m.supplier_name}</strong>
                </div>

                <div className="text-xs text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/60 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700">
                  Price: ${m.price_min || 0} - ${m.price_max || 'N/A'} &bull; City: {m.city || 'N/A'}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <Link
                  to={`/business/${m.supplier_business_id}`}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Supplier Profile
                </Link>
                <Link
                  to={`/collaborations?partner=${m.supplier_business_id}&service=${m.service_id}&need=${selectedNeedId}`}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
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
