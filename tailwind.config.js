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
        aero: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#15203b',
          750: '#1b2a4e',
          700: '#233863',
          border: '#1c2b4c',
          'border-light': '#2c406e',
          cyan: '#00e5ff',
          'cyan-muted': '#00bcd4',
          blue: '#2563eb',
          'blue-light': '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(30, 43, 76, 0.6)',
        'cyan-glow': '0 0 15px rgba(0, 229, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
