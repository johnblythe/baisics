/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'tilt': {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.5deg)' },
          '75%': { transform: 'rotate(-0.5deg)' },
        },
        float: {
          '0%': { 
            transform: 'translateY(100%) scale(0.5)', 
            opacity: 0 
          },
          '20%': { 
            opacity: 1 
          },
          '80%': { 
            opacity: 1 
          },
          '100%': { 
            transform: 'translateY(-100%) scale(1.5) rotate(30deg)', 
            opacity: 0 
          }
        },
        'float-wide': {
          '0%': { 
            transform: 'translate(0, 0) scale(0.5) rotate(0deg)', 
            opacity: 0 
          },
          '20%': { 
            transform: 'translate(20%, -20%) scale(1.5) rotate(120deg)',
            opacity: 0.7
          },
          '40%': {
            transform: 'translate(-20%, -40%) scale(2) rotate(240deg)',
            opacity: 0.5
          },
          '60%': {
            transform: 'translate(30%, -60%) scale(1.5) rotate(360deg)',
            opacity: 0.7
          },
          '80%': {
            transform: 'translate(-10%, -80%) scale(1) rotate(480deg)',
            opacity: 0.5
          },
          '100%': { 
            transform: 'translate(0, -100%) scale(0.5) rotate(520deg)', 
            opacity: 0 
          }
        },
        'float-continuous': {
          '0%': { 
            transform: 'translate(0, 0) scale(0.5) rotate(0deg)', 
            opacity: 0 
          },
          '5%': {
            transform: 'translate(5%, -5%) scale(0.7) rotate(20deg)',
            opacity: 0.1
          },
          '15%': {
            transform: 'translate(10%, -15%) scale(0.9) rotate(45deg)',
            opacity: 0.3
          },
          '30%': { 
            transform: 'translate(15%, -30%) scale(1.2) rotate(90deg)',
            opacity: 0.5
          },
          '50%': {
            transform: 'translate(-10%, -50%) scale(1.5) rotate(180deg)',
            opacity: 0.6
          },
          '70%': {
            transform: 'translate(10%, -70%) scale(1.2) rotate(270deg)',
            opacity: 0.5
          },
          '85%': {
            transform: 'translate(-5%, -85%) scale(0.9) rotate(360deg)',
            opacity: 0.3
          },
          '95%': {
            transform: 'translate(0, -95%) scale(0.7) rotate(400deg)',
            opacity: 0.1
          },
          '100%': { 
            transform: 'translate(0, -100%) scale(0.5) rotate(420deg)', 
            opacity: 0 
          }
        }
      },
      animation: {
        'scroll-left': 'scroll-left 60s linear infinite',
        'scroll-right': 'scroll-right 45s linear infinite',
        'tilt': 'tilt 10s infinite linear',
        'float': 'float 5s ease-in-out infinite',
        'float-wide': 'float-wide 8s ease-in-out infinite',
        'float-continuous': 'float-continuous 8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      },
    },
  },
  plugins: [],
} 