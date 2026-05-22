/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de la quesería — cálida, artesanal, apetitosa
        queso: {
          50: '#FFFBF0',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        crema: {
          50: '#FFFDF7',
          100: '#FEF9EC',
          200: '#FDF3D4',
          300: '#FBEAB8',
          400: '#F7D97A',
          500: '#F3C740',
        },
        corteza: {
          100: '#F5EDD8',
          200: '#E8D5A8',
          300: '#D4B96E',
          400: '#B8913A',
          500: '#8B6914',
          600: '#6B4F10',
          700: '#4A350A',
          800: '#2D1F04',
        },
      },
      fontFamily: {
        // Playfair Display para títulos — elegante y editorial
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // Lato para texto corrido — limpio y legible
        body: ['Lato', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'texture-cheese': "url('/texture-cheese.svg')",
        'gradient-warm': 'linear-gradient(135deg, #FEF3C7 0%, #FFF9F0 50%, #FEF9EC 100%)',
        'gradient-hero': 'linear-gradient(160deg, #92400E 0%, #D97706 40%, #F59E0B 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
