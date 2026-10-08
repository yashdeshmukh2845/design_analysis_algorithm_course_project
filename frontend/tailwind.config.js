/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F19",
          card: "#111827",
          panel: "#1F2937",
          border: "#374151"
        },
        brand: {
          cyan: "#06B6D4",
          teal: "#14B8A6",
          gold: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E",
          purple: "#A855F7"
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'dash-move': 'dashMove 1s linear infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.3))' }
        },
        dashMove: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' }
        }
      }
    },
  },
  plugins: [],
}
