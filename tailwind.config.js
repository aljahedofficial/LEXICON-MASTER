const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          50: '#f0f4fb',
          100: '#e0e9f7',
          200: '#c1d3ef',
          300: '#a2bce7',
          400: '#8ba5de',
          500: '#1A2a4A', // Main primary color
          600: '#162240',
          700: '#121a35',
          800: '#0e122a',
          900: '#0a0a1f',
        },
        // Secondary palette - Teal
        secondary: {
          50: '#e0f9f9',
          100: '#b3f0f0',
          200: '#80e6e6',
          300: '#4ddddd',
          400: '#33d1d1',
          500: '#00D9FF', // Main secondary color
          600: '#00c2e6',
          700: '#00a8cc',
          800: '#008eb3',
          900: '#007199',
        },
        // Accent - Gold
        accent: {
          50: '#fffbf0',
          100: '#fff5d9',
          200: '#ffe6b3',
          300: '#ffd780',
          400: '#ffd066',
          500: '#FFB84D', // Main accent color
          600: '#ff9800',
          700: '#e68900',
          800: '#cc7700',
          900: '#b36600',
        },
        // Status colors
        success: {
          50: '#e8f8f1',
          100: '#c8ede0',
          200: '#a3ddc8',
          300: '#7ecdb0',
          400: '#64c1a0',
          500: '#10B981', // Main success color
          600: '#0da671',
          700: '#0a8c5f',
          800: '#07734d',
          900: '#045a3d',
        },
        alert: {
          50: '#fef0ef',
          100: '#fdcbca',
          200: '#fba6a4',
          300: '#f9817e',
          400: '#f76662',
          500: '#FF6B6B', // Main alert color
          600: '#f03838',
          700: '#d62828',
          800: '#bb2222',
          900: '#a01c1c',
        },
        // Neutral - Gray
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748B', // Main neutral color
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        // Display fonts
        display: ['Georgia', 'Playfair Display', 'serif'],
        // Body fonts
        body: ['Segoe UI', 'Lato', 'sans-serif'],
        // Code fonts
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
      fontSize: {
        // Display sizes
        'display-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'display-md': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'display-sm': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        // Heading sizes
        'heading-xl': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'heading-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        // Body sizes
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'body-xs': ['11px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'base': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 20px rgba(26, 42, 74, 0.3)',
        'glow-secondary': '0 0 20px rgba(0, 217, 255, 0.3)',
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
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
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        '300': '300ms',
        '500': '500ms',
      },
      backdropBlur: {
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
module.exports = config
