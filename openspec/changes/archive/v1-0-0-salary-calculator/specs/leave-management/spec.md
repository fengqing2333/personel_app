## ADDED Requirements

### Requirement: Leave types
The system SHALL support three types of leave: annual leave (年假), personal leave (事假), and sick leave (病假).

#### Scenario: Leave type selection
- **WHEN** user adds a new leave record
- **THEN** the system presents a choice of annual leave, personal leave, or sick leave

### Requirement: Add leave on date
The system SHALL allow the user to mark a date as a leave day by selecting the date and choosing a leave type.

The system SHALL support adding leave via the calendar (clicking a date) and via quick-add buttons in the attendance panel.

#### Scenario: Add leave from calendar
- **WHEN** user clicks a working day date on the calendar
- **THEN** a leave form appears allowing the user to select leave type and confirm

#### Scenario: Quick add leave
- **WHEN** user clicks "+ 年假" button in the attendance panel
- **THEN** the system prompts the user to select dates for annual leave

### Requirement: Leave deduction calculation
The system SHALL calculate salary deduction for leave days as: `leaveDays × (monthlySalary ÷ 22)`.

Different leave types MAY have different deduction rules (all full deduction by default for intern scenario).

#### Scenario: Leave deduction visible
- **WHEN** user has marked 1 personal leave day
- **THEN** the system shows a deduction of `1 × (9000 ÷ 22) = ¥409.09` in the salary overview

#### Scenario: No leave, no deduction
- **WHEN** user has no leave days in the current month
- **THEN** the system shows deduction as ¥0

### Requirement: Data persistence
All leave records SHALL be persisted in localStorage and survive page reloads.

#### Scenario: Leave persists after reload
- **WHEN** user adds a leave record, then refreshes the page
- **THEN** the leave record is still visible on the calendar and the deduction is still calculated
