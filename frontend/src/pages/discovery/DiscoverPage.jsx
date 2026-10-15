import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
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
  MapPin,
  Tag,
  ShieldCheck,
  Filter,
  DollarSign,
  ArrowRight,
  SlidersHorizontal,
  X,
  Loader2
} from 'lucide-react';

// ─── Memoized Card Components (Zero unnecessary re-renders) ─────────────────

const BusinessCard = memo(function BusinessCard({ b }) {
  return (
    <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF] flex items-center justify-center font-bold text-sm shrink-0">
              {b.name ? b.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-white truncate" title={b.name}>
                {b.name}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{[b.city, b.state].filter(Boolean).join(', ') || 'Global'}</span>
              </div>
            </div>
          </div>

          {b.status === 'VERIFIED' && (
            <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] dark:bg-[#042F2E] dark:text-[#2DD4BF] font-semibold border border-[#CCFBF1] dark:border-[#115E59] shrink-0">
              <ShieldCheck className="w-3 h-3 text-[#14B8A6]" />
              <span>Verified</span>
            </span>
          )}
        </div>

        <p className="text-xs text-[#475569] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
          {b.description || 'Verified enterprise member offering commercial capabilities.'}
        </p>
      </div>

      <div className="pt-3 mt-4 border-t border-[#E2E8F0] dark:border-[#22314A] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] truncate pr-2">
          {b.category_name || 'Commercial'}
        </span>
        <Link
          to={`/business/${b.business_id}`}
          className="px-3 py-1.5 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#EFF6FF] dark:hover:bg-[#172554] text-xs font-semibold text-[#0F172A] dark:text-white flex items-center space-x-1 border border-[#E2E8F0] dark:border-[#334155] transition-colors shrink-0"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
});

const ServiceCard = memo(function ServiceCard({ s }) {
  return (
    <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
      <div className="space-y-2.5">
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[#1E40AF]">
          {s.category_name || 'SERVICE'}
        </span>
        <h3 className="font-bold text-sm text-[#0F172A] dark:text-white line-clamp-2">{s.title}</h3>
        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Provider: <strong className="text-[#0F172A] dark:text-white font-medium">{s.business_name}</strong> &bull; {s.city || 'Remote'}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-[#E2E8F0] dark:border-[#22314A] flex items-center justify-between">
        <span className="text-xs font-bold text-[#0F172A] dark:text-white">
          {s.price_min != null || s.price_max != null
            ? `$${s.price_min || 0} - $${s.price_max || 'Custom'}`
            : 'Custom Pricing'}
        </span>
        <Link
          to={`/business/${s.business_id}`}
          className="px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle transition-colors"
        >
          Connect
        </Link>
      </div>
    </div>
  );
});

const NeedCard = memo(function NeedCard({ n }) {
  return (
    <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle hover:border-[#14B8A6]/40 transition-colors flex flex-col justify-between">
      <div className="space-y-2.5">
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F0FDFA] text-[#0F766E] dark:bg-[#042F2E] dark:text-[#2DD4BF] border border-[#CCFBF1] dark:border-[#115E59]">
          {n.category_name || 'REQUIREMENT'}
        </span>
        <h3 className="font-bold text-sm text-[#0F172A] dark:text-white line-clamp-2">{n.title}</h3>
        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Client: <strong className="text-[#0F172A] dark:text-white font-medium">{n.business_name}</strong> &bull; {n.city || 'Remote'}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-[#E2E8F0] dark:border-[#22314A] flex items-center justify-between">
        <span className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF]">
          Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flexible'}
        </span>
        <Link
          to={`/business/${n.business_id}`}
          className="px-3 py-1.5 rounded-md bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold shadow-subtle transition-colors"
        >
          Offer Solution
        </Link>
      </div>
    </div>
  );
});

const MatchCard = memo(function MatchCard({ m, selectedNeedId }) {
  return (
    <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
            Supplier Capability
          </span>
          <MatchScoreBadge score={m.score} explanation={m.explanation} />
        </div>

        <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">{m.service_title}</h3>
        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Supplier: <strong className="text-[#0F172A] dark:text-white font-medium">{m.supplier_name}</strong>
        </div>

        <div className="text-xs text-[#475569] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B]/70 p-2.5 rounded-md border border-[#E2E8F0] dark:border-[#22314A]">
          Pricing: ${m.price_min || 0} - ${m.price_max || 'Custom'} &bull; Location: {m.city || 'Remote'}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-[#E2E8F0] dark:border-[#22314A] flex items-center justify-between">
        <Link
          to={`/business/${m.supplier_business_id}`}
          className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
        >
          Supplier Profile
        </Link>
        <Link
          to={`/collaborations?partner=${m.supplier_business_id}&service=${m.service_id}&need=${selectedNeedId}`}
          className="px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle transition-colors"
        >
          Initiate Engagement
        </Link>
      </div>
    </div>
  );
});

// ─── Skeleton Cards (No layout shift) ────────────────────────────────────────

function DirectorySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-5 rounded-lg shadow-subtle space-y-4 animate-pulse"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#E2E8F0] dark:bg-[#1E293B]" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-3/4" />
              <div className="h-3 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-full" />
            <div className="h-3 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-5/6" />
          </div>
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#22314A] flex justify-between items-center">
            <div className="h-4 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-20" />
            <div className="h-7 bg-[#E2E8F0] dark:bg-[#1E293B] rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Discover Page ─────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { activeBusiness } = useAuth();

  const [mode, setMode] = useState('businesses'); // 'businesses' | 'services' | 'needs' | 'matches'
  
  // Instant input state for typing responsiveness
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [cityInput, setCityInput] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const [results, setResults] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [myNeeds, setMyNeeds] = useState([]);
  const [selectedNeedId, setSelectedNeedId] = useState('');

  const abortControllerRef = useRef(null);

  // Debounce query (280ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 280);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Debounce city (280ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCity(cityInput.trim());
    }, 280);
    return () => clearTimeout(handler);
  }, [cityInput]);

  // Load categories once on mount
  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        if (mounted) setCategories(res.data || []);
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    }
    loadCategories();
    return () => { mounted = false; };
  }, []);

  // Load user's business needs for Match explorer
  useEffect(() => {
    let mounted = true;
    async function loadMyNeeds() {
      if (activeBusiness?.business_id) {
        try {
          const res = await api.get(`/businesses/${activeBusiness.business_id}/needs`);
          const list = res.data || [];
          if (mounted) {
            setMyNeeds(list);
            if (list.length > 0 && !selectedNeedId) {
              setSelectedNeedId(String(list[0].need_id));
            }
          }
        } catch (e) {
          console.warn('Error loading my needs:', e);
        }
      }
    }
    loadMyNeeds();
    return () => { mounted = false; };
  }, [activeBusiness, selectedNeedId]);

  // Fetch results cleanly with AbortController and no layout flickering
  const fetchResults = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setIsSearching(true);
      const trimmedQuery = debouncedQuery.trim();
      const trimmedCity = debouncedCity.trim();

      const params = {};
      if (trimmedQuery) {
        params.search = trimmedQuery;
      }
      if (selectedCategory) {
        params.categoryId = Number(selectedCategory);
      }
      if (trimmedCity) {
        params.city = trimmedCity;
      }
      params.limit = 50;

      let endpoint = '/discover/businesses';
      if (mode === 'services') endpoint = '/discover/services';
      if (mode === 'needs') endpoint = '/discover/needs';
      if (mode === 'matches') {
        if (!selectedNeedId) {
          setResults([]);
          setIsSearching(false);
          setInitialLoading(false);
          return;
        }
        endpoint = `/discover/matches/needs/${selectedNeedId}`;
      }

      const res = await api.get(endpoint, {
        params,
        signal: abortController.signal
      });

      setResults(res.data || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return; // Stale request cancelled cleanly
      }
      console.warn('Search error:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
      setInitialLoading(false);
    }
  }, [mode, debouncedQuery, selectedCategory, debouncedCity, selectedNeedId]);

  // Trigger search whenever debounced filters change
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Mode change handler: resets query without freezing
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setDebouncedQuery('');
  }, []);

  const clearCity = useCallback(() => {
    setCityInput('');
    setDebouncedCity('');
  }, []);

  return (
    <div className="space-y-6 w-full py-2">
      {/* ─── Page Header & Mode Selector ─────────────────────────────── */}
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 sm:p-7 rounded-lg shadow-subtle space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold border border-[#DBEAFE] dark:border-[#1E40AF]">
              <Compass className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Commercial Directory</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Discover Partners, Services & Needs
            </h1>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
            {[
              { id: 'businesses', label: 'Companies', icon: Building2 },
              { id: 'services', label: 'Services', icon: Briefcase },
              { id: 'needs', label: 'Open Needs', icon: Target },
              ...(activeBusiness ? [{ id: 'matches', label: 'Compatibility Matches', icon: SlidersHorizontal }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleModeChange(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#131C2E] text-[#2563EB] dark:text-[#3B82F6] shadow-subtle border border-[#E2E8F0] dark:border-[#334155] font-bold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white font-medium'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Search & Filters Bar (Zero typing lag) ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {mode !== 'matches' ? (
            <>
              {/* Search Keyword */}
              <div className="sm:col-span-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setDebouncedQuery(searchInput.trim());
                  }}
                  placeholder={`Search ${mode} by keyword...`}
                  className="w-full pl-10 pr-9 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="sm:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="sm:col-span-3 relative">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setDebouncedCity(cityInput.trim());
                  }}
                  placeholder="Filter by city..."
                  className="w-full pl-3 pr-8 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
                {cityInput && (
                  <button
                    onClick={clearCity}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="sm:col-span-12 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8] whitespace-nowrap">
                Match Against Active Requirement:
              </label>
              <select
                value={selectedNeedId}
                onChange={(e) => setSelectedNeedId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors cursor-pointer"
              >
                {myNeeds.map((n) => (
                  <option key={n.need_id} value={n.need_id}>
                    {n.title} (Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flexible'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Subtle Live Filtering Indicator */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-1">
          <div className="flex items-center space-x-2">
            <span>Showing verified commercial directory records</span>
            {isSearching && (
              <span className="inline-flex items-center space-x-1 text-[#2563EB] dark:text-[#60A5FA] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Updating results...</span>
              </span>
            )}
          </div>
          <span>{results.length} records available</span>
        </div>
      </div>

      {/* ─── Results Grid ────────────────────────────────────────────── */}
      {initialLoading ? (
        <DirectorySkeleton />
      ) : results.length === 0 ? (
        <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-12 rounded-lg shadow-subtle text-center space-y-3">
          <Compass className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white">No directory records found</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
            Try adjusting your search terms, selecting a different category, or switching view tabs.
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-150 ${isSearching ? 'opacity-70' : 'opacity-100'}`}>
          {/* Mode 1: Businesses */}
          {mode === 'businesses' &&
            results.map((b) => <BusinessCard key={b.business_id} b={b} />)}

          {/* Mode 2: Services */}
          {mode === 'services' &&
            results.map((s) => <ServiceCard key={s.service_id} s={s} />)}

          {/* Mode 3: Needs */}
          {mode === 'needs' &&
            results.map((n) => <NeedCard key={n.need_id} n={n} />)}

          {/* Mode 4: Compatibility Matches */}
          {mode === 'matches' &&
            results.map((m, idx) => (
              <MatchCard
                key={`${m.service_id || idx}-${m.supplier_business_id || idx}`}
                m={m}
                selectedNeedId={selectedNeedId}
              />
            ))}
        </div>
      )}
    </div>
  );
}
