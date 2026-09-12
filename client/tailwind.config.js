/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        moon: {
          50: '#fffdf5',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          glow: '#fffae5',
        },
        night: {
          950: '#060814',
          900: '#0a0e27',
          850: '#0f172a',
          800: '#181e3d',
          700: '#1e2652',
          600: '#2c3670',
        },
        lantern: {
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
      },
      fontFamily: {
        sans: ['Quicksand', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'Comfortaa', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 90s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 25px rgba(250, 204, 21, 0.45))' },
          '50%': { filter: 'drop-shadow(0 0 45px rgba(250, 204, 21, 0.75))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
};
