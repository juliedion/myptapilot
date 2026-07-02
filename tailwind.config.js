/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#3b0764',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 24px -4px rgba(124, 58, 237, 0.4)',
        'card':  '0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.06)',
        'glow':  '0 0 0 3px rgba(124, 58, 237, 0.15)',
      },
    },
  },
  plugins: [],
}
