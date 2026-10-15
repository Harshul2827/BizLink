import React, { useState } from 'react';
import { Target, Info } from 'lucide-react';

export default function MatchScoreBadge({ score, explanation = null }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.round((score || 0) * 100);

  let badgeClasses = 'bg-[#F1F5F9] text-[#475569] dark:bg-[#1E293B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155]';
  let barColor = 'bg-[#64748B]';

  if (percentage >= 80) {
    badgeClasses = 'bg-[#F0FDFA] text-[#0F766E] dark:bg-[#042F2E] dark:text-[#2DD4BF] border-[#CCFBF1] dark:border-[#115E59]';
    barColor = 'bg-[#14B8A6]';
  } else if (percentage >= 50) {
    badgeClasses = 'bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#60A5FA] border-[#DBEAFE] dark:border-[#1E40AF]';
    barColor = 'bg-[#2563EB]';
  } else if (percentage > 0) {
    badgeClasses = 'bg-[#FFFBEB] text-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D] border-[#FEF3C7] dark:border-[#78350F]';
    barColor = 'bg-[#F59E0B]';
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors cursor-help ${badgeClasses}`}
        title="Compatibility match score based on category, budget, and location"
      >
        <Target className="w-3.5 h-3.5 shrink-0" />
        <span>{percentage}% Match</span>
        {explanation && <Info className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />}
      </div>

      {showTooltip && explanation && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-3.5 rounded-lg bg-white dark:bg-[#131C2E] shadow-lg z-50 text-xs space-y-2 border border-[#E2E8F0] dark:border-[#22314A]">
          <div className="font-semibold text-[#0F172A] dark:text-white flex items-center justify-between">
            <span>Compatibility Breakdown</span>
            <span className="font-mono font-bold">{percentage}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${percentage}%` }} />
          </div>

          <div className="space-y-1.5 text-[11px] text-[#475569] dark:text-[#94A3B8] pt-1">
            {explanation.category_match != null && (
              <div className="flex justify-between items-center">
                <span>Category Alignment</span>
                <span className="font-semibold text-[#0F172A] dark:text-white">{explanation.category_match ? '100%' : '0%'}</span>
              </div>
            )}
            {explanation.budget_overlap_score != null && (
              <div className="flex justify-between items-center">
                <span>Budget Overlap</span>
                <span className="font-semibold text-[#0F172A] dark:text-white">{Math.round(explanation.budget_overlap_score * 100)}%</span>
              </div>
            )}
            {explanation.city_proximity_match != null && (
              <div className="flex justify-between items-center">
                <span>Location Proximity</span>
                <span className="font-semibold text-[#0F172A] dark:text-white">{explanation.city_proximity_match ? '100%' : '0%'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

