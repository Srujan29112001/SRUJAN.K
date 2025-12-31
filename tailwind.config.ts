import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D64A3',
          light: '#8B7EC8',
          dark: '#4F4880',
          glow: 'rgba(109, 100, 163, 0.4)',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        success: '#10B981',
        error: '#EF4444',
        bg: {
          base: '#030712',
          elevated: '#0A0A12',
          surface: '#12121A',
          hover: '#1A1A24',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#64748B',
          accent: '#6D64A3',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'monospace'],
      },
      fontSize: {
        hero: 'clamp(4rem, 3rem + 8vw, 12rem)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6D64A3 0%, #8B7EC8 50%, #06B6D4 100%)',
        'gradient-hero': 'radial-gradient(ellipse at center, rgba(109, 100, 163, 0.15) 0%, transparent 70%)',
        'gradient-section': 'linear-gradient(180deg, #030712 0%, #0A0A12 100%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(109, 100, 163, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
