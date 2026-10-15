import React from 'react';

/**
 * BizLink Unified Brand Identity Component
 * Single source of truth for the BizLink geometric monogram and wordmark.
 *
 * @param {'full'|'mark'} variant - 'full' shows mark + wordmark, 'mark' shows monogram only
 * @param {'default'|'blue'|'white'|'dark'} color - Color theme mode
 * @param {number|'sm'|'md'|'lg'} size - Mark size (px)
 * @param {string} className - Additional CSS classes
 */
export default function Logo({
  variant = 'full',
  color = 'default',
  size = 'md',
  className = ''
}) {
  // Dimension mapping for the mark
  const sizeMap = {
    xs: 16,
    sm: 24,
    md: 30,
    lg: 38
  };
  const markSize = typeof size === 'number' ? size : sizeMap[size] || 30;

  // Resolve color variables based on color mode
  let markColor = '#2563EB'; // Brand Blue
  let bizTextColor = 'text-[#0F172A] dark:text-[#E5E7EB]';
  let linkTextColor = 'text-[#2563EB] dark:text-[#3B82F6]';

  if (color === 'blue') {
    markColor = '#2563EB';
    bizTextColor = 'text-[#2563EB]';
    linkTextColor = 'text-[#2563EB]';
  } else if (color === 'white') {
    markColor = '#FFFFFF';
    bizTextColor = 'text-white';
    linkTextColor = 'text-white';
  } else if (color === 'dark') {
    markColor = '#0F172A';
    bizTextColor = 'text-[#0F172A]';
    linkTextColor = 'text-[#0F172A]';
  }

  // Pure geometric SVG monogram "B" representing two connected enterprise links
  const MarkSVG = (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      {/* Interconnected geometric monogram 'B' */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 5C6 3.89543 6.89543 3 8 3H17.5C21.6421 3 25 6.35786 25 10.5C25 12.8711 23.9001 14.9856 22.1818 16.3636C24.5126 17.6534 26 20.1504 26 23C26 27.4183 22.4183 31 18 31H8C6.89543 31 6 30.1046 6 29V5ZM11.5 8V13.5H17.5C19.1569 13.5 20.5 12.1569 20.5 10.5C20.5 8.84315 19.1569 8 17.5 8H11.5ZM11.5 18.5V26H18C19.6569 26 21 24.6569 21 23C21 21.3431 19.6569 18.5 18 18.5H11.5Z"
        fill={markColor}
      />
      {/* Central linking node intersection */}
      <circle cx="11.5" cy="16" r="1.5" fill={color === 'white' ? '#2563EB' : '#FFFFFF'} />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} aria-label="BizLink">
        {MarkSVG}
      </div>
    );
  }

  // Font size calculation corresponding to mark size
  const textSizeClass =
    markSize <= 24 ? 'text-base' : markSize <= 32 ? 'text-lg' : 'text-xl';

  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`} aria-label="BizLink">
      {MarkSVG}
      <span className={`font-semibold tracking-tight ${textSizeClass} leading-none font-sans select-none`}>
        <span className={bizTextColor}>Biz</span>
        <span className={linkTextColor}>Link</span>
      </span>
    </div>
  );
}
