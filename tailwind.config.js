/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent)',
        'danger': 'var(--danger)',
        'border': 'var(--border)',
        'portal-bg': '#faf6f0',
        'portal-text': '#3a2a1a',
        'portal-muted': '#9a8a7a',
        'sidebar': '#1a0e2e',
        'sidebar-hover': '#2a1a3e',
      }
    }
  },
  plugins: []
}
