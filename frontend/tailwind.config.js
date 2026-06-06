/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        },
        dark: {
          bg: '#0f1117',
          card: '#1a1d2e',
          border: '#2a2d3e',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
        status: {
          pending: '#f59e0b',
          approved: '#10b981',
          rejected: '#ef4444',
          draft: '#6b7280',
          sent: '#3b82f6',
          paid: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
