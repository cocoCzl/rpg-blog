/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FFB7C5',
          secondary: '#E0F7FA',
          accent: '#C3B1E1',
          darkGlass: 'rgba(24, 24, 27, 0.6)',
          lightGlass: 'rgba(255, 255, 255, 0.45)',
          deepGlass: 'rgba(15, 15, 20, 0.75)',
          crystalGlass: 'rgba(255, 255, 255, 0.08)',
          crystalBorder: 'rgba(255, 255, 255, 0.1)',
        },
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        xl: '24px',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif CN"', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'float-in': 'floatIn 0.6s ease-out',
        'float-bob': 'floatBob 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.12)',
        'glass-hover': 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.18)',
        'glow-pink': '0 0 20px rgba(255,183,197,0.15), 0 0 60px rgba(255,183,197,0.05)',
        'glow-cyan': '0 0 20px rgba(0,245,255,0.15), 0 0 60px rgba(0,245,255,0.05)',
        'inset-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
