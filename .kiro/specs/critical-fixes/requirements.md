# Requirements Document: Critical System Fixes

## Introduction

This document outlines the requirements for fixing critical, high, and medium priority issues in the clinic management system. These fixes are essential for proper system operation and will ensure role-based access control, complete data capture, and comprehensive patient information management.

## Glossary

- **System**: The clinic management web application
- **User**: Any authenticated person using the system
- **Patient**: Individual receiving medical care
- **Visit**: A single patient encounter in the clinic
- **Queue**: The workflow system tracking patients through different stages
- **Triage**: Initial patient assessment including vital signs
- **Card Number**: Physical card identifier given to patients for long-term identification
- **Questioning Findings**: Doctor's notes from initial patient examination
- **Vital Signs**: Measurable indicators of patient health status
- **Role**: User's job function determining system access (reception, triage, nurse, doctor, laboratory, admin)
- **Stage**: Current position in the patient workflow (Waiting Room, Triage, Questioning, Laboratory Test, Results by Doctor, Discharged)

## Requirements

### Requirement 1: Role-Based Queue Access Control

**User Story:** As a healthcare worker, I want to see only the queue stages relevant to my role, so that I can focus on my specific responsibilities without confusion.

#### Acceptance Criteria

1. WHEN a reception user views the queue THEN the system SHALL display only the Waiting Room stage
2. WHEN a triage nurse or staff user views the queue THEN the system SHALL display only the Triage stage
3. WHEN a doctor views the queue THEN the system SHALL display only the Questioning and Results by Doctor stages
4. WHEN a laboratory user views the queue THEN the system SHALL display only the Laboratory Test stage
5. WHEN an admin user views the queue THEN the system SHALL display all stages for oversight
6. WHEN a user views the queue THEN the system SHALL show only patients in stages relevant to that user's role
7. WHEN the queue header displays patient count THEN the system SHALL count only patients in the user's relevant stages
8. WHEN the queue grid layout renders THEN the system SHALL adapt to the number of visible stages (1 stage: centered single column, 2 stages: two columns, 3+ stages: responsive grid)

### Requirement 2: Enhanced Patient Identification System

**User Story:** As reception staff, I want patients to have both system-generated IDs and physical card numbers, so that we can manage long-term patient records effectively.

#### Acceptance Criteria

1. WHEN a new patient is registered THEN the system SHALL generate a unique sequential patient ID (P-001, P-002, etc.)
2. WHEN a patient is registered THEN the system SHALL allow entry of a physical card number
3. WHEN a card number is entered THEN the system SHALL validate it is unique across all patients
4. WHEN searching for patients THEN the system SHALL support search by card number in addition to name and phone
5. WHEN displaying patient information THEN the system SHALL show both the system ID and card number
6. WHEN a patient returns for a visit THEN the system SHALL allow lookup by card number for quick identification
7. WHEN a card number is not provided THEN the system SHALL allow patient registration to proceed (card number is optional)

### Requirement 3: Complete Vital Signs Collection

**User Story:** As a triage nurse, I want to record all essential vital signs, so that doctors have complete baseline health information.

#### Acceptance Criteria

1. WHEN recording vital signs THEN the system SHALL capture height in centimeters
2. WHEN recording vital signs THEN the system SHALL capture weight in kilograms
3. WHEN recording vital signs THEN the system SHALL capture blood pressure in mmHg format (e.g., 120/80)
4. WHEN recording vital signs THEN the system SHALL capture temperature in Celsius
5. WHEN recording vital signs THEN the system SHALL capture pulse in beats per minute
6. WHEN recording vital signs THEN the system SHALL capture respiratory rate in breaths per minute
7. WHEN recording vital signs THEN the system SHALL capture oxygen saturation as a percentage
8. WHEN height and weight are entered THEN the system SHALL automatically calculate and display BMI
9. WHEN completing triage THEN the system SHALL require all seven vital signs before allowing progression
10. WHEN vital signs are saved THEN the system SHALL store them in structured JSON format for easy retrieval

### Requirement 4: Doctor Questioning Findings Capture

**User Story:** As a doctor, I want to record my examination findings before ordering tests, so that I document my initial assessment and clinical reasoning.

#### Acceptance Criteria

1. WHEN a doctor views a patient in the Questioning stage THEN the system SHALL display the patient's triage data prominently
2. WHEN a doctor examines a patient THEN the system SHALL provide a text area for recording questioning findings
3. WHEN a doctor records findings THEN the system SHALL allow entry of symptoms, physical examination results, and initial impressions
4. WHEN a doctor completes questioning THEN the system SHALL save the findings to the visit record
5. WHEN a doctor orders lab tests THEN the system SHALL require questioning findings to be entered first
6. WHEN questioning findings are saved THEN the system SHALL record the timestamp and the doctor who entered them
7. WHEN a doctor views a patient with existing findings THEN the system SHALL display those findings for reference

### Requirement 5: Prominent Triage Data Display for Doctors

**User Story:** As a doctor, I want to see triage vital signs prominently when examining a patient, so that I have immediate access to baseline health information.

#### Acceptance Criteria

1. WHEN a doctor views a patient in Questioning stage THEN the system SHALL display vital signs in a highlighted card at the top of the patient information
2. WHEN displaying vital signs THEN the system SHALL show all seven measurements with clear labels and units
3. WHEN displaying vital signs THEN the system SHALL show the calculated BMI
4. WHEN displaying vital signs THEN the system SHALL show who performed the triage and when
5. WHEN displaying vital signs THEN the system SHALL show triage notes if any were recorded
6. WHEN vital signs are outside normal ranges THEN the system SHALL highlight them with warning colors
7. WHEN a patient has no triage data THEN the system SHALL display a notice indicating triage was skipped

### Requirement 6: Lab Results Notification System

**User Story:** As a doctor, I want to be notified when lab results are available, so that I can review them promptly and continue patient care.

#### Acceptance Criteria

1. WHEN lab results are submitted THEN the system SHALL move the patient to the Results by Doctor stage
2. WHEN a patient enters Results by Doctor stage THEN the system SHALL display a visual indicator (badge count) on the queue column
3. WHEN a doctor views the Results by Doctor queue THEN the system SHALL sort patients by how long results have been waiting
4. WHEN a patient card displays in Results by Doctor THEN the system SHALL show a "New Results" badge
5. WHEN lab results are available THEN the system SHALL display them in a prominent, easy-to-read format
6. WHEN a doctor opens lab results THEN the system SHALL show which tests were performed and their results
7. WHEN a doctor reviews results THEN the system SHALL provide a text area for recording lab findings interpretation

### Requirement 7: Prescription Viewing and Printing

**User Story:** As a doctor, I want to view and print prescriptions, so that patients receive proper medication documentation.

#### Acceptance Criteria

1. WHEN a patient is discharged with a prescription THEN the system SHALL create a prescription record
2. WHEN viewing a prescription THEN the system SHALL display all medications with dosage and frequency
3. WHEN viewing a prescription THEN the system SHALL display treatment instructions
4. WHEN viewing a prescription THEN the system SHALL display the prescribing doctor's name and license number
5. WHEN viewing a prescription THEN the system SHALL display the prescription date and validity period
6. WHEN printing a prescription THEN the system SHALL format it on a professional template with clinic letterhead
7. WHEN printing a prescription THEN the system SHALL include patient name, ID, and date of birth
8. WHEN printing a prescription THEN the system SHALL include a unique prescription number for tracking
9. WHEN a prescription is printed THEN the system SHALL record the print timestamp
10. WHEN viewing patient history THEN the system SHALL show all past prescriptions with dates

### Requirement 8: Comprehensive Patient History View

**User Story:** As a healthcare provider, I want to view a patient's complete medical history across all visits, so that I can provide informed, continuous care.

#### Acceptance Criteria

1. WHEN viewing patient history THEN the system SHALL display all visits in reverse chronological order (newest first)
2. WHEN displaying a visit THEN the system SHALL show the visit date, chief complaint, and attending doctor
3. WHEN displaying a visit THEN the system SHALL show vital signs from triage if recorded
4. WHEN displaying a visit THEN the system SHALL show questioning findings if recorded
5. WHEN displaying a visit THEN the system SHALL show lab tests ordered and results if available
6. WHEN displaying a visit THEN the system SHALL show lab findings interpretation if recorded
7. WHEN displaying a visit THEN the system SHALL show final diagnosis and treatment plan
8. WHEN displaying a visit THEN the system SHALL show prescriptions issued
9. WHEN viewing history THEN the system SHALL allow filtering by date range
10. WHEN viewing history THEN the system SHALL allow searching by diagnosis or chief complaint
11. WHEN viewing history THEN the system SHALL provide an export option for printing or saving
12. WHEN a patient has no previous visits THEN the system SHALL display a message indicating this is their first visit

### Requirement 9: Protected Route Enhancement

**User Story:** As a system administrator, I want role-based access control enforced throughout the application, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. WHEN a user attempts to access a protected route THEN the system SHALL verify their authentication status
2. WHEN a user attempts to access a role-restricted route THEN the system SHALL verify their role matches allowed roles
3. WHEN an unauthenticated user attempts to access a protected route THEN the system SHALL redirect them to the login page
4. WHEN an authenticated user attempts to access a route they don't have permission for THEN the system SHALL redirect them to an unauthorized page
5. WHEN a user's session expires THEN the system SHALL redirect them to login and preserve their intended destination
6. WHEN a user logs in after being redirected THEN the system SHALL navigate them to their originally intended destination
7. WHEN navigation menus render THEN the system SHALL show only menu items the user has permission to access

### Requirement 10: Patient Card Number Management

**User Story:** As reception staff, I want to manage patient card numbers, so that we can update them when cards are reissued or corrected.

#### Acceptance Criteria

1. WHEN viewing patient details THEN the system SHALL display the current card number
2. WHEN editing patient information THEN the system SHALL allow updating the card number
3. WHEN a card number is changed THEN the system SHALL validate the new number is unique
4. WHEN a card number is changed THEN the system SHALL record the change in an audit log
5. WHEN a card number is changed THEN the system SHALL record who made the change and when
6. WHEN viewing patient history THEN the system SHALL show card number changes if any occurred
7. WHEN a duplicate card number is entered THEN the system SHALL display an error message with the conflicting patient's name

## Data Requirements

### Patient Model Updates
- Add `card_number` field (CharField, max_length=20, unique=True, null=True, blank=True)
- Add index on `card_number` for fast lookups
- Add `card_number_history` JSONField to track changes

### Visit Model Enhancements
- Ensure `vital_signs` JSONField includes all 7 measurements plus BMI
- Ensure `questioning_findings` TextField is properly utilized
- Add `triage_data_viewed_by_doctor` BooleanField to track if doctor reviewed triage data
- Add `lab_results_notification_sent` BooleanField to track notification status

### Prescription Model Enhancements
- Add `prescription_number` CharField for unique tracking
- Add `printed_at` DateTimeField to record print timestamp
- Add `printed_by` ForeignKey to User to record who printed it

## UI/UX Requirements

### Queue Component
- Implement responsive grid layout based on number of visible stages
- Add role-specific header showing user's role name
- Display patient count for user's relevant stages only
- Show urgent patient count if any exist in user's stages

### Triage Form
- Organize vital signs in a clear 2-column grid layout
- Add real-time BMI calculation display
- Show validation errors for each field
- Provide normal range hints for each vital sign
- Add triage notes textarea at the bottom

### Questioning Modal
- Display triage data in a prominent card at the top
- Highlight abnormal vital signs
- Provide large textarea for questioning findings
- Show character count for findings
- Require findings before allowing lab test ordering

### Lab Results Display
- Show "New Results" badge on patient cards
- Display results in a formatted, easy-to-read layout
- Provide textarea for doctor's interpretation
- Show which tests were ordered vs. which have results

### Prescription View/Print
- Create professional prescription template
- Include clinic logo and letterhead
- Format medications in a clear table
- Include all required legal information
- Provide print and download options

### Patient History View
- Create timeline-style layout for visits
- Use expandable cards for each visit
- Color-code by visit outcome (discharged, referred, etc.)
- Add search and filter controls
- Provide export to PDF option

## Performance Requirements

1. WHEN loading the queue THEN the system SHALL display within 2 seconds
2. WHEN filtering patients by role THEN the system SHALL complete filtering within 500ms
3. WHEN loading patient history THEN the system SHALL display within 3 seconds
4. WHEN printing a prescription THEN the system SHALL generate the document within 2 seconds
5. WHEN calculating BMI THEN the system SHALL update the display within 100ms

## Security Requirements

1. WHEN accessing any protected route THEN the system SHALL verify JWT token validity
2. WHEN a token expires THEN the system SHALL attempt to refresh it automatically
3. WHEN token refresh fails THEN the system SHALL redirect to login
4. WHEN viewing patient data THEN the system SHALL log the access for audit purposes
5. WHEN modifying patient data THEN the system SHALL record who made the change and when

## Accessibility Requirements

1. WHEN using the triage form THEN the system SHALL support keyboard navigation
2. WHEN displaying vital signs THEN the system SHALL use sufficient color contrast
3. WHEN showing error messages THEN the system SHALL provide clear, descriptive text
4. WHEN printing prescriptions THEN the system SHALL use readable font sizes (minimum 12pt)
5. WHEN viewing patient history THEN the system SHALL support screen readers

## Testing Requirements

1. WHEN implementing role-based filtering THEN the system SHALL be tested with each user role
2. WHEN implementing vital signs collection THEN the system SHALL validate all field types and ranges
3. WHEN implementing prescription printing THEN the system SHALL verify all required information is included
4. WHEN implementing patient history THEN the system SHALL test with patients having 0, 1, and multiple visits
5. WHEN implementing card number management THEN the system SHALL test uniqueness validation and error handling
