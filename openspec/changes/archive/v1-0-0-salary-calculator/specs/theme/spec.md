## ADDED Requirements

### Requirement: Dark theme (default)
The system SHALL use a dark color theme as the default theme with the following color palette:
- Background: #0a0e17 (deep navy)
- Card background: #111827
- Accent primary: #00c2ff → #0066ff (cyan gradient)
- Text primary: #ffffff
- Text secondary: #556/ #889

#### Scenario: Default theme is dark
- **WHEN** user opens the application for the first time
- **THEN** the page renders with the dark theme colors

### Requirement: Light theme
The system SHALL provide a light theme alternative with appropriate color contrast.

#### Scenario: Switch to light theme
- **WHEN** user clicks the theme toggle button
- **THEN** the page transitions to light theme with appropriate background and text colors

### Requirement: Theme persistence
The user's theme preference SHALL be persisted in localStorage.

#### Scenario: Theme persists after reload
- **WHEN** user switches to light theme and refreshes the page
- **THEN** the page renders in light theme

### Requirement: Smooth theme transition
The system SHALL apply CSS transitions (0.3s ease) when switching between themes for a smooth visual experience.

#### Scenario: Smooth theme switch
- **WHEN** user toggles the theme
- **THEN** background and text colors transition smoothly over 300ms
