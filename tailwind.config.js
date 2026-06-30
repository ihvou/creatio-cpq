/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        chrome: { DEFAULT: 'var(--c-chrome)', 2: 'var(--c-chrome-2)' },
        primary: { DEFAULT: 'var(--c-primary)', hover: 'var(--c-primary-hover)' },
        accent: { DEFAULT: 'var(--c-accent)', soft: 'var(--c-accent-soft)' },
        success: { DEFAULT: 'var(--c-success)', bg: 'var(--c-success-bg)' },
        warning: { DEFAULT: 'var(--c-warning)', bg: 'var(--c-warning-bg)' },
        danger: { DEFAULT: 'var(--c-danger)', bg: 'var(--c-danger-bg)' },
        info: { DEFAULT: 'var(--c-info)', bg: 'var(--c-info-bg)' },
        surface: { DEFAULT: 'var(--c-surface)', 2: 'var(--c-surface-2)' },
        bg: 'var(--c-bg)',
        line: { DEFAULT: 'var(--c-border)', strong: 'var(--c-border-strong)' },
        ink: { DEFAULT: 'var(--c-text)', secondary: 'var(--c-text-secondary)', muted: 'var(--c-text-muted)' },
      },
      borderRadius: { sm: 'var(--c-radius-sm)', md: 'var(--c-radius-md)', lg: 'var(--c-radius-lg)' },
      boxShadow: { card: 'var(--c-shadow-sm)', pop: 'var(--c-shadow-md)', modal: 'var(--c-shadow-lg)' },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
}
