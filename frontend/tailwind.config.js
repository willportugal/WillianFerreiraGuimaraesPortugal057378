/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Spotify-inspired color palette
        spotify: {
          green: '#1DB954',
          'green-dark': '#1ed760',
          black: '#191414',
          'dark-gray': '#121212',
          'light-gray': '#282828',
          'medium-gray': '#404040',
          'text-gray': '#b3b3b3',
          white: '#ffffff',
        },
        // Custom dark theme
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1DB954',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Circular', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'equalizer': 'equalizer 0.5s ease-in-out infinite alternate',
      },
      keyframes: {
        equalizer: {
          '0%': { height: '10%' },
          '100%': { height: '100%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-spotify': 'linear-gradient(to bottom, rgba(0,0,0,0.6), #121212)',
      },
    },
  },
  plugins: [],
}
