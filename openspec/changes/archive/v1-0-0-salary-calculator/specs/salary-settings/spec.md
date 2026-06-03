## ADDED Requirements

### Requirement: Configurable monthly salary
The system SHALL allow the user to set and modify their monthly salary amount.

#### Scenario: Set monthly salary
- **WHEN** user enters "9000" in the monthly salary field
- **THEN** the system stores the value and recalculates all salary data (second rate, daily rate, etc.)

#### Scenario: Salary change triggers recalculation
- **WHEN** user changes monthly salary from 9000 to 10000
- **THEN** the displayed today's earnings, monthly progress, and yearly total immediately update

### Requirement: Configurable daily work hours
The system SHALL allow the user to set and modify their daily work hours.

#### Scenario: Set daily hours
- **WHEN** user sets daily hours to "8"
- **THEN** the system recalculates the second rate using the new value

### Requirement: Configurable work days per month
The system SHALL allow the user to set and modify the number of working days per month (default 22).

#### Scenario: Set work days per month
- **WHEN** user changes work days per month from 22 to 20
- **THEN** the daily rate and second rate are recalculated accordingly

### Requirement: Settings persistence
All salary settings SHALL be persisted in localStorage and restored on page load.

#### Scenario: Settings persist after reload
- **WHEN** user sets monthly salary to 9000 and refreshes the page
- **THEN** the salary field still shows 9000 and calculations use the correct value

### Requirement: Display computed values
The system SHALL display computed values derived from settings, including:
- Second rate (¥/second)
- Daily rate (¥/day)
- Effective hourly rate (¥/hour)

#### Scenario: Computed values visible
- **WHEN** user views the salary settings panel
- **THEN** the system displays the calculated second rate, daily rate, and hourly rate
