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
        kairu: {
          bg: '#f8f5f0',         // Kairu Warm Sand/Cream background
          text: '#141412',       // Kairu Deep Charcoal primary text
          border: '#f0ede8',     // Kairu Muted Cream border
          borderHover: '#e2ded8',
          accent: '#ff6b35',     // Kairu Burnt Orange CTA
          accentHover: '#e85926',
          muted: '#9c9a97',      // Kairu Warm Grey secondary text
          card: '#ffffff',       // Card background
          cardAlt: '#fafafb',    // Light card surface
          tag: '#f0ede8',        // Tag/pill background
          dark: '#141412',
        },
        brand: {
          50: '#fff5f0',
          100: '#ffe6dc',
          500: '#ff6b35',
          600: '#e85926',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        tkfk: {
          navy: '#141412',
          green: '#1e6f42',
          gold: '#ff6b35',
          sand: '#f8f5f0',
        },
        saffron: {
          50: '#fff7ed',
          500: '#ff6b35',
          600: '#ea580c',
          700: '#c2410c',
        }
      },
      fontFamily: {
        sans: ['Geist', 'var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Cabinet Grotesk', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 20, 18, 0.04), 0 2px 6px -1px rgba(20, 20, 18, 0.02)',
        'card': '0 10px 30px -5px rgba(20, 20, 18, 0.05)',
        'kairu': '0 12px 36px -4px rgba(20, 20, 18, 0.06)',
        'kairu-hover': '0 20px 40px -8px rgba(20, 20, 18, 0.09)',
        'glow': '0 0 25px rgba(255, 107, 53, 0.25)',
      }
    },
  },
  plugins: [],
};
export default config;
