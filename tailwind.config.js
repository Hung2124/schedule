/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  // Giảm safelist xuống chỉ giữ các lớp thực sự cần thiết
  safelist: [
    // Các lớp được sử dụng trong subjectColors
    'bg-green-100', 'bg-green-700', 'text-green-800', 'text-green-200', 'border-green-500',
    'bg-yellow-100', 'bg-yellow-700', 'text-yellow-800', 'text-yellow-200', 'border-yellow-500',
    'bg-sky-100', 'bg-sky-700', 'text-sky-800', 'text-sky-200', 'border-sky-500',
    'bg-pink-100', 'bg-pink-700', 'text-pink-800', 'text-pink-200', 'border-pink-500',
    'bg-violet-100', 'bg-violet-700', 'text-violet-800', 'text-violet-200', 'border-violet-500',
    'bg-rose-200', 'bg-rose-600', 'text-rose-800', 'text-rose-100', 'border-rose-500',
    'bg-teal-200', 'bg-teal-600', 'text-teal-800', 'text-teal-100', 'border-teal-500',
    'bg-red-200', 'bg-red-600', 'text-red-800', 'text-red-100', 'border-red-500',
    'bg-blue-200', 'bg-blue-600', 'text-blue-800', 'text-blue-100', 'border-blue-500',
    'bg-gray-300', 'bg-gray-600', 'text-gray-800', 'text-gray-100', 'border-gray-500',
    'bg-purple-200', 'bg-purple-600', 'text-purple-800', 'text-purple-100', 'border-purple-500',
    'bg-emerald-200', 'bg-emerald-600', 'text-emerald-800', 'text-emerald-100', 'border-emerald-500',
    'bg-cyan-200', 'bg-cyan-600', 'text-cyan-800', 'text-cyan-100', 'border-cyan-500',
    'bg-orange-200', 'bg-orange-600', 'text-orange-800', 'text-orange-100', 'border-orange-500',
    'bg-lime-200', 'bg-lime-600', 'text-lime-800', 'text-lime-100', 'border-lime-500',
    'bg-amber-200', 'bg-amber-600', 'text-amber-800', 'text-amber-100', 'border-amber-500',
    'bg-indigo-200', 'bg-indigo-600', 'text-indigo-800', 'text-indigo-100', 'border-indigo-500',
    
    // Dark mode variants
    'dark:bg-green-700', 'dark:text-green-200',
    'dark:bg-yellow-700', 'dark:text-yellow-200',
    'dark:bg-sky-700', 'dark:text-sky-200',
    'dark:bg-pink-700', 'dark:text-pink-200',
    'dark:bg-violet-700', 'dark:text-violet-200',
    'dark:bg-rose-600', 'dark:text-rose-100',
    'dark:bg-teal-600', 'dark:text-teal-100',
    'dark:bg-red-600', 'dark:text-red-100',
    'dark:bg-blue-600', 'dark:text-blue-100',
    'dark:bg-gray-600', 'dark:text-gray-100',
    'dark:bg-purple-600', 'dark:text-purple-100',
    'dark:bg-emerald-600', 'dark:text-emerald-100',
    'dark:bg-cyan-600', 'dark:text-cyan-100',
    'dark:bg-orange-600', 'dark:text-orange-100',
    'dark:bg-lime-600', 'dark:text-lime-100',
    'dark:bg-amber-600', 'dark:text-amber-100',
    'dark:bg-indigo-600', 'dark:text-indigo-100',
    
    // Background utilities
    'bg-gradient-to-r',
    'bg-clip-text',
    'text-transparent',
    'backdrop-blur-xs',
    'backdrop-blur-sm',
    'backdrop-blur-md',
    'backdrop-blur-lg',
    'bg-white/5',
    'bg-white/10',
    'bg-white/20',
    
    // Utility classes
    'pointer-events-none',
    'pointer-events-auto',
    'relative',
    'absolute',
    'z-10',
    'z-20',
    'z-30',
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
  important: true,
};