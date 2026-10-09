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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-surface-900 w-full max-w-md rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl relative border border-surface-200 dark:border-surface-700">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-white">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-surface-900 dark:text-white">
              Verified Partner Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Reviewing partner on completed engagement:
          </p>
          <p className="text-xs font-bold text-surface-900 dark:text-white">
            {partner?.business_name || 'Partner Business'}
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-surface-300 dark:text-surface-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-surface-700 dark:text-surface-300 ml-2">
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Review & Feedback Summary
            </label>
            <textarea
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Share details about performance, reliability, communication, and deliverable quality..."
              className="w-full p-3 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
