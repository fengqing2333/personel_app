## ADDED Requirements

### Requirement: Monthly calendar display
The system SHALL display a monthly calendar grid showing all days of the selected month, with weekday headers (Monday through Sunday).

The system SHALL support navigating between months via previous/next arrows.

#### Scenario: Calendar shows current month
- **WHEN** user opens the management view
- **THEN** the system displays a calendar for the current month with all dates properly positioned under the correct weekday column

#### Scenario: Month navigation
- **WHEN** user clicks the right arrow
- **THEN** the calendar advances to the next month

### Requirement: Work day identification
The system SHALL automatically identify each day as a working day or non-working day based on built-in Chinese holiday data (2024-2028).

The system SHALL use embedded holiday data including:
- Statutory holidays (e.g., Spring Festival, National Day)
- Make-up workdays (调休补班)

#### Scenario: Weekday marked as working day
- **WHEN** calendar displays a regular weekday (Monday-Friday) that is not a statutory holiday or make-up workday
- **THEN** the day is shown as a working day (highlighted with cyan accent)

#### Scenario: Weekend correctly handled
- **WHEN** calendar displays a Saturday or Sunday
- **THEN** the day is shown as a rest day (dimmed)

#### Scenario: Statutory holiday marked as rest
- **WHEN** calendar displays National Day holiday (October 1-7)
- **THEN** these dates are shown as rest days even though they are weekdays

#### Scenario: Make-up workday marked as work day
- **WHEN** calendar displays a make-up workday (调休补班, e.g., a Sunday that is a working day)
- **THEN** the day is shown as a working day even though it is a weekend

### Requirement: Leave day marking
The system SHALL visually distinguish three types of days: working days, rest days, and leave days using a color-coded legend:
- Cyan dot: working day
- Pink dot: leave day
- Gray dot: rest day

#### Scenario: Calendar shows legend
- **WHEN** user views the calendar
- **THEN** a legend is displayed showing the meaning of each color indicator

### Requirement: Attendance overview
The system SHALL display an attendance summary for the current month showing:
- Total working days in the month
- Days attended (worked)
- Days on leave
- Days rested (weekends + holidays)
- Remaining working days

The attendance SHALL be visualized with a donut progress ring.

#### Scenario: Attendance overview accuracy
- **WHEN** user views attendance panel on June 17, 2025
- **THEN** the system shows correct counts of attended days, leave days, rest days, and remaining days for June
