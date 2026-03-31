/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './{components,pages,services,context,lib,utils}/**/*.{js,ts,jsx,tsx}',
    './App.tsx',
    './index.tsx',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#13c8ec',
        'primary-dark': '#0ea5c3',
        'background-light': '#f0f4f8',
        'background-dark': '#0b1011',
        'surface-light': '#ffffff',
        'surface-dark': '#141b1d',
        'surface-dark-hover': '#1c2528',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        scaleUp: 'scaleUp 0.2s ease-out forwards',
        slideLeft: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideDown: 'slideDown 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
