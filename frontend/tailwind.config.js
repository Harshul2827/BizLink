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
        brand: {
          50: '#eef6fc',
          100: '#d7ebf9',
          200: '#b5daf4',
          300: '#81c2ee',
          400: '#46a4e4',
          500: '#1b8ad6',
          600: '#0a66c2', // Professional Blue
          700: '#0055a5',
          800: '#004182', // Dark Blue
          900: '#002d5b',
          950: '#001c3b'
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Growth Teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        surface: {
          bg: '#f3f6f8',
          card: '#ffffff',
          border: '#d9e2ec',
          borderSubtle: '#e9eff5',
          textPrimary: '#1d2226',
          textSecondary: '#5e6c76'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'enterprise': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'enterprise-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'enterprise-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
