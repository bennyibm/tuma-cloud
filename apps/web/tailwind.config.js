/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: '#111827',
        border: '#1F2937',
        primary: {
          DEFAULT: '#10B981',
          hover: '#059669',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
        solar: {
          DEFAULT: '#FF6B00',
          hover: '#E05E00',
          glow: 'rgba(255, 107, 0, 0.25)',
        },
        cyber: {
          DEFAULT: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-solar': '0 0 25px -5px rgba(255, 107, 0, 0.3)',
        'glow-cyber': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
      },
    },
  },
  plugins: [],
}
