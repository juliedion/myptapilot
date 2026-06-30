/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#dcefff',
          200: '#b6e0ff',
          300: '#7cc8ff',
          400: '#3aa9ff',
          500: '#0c8ce9',
          600: '#0468c2',
          700: '#08529c',
          800: '#0b3f78',
          900: '#0a2647',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
