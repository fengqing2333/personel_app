## Design

### V4 Color Scheme
- Background: linear-gradient(160deg, #f0f8fe, #faf5f0, #f5faee)
- Top bar: gradient #00c2ff → #0066ff → #667eea, 3px
- Bottom bar: gradient #ffc107 → #fb7185 → #a277ff, 4px
- Cards: #ffffff + box-shadow with cyan tint
- Text: #1a2a3a primary, #7a8ba3 secondary

### Tailwind Colors
Extend theme.colors in tailwind.config.js:
- text-primary: var(--text-primary)
- text-secondary: var(--text-secondary)
- bg-card: var(--bg-card)
- etc.

### Dark Class
useTheme toggles document.documentElement.classList.add/remove('dark')
