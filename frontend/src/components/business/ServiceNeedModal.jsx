import React, { useState, useEffect } from 'react';
import api from '../../api/client';
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
        setMinVal(initialData.price_min != null ? initialData.price_min : '');
        setMaxVal(initialData.price_max != null ? initialData.price_max : '');
      } else {
        setMinVal(initialData.budget_min != null ? initialData.budget_min : '');
        setMaxVal(initialData.budget_max != null ? initialData.budget_max : '');
        setDeadline(initialData.deadline ? initialData.deadline.slice(0, 10) : '');
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

    try {
      setSubmitting(true);
      const endpoint = isService
        ? `/businesses/${businessId}/services${isEditing ? `/${initialData.service_id}` : ''}`
        : `/businesses/${businessId}/needs${isEditing ? `/${initialData.need_id}` : ''}`;

      const payload = isService ? {
        title: title.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        price_min: minVal ? Number(minVal) : null,
        price_max: maxVal ? Number(maxVal) : null
      } : {
        title: title.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        budget_min: minVal ? Number(minVal) : null,
        budget_max: maxVal ? Number(maxVal) : null,
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
      setError(err.message || 'Operation failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border border-surface-200 dark:border-surface-700">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl text-white ${isService ? 'bg-brand-600' : 'bg-violet-600'}`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">
              {isEditing ? `Edit ${isService ? 'Service' : 'Commercial Need'}` : `Add New ${isService ? 'Service Offer' : 'Commercial Need'}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
              Title / Description *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isService ? 'e.g. Cloud Security Architecture & Audit' : 'e.g. ISO 27001 Compliance Lead Auditor Needed'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <option value="">Select category (optional)</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                {isService ? 'Price Min ($)' : 'Budget Min ($)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                {isService ? 'Price Max ($)' : 'Budget Max ($)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={maxVal}
                onChange={(e) => setMaxVal(e.target.value)}
                placeholder="5000.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          {!isService && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 dark:text-surface-300 mb-1">
                Target Deadline
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-lg transition-all ${
                isService ? 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/25' : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/25'
              } disabled:opacity-60 cursor-pointer`}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
