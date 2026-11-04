import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { toDateInputValue } from '../../utils/formatters';
import { X, AlertCircle, DollarSign, Calendar, Tag, Briefcase } from 'lucide-react';

export default function ServiceNeedModal({
  isOpen,
  onClose,
  type = 'SERVICE', // 'SERVICE' or 'NEED'
  businessId,
  initialData = null,
  onSuccess
}) {
  const isService = type === 'SERVICE';
  const isEditing = !!initialData;

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const dateInputRef = useRef(null);

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const setRelativeDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDeadline(`${year}-${month}-${day}`);
  };

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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategoryId(initialData.category_id || '');
      if (isService) {
        setMinVal(initialData.price_min != null ? String(initialData.price_min) : '');
        setMaxVal(initialData.price_max != null ? String(initialData.price_max) : '');
      } else {
        setMinVal(initialData.budget_min != null ? String(initialData.budget_min) : '');
        setMaxVal(initialData.budget_max != null ? String(initialData.budget_max) : '');
        setDeadline(toDateInputValue(initialData.deadline));
      }
    } else {
      setTitle('');
      setCategoryId('');
      setMinVal('');
      setMaxVal('');
      setDeadline('');
    }
    setError(null);
  }, [initialData, isService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const numMin = minVal !== '' && minVal !== null ? Number(minVal) : null;
    const numMax = maxVal !== '' && maxVal !== null ? Number(maxVal) : null;

    if (numMin !== null && isNaN(numMin)) {
      setError(isService ? 'Base Rate must be a valid number.' : 'Budget Floor must be a valid number.');
      return;
    }
    if (numMax !== null && isNaN(numMax)) {
      setError(isService ? 'Max Scope Rate must be a valid number.' : 'Budget Ceiling must be a valid number.');
      return;
    }
    if (numMin !== null && numMin < 0) {
      setError(isService ? 'Base Rate cannot be negative.' : 'Budget Floor cannot be negative.');
      return;
    }
    if (numMax !== null && numMax < 0) {
      setError(isService ? 'Max Scope Rate cannot be negative.' : 'Budget Ceiling cannot be negative.');
      return;
    }
    if (numMin !== null && numMax !== null && numMin > numMax) {
      setError(isService ? 'Base Rate cannot exceed Max Scope Rate.' : 'Budget Floor cannot exceed Budget Ceiling.');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = isService
        ? `/businesses/${businessId}/services${isEditing ? `/${initialData.service_id}` : ''}`
        : `/businesses/${businessId}/needs${isEditing ? `/${initialData.need_id}` : ''}`;

      const payload = isService ? {
        title: title.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        price_min: numMin,
        price_max: numMax
      } : {
        title: title.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        budget_min: numMin,
        budget_max: numMax,
        deadline: deadline || null
      };

      if (isEditing) {
        await api.patch(endpoint, payload);
      } else {
        await api.post(endpoint, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#0B1220] w-full max-w-lg rounded-xl p-6 sm:p-7 space-y-5 shadow-2xl relative border border-surface-200 dark:border-surface-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-lg text-white shadow-subtle ${isService ? 'bg-brand-600' : 'bg-teal-700'}`}>
              {isService ? <Briefcase className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-surface-900 dark:text-white">
                {isEditing ? `Edit ${isService ? 'Service' : 'Need'}` : `List ${isService ? 'Commercial Service' : 'Procurement Need'}`}
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {isService
                  ? 'Advertise business capabilities to prospective clients'
                  : 'Broadcast an active requirement across the network'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#334155] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-md flex items-center space-x-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Service / Requirement Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isService ? 'e.g. Enterprise Cloud Security Audit' : 'e.g. Enterprise Cloud Security Lead Auditor'}
              className="w-full px-3.5 py-2 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 transition-colors placeholder:text-surface-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Industry Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 transition-colors cursor-pointer"
            >
              <option value="">Select industry classification (optional)</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                {isService ? 'Base Rate ($)' : 'Budget Floor ($)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minVal}
                onChange={(e) => setMinVal(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 transition-colors placeholder:text-surface-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                {isService ? 'Max Scope Rate ($)' : 'Budget Ceiling ($)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={maxVal}
                onChange={(e) => setMaxVal(e.target.value)}
                placeholder="5000.00"
                className="w-full px-3.5 py-2 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 transition-colors placeholder:text-surface-400"
              />
            </div>
          </div>

          {!isService && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                  Target Fulfillment Deadline
                </label>
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline('')}
                    className="text-[11px] text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer"
                  >
                    Clear date
                  </button>
                )}
              </div>

              <div
                onClick={handleOpenDatePicker}
                className="relative flex items-center w-full rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 focus-within:ring-1 focus-within:ring-teal-700 focus-within:border-teal-700 transition-colors cursor-pointer"
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  min={getTodayDateString()}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof e.currentTarget.showPicker === 'function') {
                      try { e.currentTarget.showPicker(); } catch {}
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-transparent text-surface-900 dark:text-surface-50 text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDatePicker();
                  }}
                  className="absolute right-2.5 p-1 rounded text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer"
                  title="Open calendar picker"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>

              {/* Quick shortcut chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-surface-500 dark:text-surface-400 font-medium mr-0.5">
                  Quick select:
                </span>
                <button
                  type="button"
                  onClick={() => setRelativeDays(7)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-100 dark:bg-[#1E293B] text-surface-700 dark:text-surface-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 border border-surface-200 dark:border-surface-700 transition-colors cursor-pointer"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDays(14)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-100 dark:bg-[#1E293B] text-surface-700 dark:text-surface-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 border border-surface-200 dark:border-surface-700 transition-colors cursor-pointer"
                >
                  +2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDays(30)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-100 dark:bg-[#1E293B] text-surface-700 dark:text-surface-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 border border-surface-200 dark:border-surface-700 transition-colors cursor-pointer"
                >
                  +1 Month
                </button>
              </div>

              {deadline && (
                <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium flex items-center pt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5" />
                  Target Date: {new Date(deadline + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E2E8F0] dark:border-[#22314A]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#CBD5E1] dark:border-[#334155] shadow-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-md text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer ${
                isService ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-[#0F766E] hover:bg-[#0D9488]'
              } disabled:opacity-60`}
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
