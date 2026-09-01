/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tuma: {
          bg: '#0B0F19',
          card: '#111827',
          cardHover: '#1F2937',
          border: '#1F2937',
          emerald: '#10B981',
          emeraldLight: '#34D399',
          solar: '#FF6B00',
          solarLight: '#FFA057',
          cyan: '#06B6D4',
          muted: '#9CA3AF',
          darkMuted: '#6B7280',
          text: '#F9FAFB',
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-solar': '0 0 25px -5px rgba(255, 107, 0, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
