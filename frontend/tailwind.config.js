/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#111111',
          card: '#141414',
          hover: '#1a1a1a',
        },
        accent: {
          purple: '#6c47ff',
          blue: '#3b82f6',
          glow: 'rgba(108,71,255,0.15)',
        },
        border: {
          subtle: '#222222',
          strong: '#333333',
        },
        text: {
          primary: '#ffffff',
          secondary: '#888888',
          muted: '#555555',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 60px rgba(108,71,255,0.12)',
        'glow-sm': '0 0 30px rgba(108,71,255,0.08)',
      },
    },
  },
  plugins: [],
}
