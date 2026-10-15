/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: 'var(--color-bg-app)',
        card: 'var(--color-bg-card)',
        secondary: 'var(--color-bg-secondary)',
        elevated: 'var(--color-bg-elevated)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',

        'brand-blue': 'var(--color-brand-blue)',
        'brand-blue-hover': 'var(--color-brand-blue-hover)',
        'brand-blue-tint': 'var(--color-brand-blue-tint)',

        'teal-trust': 'var(--color-teal-trust)',
        'teal-trust-tint': 'var(--color-teal-trust-tint)',
        'green-success': 'var(--color-green-success)',
        'green-success-tint': 'var(--color-green-success-tint)',
        'amber-warning': 'var(--color-amber-warning)',
        'amber-warning-tint': 'var(--color-amber-warning-tint)',
        'red-error': 'var(--color-red-error)',
        'red-error-tint': 'var(--color-red-error-tint)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md: ['15px', { lineHeight: '22px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        input: 'var(--radius-input)',
        btn: 'var(--radius-btn)',
        badge: 'var(--radius-badge)',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        elevated: 'var(--shadow-elevated)',
      },
      maxWidth: {
        enterprise: '1200px',
      },
    },
  },
  plugins: [],
}
