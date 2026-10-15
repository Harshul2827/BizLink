import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Building2, MapPin, Tag, ArrowRight, AlertCircle } from 'lucide-react';

export default function CreateBusinessPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryCategoryId, setPrimaryCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('USA');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { setActiveBusiness, refreshUser } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Business name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/businesses', {
        name: name.trim(),
        description: description.trim() || null,
        primary_category_id: primaryCategoryId ? Number(primaryCategoryId) : null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || null
      });

      const newBiz = res.data;
      await refreshUser();
      if (newBiz) {
        setActiveBusiness(newBiz);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create business profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-8 sm:p-10 rounded-lg space-y-6 shadow-subtle">
        
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold mb-1 border border-[#DBEAFE] dark:border-[#1E40AF]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Registration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Register your business profile
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Publish your company on BizLink to publish commercial needs, offer enterprise services, and connect with verified partners.
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
              Business / Company Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Industrial Solutions"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
              Primary Industry Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={primaryCategoryId}
                onChange={(e) => setPrimaryCategoryId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors cursor-pointer"
              >
                <option value="">Select a category (optional)</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                City
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Austin"
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                className="w-full px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="USA"
                className="w-full px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] mb-1.5">
              Business Capabilities & Focus
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe commercial services, specialized capabilities, and partnership criteria..."
              className="w-full p-3 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-subtle flex items-center justify-center space-x-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Business Registration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

