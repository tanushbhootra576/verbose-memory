/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Brand
        primary:   { DEFAULT: '#3b82f6', dark: '#2563eb', light: '#93c5fd' },
        secondary: { DEFAULT: '#8b5cf6', dark: '#7c3aed', light: '#c4b5fd' },

        // Status
        normal:   { DEFAULT: '#10b981', dark: '#059669', light: '#6ee7b7', bg: '#d1fae5' },
        warning:  { DEFAULT: '#f59e0b', dark: '#d97706', light: '#fcd34d', bg: '#fef3c7' },
        critical: { DEFAULT: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#fee2e2' },

        // Dark mode surfaces
        dark: {
          bg:      '#0f172a',
          surface: '#1e293b',
          card:    '#263248',
          border:  '#334155',
          muted:   '#475569',
          text:    '#94a3b8',
        },
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':       'fadeIn 0.3s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'ping-slow':     'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:      { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideInRight: { '0%': { transform: 'translateX(20px)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
        glow:  '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [],
};
