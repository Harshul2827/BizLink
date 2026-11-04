import React, { useRef, useEffect } from 'react';

/**
 * Reusable 6-digit OTP input with auto-advance, backspace auto-reverse,
 * paste support, keyboard navigation, and dark mode styling.
 */
export default function OtpInput({
  value = '',
  onChange,
  disabled = false,
  autoFocus = true,
  hasError = false
}) {
  const inputRefs = useRef([]);

  // Ensure digits array always has 6 items
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !value) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, value]);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanDigits = rawVal.replace(/\D/g, '');

    if (!cleanDigits) {
      // Empty / cleared
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (cleanDigits.length > 1) {
      // User pasted or typed multiple digits
      handlePasteDigits(index, cleanDigits);
      return;
    }

    // Single digit entry
    const newDigits = [...digits];
    newDigits[index] = cleanDigits.slice(-1);
    const updatedValue = newDigits.join('');
    onChange(updatedValue);

    // Auto-advance to next input if not at the last box
    if (index < 5 && cleanDigits) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteDigits = (startIndex, pastedDigits) => {
    const newDigits = [...digits];
    let nextFocusIndex = startIndex;

    for (let i = 0; i < pastedDigits.length && startIndex + i < 6; i++) {
      newDigits[startIndex + i] = pastedDigits[i];
      nextFocusIndex = startIndex + i;
    }

    onChange(newDigits.join(''));
    const focusTarget = Math.min(5, nextFocusIndex + 1);
    inputRefs.current[focusTarget]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, jump back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
        e.preventDefault();
      } else if (digits[index]) {
        // Clear current box
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = Array.from({ length: 6 }, (_, i) => pastedData[i] || '');
    onChange(newDigits.join(''));

    const lastFilledIndex = Math.min(5, pastedData.length);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1} of verification code`}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-lg border transition-all focus:outline-none ${
            hasError
              ? 'border-red-400 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 focus:border-red-600 focus:ring-2 focus:ring-red-200'
              : digits[i]
              ? 'border-[#2563EB] bg-[#EFF6FF]/60 dark:bg-[#172554]/40 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB]/30'
              : 'border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#070D18] text-[#0F172A] dark:text-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
}

