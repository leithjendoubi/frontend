/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-blue': {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#60A5FA',
          600: '#3B82F6',
          700: '#2563EB',
          800: '#1D4ED8',
        },
        navy: {
          50: '#F0F4FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1E3A8A',
          800: '#1E3A8A',
          900: '#1E3A8A',
        },
      },
    },
  },
  plugins: [],
};
