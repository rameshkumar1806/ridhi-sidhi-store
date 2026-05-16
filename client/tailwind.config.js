/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-yellow-100', 'text-yellow-800', 'bg-yellow-500', 'shadow-yellow-500/30',
    'bg-blue-100', 'text-blue-800', 'bg-blue-500', 'shadow-blue-500/30',
    'bg-orange-100', 'text-orange-800', 'bg-orange-500', 'shadow-orange-500/30',
    'bg-indigo-100', 'text-indigo-800', 'bg-indigo-500', 'shadow-indigo-500/30',
    'bg-purple-100', 'text-purple-800', 'bg-purple-500', 'shadow-purple-500/30',
    'bg-green-100', 'text-green-800', 'bg-green-500', 'shadow-green-500/30',
    'bg-red-100', 'text-red-800', 'bg-red-500', 'shadow-red-500/30',
    'bg-gray-100', 'text-gray-800', 'bg-gray-500', 'shadow-gray-500/30',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B35',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        saffron: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        turmeric: {
          400: '#facc15',
          500: '#eab308',
        },
        leaf: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        shimmer: 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceSubtle: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-indian': 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%)',
        shimmer: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.05)',
        'card-hover': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        'btn-primary': '0 4px 14px 0 rgba(255,107,53,0.39)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
};
