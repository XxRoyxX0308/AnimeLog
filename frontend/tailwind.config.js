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
        // Anime-inspired accent colors
        'anime': {
          'primary': '#FF6B9D',      // Sakura pink
          'secondary': '#9D4EDD',     // Purple accent
          'accent': '#00D4FF',        // Cyan glow
          'dark': {
            '900': '#0D0D0F',
            '800': '#13131A',
            '700': '#1A1A24',
            '600': '#24242F',
            '500': '#2E2E3A',
          },
          'success': '#10B981',
          'warning': '#F59E0B',
          'error': '#EF4444',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'anime-gradient': 'linear-gradient(135deg, #FF6B9D 0%, #9D4EDD 50%, #00D4FF 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #FF6B9D, 0 0 10px #FF6B9D' },
          '100%': { boxShadow: '0 0 10px #9D4EDD, 0 0 20px #9D4EDD' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
