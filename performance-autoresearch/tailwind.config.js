/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        signal: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d4fe',
          300: '#a4b4fd',
          400: '#7b8cf9',
          500: '#5468f5',
          600: '#3f4de9',
          700: '#3039d0',
          800: '#2b33a9',
          900: '#272f86',
          950: '#1a1e55',
        },
        navy: {
          800: '#0d1117',
          850: '#0b0f15',
          900: '#080c12',
          950: '#050810',
        },
        panel: '#0f1520',
        card: '#131c2e',
        border: '#1e2d47',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

