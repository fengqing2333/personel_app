## ADDED Requirements

### Requirement: Calendar day text labels
Each calendar date SHALL display a text label indicating its type.

#### Scenario: Work day shows 班
- WHEN calendar displays a regular work day
- THEN the date shows "班" text label in cyan

#### Scenario: Leave day shows 假
- WHEN calendar displays a day with leave record
- THEN the date shows "假" text label in pink

#### Scenario: Holiday shows 节
- WHEN calendar displays a statutory holiday
- THEN the date shows "节" text label in gold

#### Scenario: Weekend shows 休
- WHEN calendar displays a weekend
- THEN the date shows "休" text label in gray

### Requirement: Today highlight
The current date SHALL be visually distinct with a blue gradient background.

### Requirement: Monthly summary
The calendar SHALL display attendance summary at the bottom.
