import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        skeleton: {
          '0%': { backgroundColor: 'rgb(229, 231, 235)' },
          '100%': { backgroundColor: 'rgb(243, 244, 246)' },
        },
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [
    // Custom plugin for attendance status colors (Tailwind v4 compatible)
    plugin(function({ addUtilities }) {
      addUtilities({
        '.status-present': {
          '@apply bg-green-100 text-green-800 border-green-200': {},
        },
        '.status-late': {
          '@apply bg-yellow-100 text-yellow-800 border-yellow-200': {},
        },
        '.status-absent': {
          '@apply bg-red-100 text-red-800 border-red-200': {},
        },
        '.status-excused': {
          '@apply bg-blue-100 text-blue-800 border-blue-200': {},
        },
        '.dark .status-present': {
          '@apply bg-green-900/20 text-green-400 border-green-800': {},
        },
        '.dark .status-late': {
          '@apply bg-yellow-900/20 text-yellow-400 border-yellow-800': {},
        },
        '.dark .status-absent': {
          '@apply bg-red-900/20 text-red-400 border-red-800': {},
        },
        '.dark .status-excused': {
          '@apply bg-blue-900/20 text-blue-400 border-blue-800': {},
        },
        // Layout shift prevention utilities
        '.prevent-layout-shift': {
          'min-height': '1px',
          'contain': 'layout style',
        },
        '.skeleton': {
          '@apply animate-skeleton bg-gray-200 rounded': {},
        },
        '.skeleton-text': {
          '@apply skeleton h-4 w-full mb-2': {},
        },
        '.skeleton-title': {
          '@apply skeleton h-6 w-3/4 mb-4': {},
        },
        '.skeleton-button': {
          '@apply skeleton h-10 w-24 rounded-md': {},
        },
        '.stable-container': {
          'min-height': '100vh',
          'contain': 'layout',
        },
        '.stable-grid': {
          'grid-template-rows': 'auto 1fr auto',
          'min-height': '100vh',
        },
        '.loading-placeholder': {
          'min-height': '200px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      });
    }),
  ],
  // Future-proof configuration
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
