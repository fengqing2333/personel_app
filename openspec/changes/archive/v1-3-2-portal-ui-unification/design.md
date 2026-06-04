design done
## Goal
Update all component colors to use the portal's smoky blue vintage palette via CSS variables.

### Approach
Only modify CSS variable values in :root. No component HTML/JS changes needed.

### Color Changes
- --bg-primary: #eef0f2
- --bg-secondary: #f6f4f0  
- --text-primary: #2a2a3a
- --text-secondary: #8a92a0
- --accent: #5a6a8a
- --accent-gradient: linear-gradient(135deg, #5a6a8a, #4a5a7a)
- --danger: #dc5050
- --border: #d5d8de
- App.vue portal bg: use var(--bg-primary) not hardcoded

### Non-Color Tweaks
- border-radius: 12px -> 16px on card components
- LIVE badge: cyan -> var(--accent)
- Progress bar: gradient -> solid var(--accent)
- WeeklyChart: gradient -> solid var(--accent)
- Today highlight: gradient -> solid var(--accent)
