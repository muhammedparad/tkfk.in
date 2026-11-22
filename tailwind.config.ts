import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vaynex dark design system (replaces kairu light theme)
        vaynex: {
          bg: '#0a0a0f',          // Deep near-black obsidian background
          bgAlt: '#0f0f17',       // Secondary background
          card: '#13131f',        // Card surface
          surface: '#1a1a2e',     // Elevated surface
          border: 'rgba(255,255,255,0.08)',   // Default border
          borderHover: 'rgba(255,255,255,0.15)',
          borderAccent: 'rgba(139,92,246,0.3)',
          text: '#ffffff',        // Primary text
          muted: '#94a3b8',       // Secondary text
          faint: '#64748b',       // Muted text
          accent: '#7c3aed',      // Deep violet
          accentMid: '#8b5cf6',   // Medium violet/purple
          accentLight: '#a78bfa', // Light purple
          cyan: '#06b6d4',        // Cyan highlight
          green: '#10b981',       // Success
          amber: '#f59e0b',       // Warning/badge
        },
        // Keep kairu for any legacy references
        kairu: {
          bg: '#0a0a0f',
          text: '#ffffff',
          border: 'rgba(255,255,255,0.08)',
          borderHover: 'rgba(255,255,255,0.15)',
          accent: '#7c3aed',
          accentHover: '#8b5cf6',
          muted: '#94a3b8',
          card: '#13131f',
          cardAlt: '#0f0f17',
          tag: 'rgba(124,58,237,0.15)',
          dark: '#0a0a0f',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0764',
        },
        tkfk: {
          navy: '#0a0a0f',
          green: '#10b981',
          gold: '#7c3aed',
          sand: '#1a1a2e',
        },
        saffron: {
          50: '#f5f3ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'var(--font-display)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Cabinet Grotesk', 'var(--font-display)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        // Dark depth shadows
        'soft': '0 4px 20px -2px rgba(0,0,0,0.4), 0 2px 6px -1px rgba(0,0,0,0.3)',
        'card': '0 10px 30px -5px rgba(0,0,0,0.5)',
        'kairu': '0 12px 36px -4px rgba(0,0,0,0.5)',
        'kairu-hover': '0 20px 40px -8px rgba(0,0,0,0.6)',
        // Vaynex dark box shadows
        'dark-sm': '0 2px 8px rgba(0,0,0,0.5)',
        'dark-md': '0 8px 32px rgba(0,0,0,0.6)',
        'dark-lg': '0 20px 60px rgba(0,0,0,0.7)',
        'glow-purple': '0 0 40px rgba(124,58,237,0.4), 0 0 80px rgba(124,58,237,0.2)',
        'glow-purple-sm': '0 0 20px rgba(124,58,237,0.3)',
        'glow-cyan': '0 0 30px rgba(6,182,212,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glow': '0 0 40px rgba(124,58,237,0.4)',
      }
    },
  },
  plugins: [],
};
export default config;
