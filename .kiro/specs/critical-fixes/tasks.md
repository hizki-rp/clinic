# Implementation Plan: Critical System Fixes

## Task List

- [x] 1. Implement role-based queue filtering



  - Apply getRelevantStages function to filter displayed stages
  - Filter patients to show only those in relevant stages
  - Update patient count to reflect filtered patients
  - Update grid layout to adapt to number of visible stages
  - Test with each user role (reception, triage, doctor, lab, admin)





  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. Add patient card number system



  - [x] 2.1 Update Patient model with card_number field



    - Add card_number CharField (max_length=20, unique=True, null=True, blank=True)
    - Add card_number_history JSONField
    - Add database index on card_number
    - Create and run migration
    - _Requirements: 2.1, 2.3_
  
  - [x] 2.2 Update patient registration form

    - Add card number input field
    - Add validation for uniqueness
    - Handle duplicate card number errors gracefully
    - Make card number optional
    - _Requirements: 2.2, 2.4, 2.7_
  
  - [x] 2.3 Update patient search functionality

    - Add card number to search criteria
    - Update search API to support card number lookup
    - Display card number in search results
    - _Requirements: 2.4, 2.6_
  
  - [x] 2.4 Update patient display components

    - Show card number alongside patient ID
    - Display in patient cards in queue
    - Display in patient summary
    - _Requirements: 2.5_

- [x] 3. Complete vital signs collection in triage


  - [x] 3.1 Add missing vital sign fields to triage modal



    - Add respiratory rate input field
    - Add oxygen saturation input field
    - Update validation to require all 7 fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9_
  
  - [x] 3.2 Implement BMI calculation

    - Add BMI calculation function: weight / (height/100)²
    - Display calculated BMI in real-time
    - Store BMI in vital_signs JSON
    - _Requirements: 3.8_
  
  - [x] 3.3 Update vital signs data structure

    - Ensure backend accepts all 7 vital signs plus BMI
    - Update Visit model vital_signs JSON structure
    - Test data persistence
    - _Requirements: 3.10_

- [x] 4. Implement questioning findings capture

  - [x] 4.1 Add questioning findings modal

    - Display triage data at top of modal
    - Add textarea for questioning findings
    - Require findings before enabling lab test ordering
    - Save findings to visit record
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 4.2 Update questioning workflow

    - Modify questioning modal to show findings input first
    - Show lab test selection after findings entered
    - Record timestamp when findings saved
    - Record which doctor entered findings
    - _Requirements: 4.6, 4.7_

- [x] 5. Display triage data prominently for doctors

  - [x] 5.1 Create TriageDataCard component

    - Design highlighted card layout
    - Display all 7 vital signs with labels and units
    - Show calculated BMI
    - Show who performed triage and when
    - Show triage notes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.2 Integrate TriageDataCard in doctor views

    - Add to questioning modal
    - Add to discharge modal
    - Highlight abnormal values with warning colors
    - Show notice if triage was skipped
    - _Requirements: 5.6, 5.7_

- [x] 6. Implement lab results notification system

  - [x] 6.1 Add visual indicators for new results

    - Add badge count to Results by Doctor column header
    - Add "New Results" badge to patient cards
    - Sort patients by result wait time
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [x] 6.2 Enhance lab results display

    - Format results in easy-to-read layout
    - Show which tests were ordered
    - Show which tests have results
    - Provide textarea for doctor's interpretation
    - _Requirements: 6.5, 6.6, 6.7_

- [ ] 7. Implement prescription viewing and printing


  - [x] 7.1 Update Prescription model

    - Add prescription_number field with auto-generation
    - Add printed_at DateTimeField
    - Add printed_by ForeignKey to User
    - Create and run migration
    - _Requirements: 7.8, 7.9_
  
  - [x] 7.2 Create PrescriptionView component

    - Display all medications with dosage and frequency
    - Display treatment instructions
    - Display prescribing doctor and license number
    - Display prescription date and validity
    - Display prescription number
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 7.3 Create PrescriptionPrint component

    - Design professional template with clinic letterhead
    - Include patient name, ID, and date of birth
    - Include all medication details
    - Include doctor signature and license
    - Include unique prescription number
    - Add print functionality
    - _Requirements: 7.6, 7.7, 7.8_
  
  - [x] 7.4 Add prescription to patient history

    - Show all past prescriptions with dates
    - Link prescriptions to visits
    - Allow viewing historical prescriptions
    - _Requirements: 7.10_

- [ ] 8. Create comprehensive patient history view
  - [ ] 8.1 Create PatientHistory page component
    - Design timeline layout
    - Display visits in reverse chronological order
    - Show visit date, chief complaint, attending doctor
    - _Requirements: 8.1, 8.2_
  
  - [ ] 8.2 Create VisitCard component
    - Make cards expandable
    - Display vital signs from triage
    - Display questioning findings
    - Display lab tests and results
    - Display lab findings interpretation
    - Display diagnosis and treatment plan
    - Display prescriptions issued
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ] 8.3 Add search and filter functionality
    - Add date range filter
    - Add search by diagnosis or chief complaint
    - Add export to PDF option
    - Show message for patients with no visits
    - _Requirements: 8.9, 8.10, 8.11, 8.12_
  
  - [ ] 8.4 Create backend endpoint for patient history
    - Create /api/healthcare/patients/{id}/history/ endpoint
    - Return all visits with complete data
    - Include triage data, findings, labs, prescriptions
    - Optimize with select_related and prefetch_related
    - _Requirements: 8.1-8.12_

- [ ] 9. Enhance protected route access control
  - [ ] 9.1 Update ProtectedRoute component
    - Verify authentication status
    - Verify role matches allowed roles
    - Redirect unauthenticated users to login
    - Redirect unauthorized users to unauthorized page
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 9.2 Implement session management
    - Handle session expiration
    - Preserve intended destination on redirect
    - Navigate to intended destination after login
    - _Requirements: 9.5, 9.6_
  
  - [ ] 9.3 Update navigation menus
    - Show only menu items user has permission for
    - Hide restricted routes based on role
    - _Requirements: 9.7_

- [ ] 10. Implement card number management
  - [ ] 10.1 Create card number edit functionality
    - Display current card number in patient details
    - Allow editing card number
    - Validate uniqueness on update
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 10.2 Add card number audit logging
    - Record card number changes
    - Record who made the change and when
    - Display change history in patient view
    - _Requirements: 10.4, 10.5, 10.6_
  
  - [ ] 10.3 Handle duplicate card numbers
    - Show error message with conflicting patient name
    - Prevent saving duplicate card numbers
    - _Requirements: 10.7_

- [ ] 11. Final testing and validation
  - Test role-based queue filtering with all roles
  - Test complete vital signs collection and BMI calculation
  - Test questioning findings capture and display
  - Test triage data display for doctors
  - Test lab results notifications
  - Test prescription viewing and printing
  - Test patient history view with multiple visits
  - Test card number system including duplicates
  - Test protected routes with different roles
  - Verify all acceptance criteria met
  - _Requirements: All_

## Implementation Notes

### Priority Order
1. **Start with Task 1** (role-based filtering) - This is the most critical and affects user experience immediately
2. **Then Task 3** (vital signs) - Quick win, improves data quality
3. **Then Task 4** (questioning findings) - Fixes missing functionality
4. **Then remaining tasks** in order

### Testing Approach
- Test each task immediately after implementation
- Use the demo accounts to test different roles
- Verify data persistence in Django admin
- Check browser console for errors

### Database Migrations
- Run migrations after completing tasks 2.1, 7.1
- Backup database before running migrations
- Test migrations on development environment first

### Code Quality
- Follow existing code style and patterns
- Add comments for complex logic
- Keep components focused and reusable
- Handle errors gracefully with user-friendly messages

## Estimated Time
- Task 1: 1-2 hours
- Task 2: 3-4 hours
- Task 3: 2-3 hours
- Task 4: 2-3 hours
- Task 5: 2-3 hours
- Task 6: 2-3 hours
- Task 7: 4-5 hours
- Task 8: 5-6 hours
- Task 9: 2-3 hours
- Task 10: 2-3 hours
- Task 11: 2-3 hours

**Total: 27-38 hours** (approximately 1-2 weeks for one developer)
