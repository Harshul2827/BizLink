import React, { useState } from 'react';
import api from '../../api/client';
import { X, Star, AlertCircle, Award } from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  collaboration,
  reviewerBusinessId,
  onSuccess
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !collaboration) return null;

  // Identify partner business
  const partner = collaboration.participants?.find(
    (p) => Number(p.business_id) !== Number(reviewerBusinessId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/reviews', {
        reviewer_business_id: Number(reviewerBusinessId),
        reviewed_business_id: Number(partner?.business_id),
        collaboration_id: collaboration.collaboration_id,
        rating: Number(rating),
        title: title.trim() || null
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0B1220] w-full max-w-md rounded-xl p-6 sm:p-7 space-y-5 shadow-2xl relative border border-surface-200 dark:border-surface-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-surface-900 dark:text-white">
                Submit Verified Review
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Institutional counterparty evaluation
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

        <div className="p-3 rounded-md bg-surface-50 dark:bg-[#070D18] border border-surface-200 dark:border-surface-800 space-y-0.5">
          <p className="text-[11px] uppercase tracking-wider font-bold text-surface-500 dark:text-surface-400">
            Counterparty Under Review
          </p>
          <p className="text-xs font-bold text-surface-900 dark:text-white">
            {partner?.business_name || 'Counterparty Business'}
          </p>
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
              Performance Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-surface-300 dark:text-surface-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300 ml-2">
                {hoverRating || rating} / 5.0
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Executive Evaluation & Delivery Feedback
            </label>
            <textarea
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="State key observations regarding deliverables, SLA adherence, communication efficiency, and technical rigor..."
              className="w-full p-3 rounded-md bg-white dark:bg-[#070D18] border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600 transition-colors resize-none placeholder:text-surface-400"
            />
          </div>

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
              className="px-4 py-2 rounded-md bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold shadow-subtle disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
