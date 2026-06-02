## ADDED Requirements

### Requirement: Real-time salary display
The system SHALL display the current day's earned salary in real-time, updating every second.

The system SHALL calculate today's earnings as: `secondRate × secondsElapsedToday`.
The system SHALL calculate second rate as: `monthlySalary ÷ 22 ÷ dailyHours ÷ 3600`.

#### Scenario: Page load shows today's earnings
- **WHEN** user opens the salary dashboard at 10:00 AM
- **THEN** the system displays an amount equal to `secondRate × 36000` (10 hours in seconds)

#### Scenario: Number ticks up every second
- **WHEN** user watches the salary number for 3 seconds
- **THEN** the displayed amount increases by exactly `secondRate × 3` every 3 seconds

#### Scenario: Live indicator shown
- **WHEN** salary dashboard is active
- **THEN** a LIVE badge is displayed next to the real-time amount

### Requirement: Monthly salary progress
The system SHALL display the current month's total earned salary and progress toward the monthly target.

The system SHALL show monthly progress as a percentage bar.

#### Scenario: Monthly progress display
- **WHEN** user views the salary dashboard on the 10th working day of the month
- **THEN** the system shows the monthly earned amount and a progress bar at 10/22 of monthly salary

### Requirement: Yearly salary accumulation
The system SHALL display the total salary earned in the current year.

#### Scenario: Yearly total display
- **WHEN** user views the salary dashboard
- **THEN** the system shows the total salary earned for the current year

### Requirement: Weekly earnings chart
The system SHALL display a bar chart showing daily earnings for the current work week (Monday to Friday), with weekends shown as non-working days.

#### Scenario: Weekly chart shows working days
- **WHEN** user views the salary dashboard on a Friday
- **THEN** the system shows 5 bars for Monday through Friday, with Monday-Tuesday bars showing accumulated amounts based on seconds elapsed

#### Scenario: Weekends shown as non-working
- **WHEN** user views the weekly chart
- **THEN** Saturday and Sunday are shown as non-working days (dashed line, no bar)

### Requirement: Fullscreen immersive mode
The system SHALL provide a fullscreen mode that hides navigation and shows only the real-time salary number at large size.

#### Scenario: Enter fullscreen mode
- **WHEN** user clicks "全屏沉浸模式" button
- **THEN** the system enters browser fullscreen API and displays only the salary number large and centered
