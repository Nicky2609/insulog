/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette derived from the Insulog logo (navy to sky blue gradient wave),
        // deepened for contrast and given a real page-background tone instead
        // of a near-white wash.
        steel: {
          950: '#071B33',
          900: '#0A3D73',
          800: '#0E4C8C',
          700: '#15609F',
          600: '#1F76B0',
          500: '#3FA1C8',
        },
        concrete: {
          100: '#E9EEF2',
          200: '#D4DEE5',
          400: '#94A6B3',
          600: '#5C6F7D',
        },
        // Page background: a perceptible cool slate, not an almost-white wash.
        paper: '#E7EDF3',
        surface: '#FFFFFF',
        signal: {
          DEFAULT: '#E8590C',
          dark: '#C2470A',
          light: '#FBEAE0',
        },
        blueprint: {
          DEFAULT: '#0EA5C4',
          light: '#E3FBFF',
          bright: '#5DCBE8',
        },
        alert: '#F2B705',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        blueprint: "linear-gradient(rgba(14,165,196,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,196,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: '24px 24px',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(7,27,51,0.04), 0 8px 24px -12px rgba(7,27,51,0.18)',
      },
    },
  },
  plugins: [],
};