import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

export default function MatchScoreBadge({ score, explanation = null }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.round((score || 0) * 100);

  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let barColor = 'bg-slate-500';

  if (percentage >= 80) {
    colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    barColor = 'bg-emerald-500';
  } else if (percentage >= 50) {
    colorClasses = 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 dark:border-brand-800/60';
    barColor = 'bg-brand-500';
  } else if (percentage > 0) {
    colorClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-help ${colorClasses}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{percentage}% Match</span>
        {explanation && <Info className="w-3 h-3 opacity-60 ml-0.5" />}
      </div>

      {showTooltip && explanation && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl glass-card shadow-2xl z-50 text-xs space-y-2 border border-surface-200 dark:border-surface-700 animate-fadeIn">
          <div className="font-bold text-surface-900 dark:text-white flex items-center justify-between">
            <span>Match Breakdown</span>
            <span>{percentage}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
          </div>

          <div className="space-y-1 text-[11px] text-surface-600 dark:text-surface-300 pt-1">
            {explanation.category_match != null && (
              <div className="flex justify-between">
                <span>Category Alignment:</span>
                <span className="font-semibold">{explanation.category_match ? '100%' : '0%'}</span>
              </div>
            )}
            {explanation.budget_overlap_score != null && (
              <div className="flex justify-between">
                <span>Budget Overlap:</span>
                <span className="font-semibold">{Math.round(explanation.budget_overlap_score * 100)}%</span>
              </div>
            )}
            {explanation.city_proximity_match != null && (
              <div className="flex justify-between">
                <span>Location Proximity:</span>
                <span className="font-semibold">{explanation.city_proximity_match ? '100%' : '0%'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
