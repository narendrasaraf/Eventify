/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium brand
        brand: '#6366f1',
        'brand-dark': '#4f46e5',
        // Obsidian Canvas & Surfaces
        canvas: '#030307',
        surface: '#0a0a0f',
        'surface-2': '#12121c',
        'surface-3': '#1b1b2a',
        border: 'rgba(255, 255, 255, 0.06)',
        'border-strong': 'rgba(255, 255, 255, 0.12)',
        // Slate Text
        'text-1': '#f8fafc',
        'text-2': '#94a3b8',
        'text-3': '#475569',
        // Semantic
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#f43f5e',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        pulse2: 'pulse2 2s ease-in-out infinite',
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
