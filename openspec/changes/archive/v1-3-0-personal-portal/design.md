## Design

### Layout
Magazine-style: 220px sidebar (deep purple) + main content (cream bg)

### Colors
- Sidebar: gradient #1a0e2e → #2a1a3e
- Main bg: #faf6f0
- Cards: white, 24px radius, soft shadow
- Text: #3a2a1a / #2a1a0a

### Components
- HomePage.vue: quote banner + feature cards
- App.vue: sidebar nav + router-view
- quotes.js: array of daily quotes

### Routes
- / → HomePage (portal dashboard)
- /salary → SalaryDashboard (existing)
- /management → ManagementView (existing)
