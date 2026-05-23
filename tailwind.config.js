import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
        '4k': '2560px',
        'fuhd': '3840px',
      },
      colors: {
        'vitra-graphite': '#1A1C23',
        'vitra-cream': '#F8F9FA',
        'vitra-cyan': '#00E5FF',
        'vitra-blue': '#00B4D8'
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        vitra: {
          "primary": "#ffffff",
          "secondary": "#a1a1aa",
          "accent": "#00E5FF",
          "neutral": "#1A1C23",
          "base-100": "#1A1C23",
          "info": "#00B4D8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "dark"
    ],
  },
}
