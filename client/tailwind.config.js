/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'ocean-blue': {
          start: '#2193b0',
          end: '#6dd5ed',
        },
        'royal-purple': {
          start: '#7b4397',
          end: '#dc2430',
        },
        'sunset-orange': {
          start: '#ff7e5f',
          end: '#feb47b',
        },
        'ocean-soft': {
          start: '#6dd5ed',
          end: '#f4f9fe',
        },
        'purple-mist': {
          start: '#dc2430',
          end: '#f5e6f2',
        },
        'warm-glow': {
          start: '#feb47b',
          end: '#fff1e6',
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(to right, #2193b0, #6dd5ed)',
        'purple-gradient': 'linear-gradient(to right, #7b4397, #dc2430)',
        'orange-gradient': 'linear-gradient(to right, #ff7e5f, #feb47b)',
        'ocean-soft': 'linear-gradient(to right, #6dd5ed, #f4f9fe)',
        'purple-mist': 'linear-gradient(to right, #dc2430, #f5e6f2)',
        'warm-glow': 'linear-gradient(to right, #feb47b, #fff1e6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};