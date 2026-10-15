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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0B1220] w-full max-w-lg rounded-xl p-6 sm:p-7 space-y-5 shadow-2xl relative border border-surface-200 dark:border-surface-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center text-white ${isService ? 'bg-brand-600' : 'bg-teal-700'}`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-surface-900 dark:text-white">
                {isEditing ? `Edit ${isService ? 'Commercial Service' : 'Procurement Need'}` : `List ${isService ? 'Commercial Service' : 'Procurement Need'}`}
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {isService ? 'Publish commercial capabilities to prospective clients' : 'Broadcast an active requirement across the network'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#334155] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
              placeholder={isService ? 'e.g. SOC 2 Compliance Audit & Architecture' : 'e.g. Enterprise Cloud Security Lead Auditor'}
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
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Target Fulfillment Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-colors cursor-pointer"
              />
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
