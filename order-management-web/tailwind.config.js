/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Neutros — slate más cálido que blanco puro para look premium
        background: '#ffffff',
        surface: '#fafafa',
        foreground: '#09090b',
        muted: '#f4f4f5',
        'muted-foreground': '#71717a',
        border: '#e4e4e7',
        'border-strong': '#d4d4d8',
        input: '#e4e4e7',
        ring: '#6366f1',

        // Acento — indigo (Linear-style)
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          foreground: '#ffffff',
          subtle: '#eef2ff',
          'subtle-foreground': '#4338ca',
        },
        accent: {
          DEFAULT: '#eef2ff',
          foreground: '#4338ca',
        },
        destructive: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c',
          foreground: '#ffffff',
          subtle: '#fef2f2',
          'subtle-foreground': '#b91c1c',
        },
        success: {
          DEFAULT: '#16a34a',
          foreground: '#ffffff',
          subtle: '#f0fdf4',
          'subtle-foreground': '#15803d',
        },
        warning: {
          DEFAULT: '#d97706',
          foreground: '#ffffff',
          subtle: '#fffbeb',
          'subtle-foreground': '#b45309',
        },
        info: {
          DEFAULT: '#4f46e5',
          subtle: '#eef2ff',
          'subtle-foreground': '#4338ca',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        // Sombras Linear-style: muy sutiles, capas finas
        xs: '0 1px 2px 0 rgb(9 9 11 / 0.04)',
        sm: '0 1px 2px 0 rgb(9 9 11 / 0.05), 0 1px 3px 0 rgb(9 9 11 / 0.04)',
        DEFAULT: '0 2px 4px -1px rgb(9 9 11 / 0.06), 0 1px 2px -1px rgb(9 9 11 / 0.04)',
        md: '0 4px 8px -2px rgb(9 9 11 / 0.06), 0 2px 4px -2px rgb(9 9 11 / 0.04)',
        lg: '0 12px 24px -8px rgb(9 9 11 / 0.10), 0 4px 8px -4px rgb(9 9 11 / 0.06)',
        xl: '0 20px 40px -12px rgb(9 9 11 / 0.15), 0 8px 16px -8px rgb(9 9 11 / 0.08)',
        '2xl': '0 32px 64px -16px rgb(9 9 11 / 0.20)',
        // Ring-focus visible
        focus: '0 0 0 3px rgb(99 102 241 / 0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-in-up': 'fade-in-up 220ms ease-out',
        'scale-in': 'scale-in 180ms ease-out',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
