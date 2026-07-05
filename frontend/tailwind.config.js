/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src_v2/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We are dark-mode first by default!
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        surface: 'var(--bg-surface)',
        card: 'var(--bg-card)',
        border: 'var(--border)',
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4338ca',
        },
        secondary: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
        accent: {
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
        },
        success: {
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        danger: {
          DEFAULT: '#f43f5e',
          dark: '#be123c',
        },
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'royal-glow': '0 0 30px rgba(99, 102, 241, 0.15), 0 0 10px rgba(59, 130, 246, 0.1)',
        'cyan-glow': '0 0 20px rgba(6, 182, 212, 0.25)',
        'neon-success': '0 0 15px rgba(16, 185, 129, 0.25)',
        'neon-danger': '0 0 15px rgba(244, 63, 94, 0.25)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
