# Patient Workflow System

## Overview
The clinic uses a multi-phase workflow system to track patients from check-in to discharge. Each phase captures specific information and findings that become part of the patient's medical history.

## Workflow Phases

### 1. Waiting Room
**Who:** Reception staff
**Purpose:** Initial patient registration and check-in
**Actions:**
- Register patient
- Record chief complaint
- Assign to queue
- Move to Triage

### 2. Triage (NEW)
**Who:** Triage nurse or staff
**Purpose:** Collect vital signs and initial assessment
**Data Collected:**
- **Vital Signs:**
  - Blood Pressure (BP)
  - Temperature
  - Pulse/Heart Rate
  - Respiratory Rate
  - Oxygen Saturation (SpO2)
  - Height
  - Weight
  - BMI (calculated)
- **Triage Notes:** Initial observations and priority assessment

**Actions:**
- Record all vital signs
- Add triage notes
- Move to Questioning

### 3. Questioning
**Who:** Doctor
**Purpose:** Initial consultation and examination
**Data Collected:**
- **Questioning Findings:** Doctor's initial assessment, symptoms analysis, physical examination notes
- Patient history review
- Initial diagnostic impressions

**Actions:**
- Review triage data
- Conduct examination
- Record findings
- Decide if lab tests needed
- Move to Laboratory Test OR Results by Doctor (if no tests needed)

### 4. Laboratory Test
**Who:** Laboratory technician
**Purpose:** Conduct ordered tests
**Data Collected:**
- Test orders from doctor
- Test results
- Lab technician notes

**Actions:**
- Receive test orders
- Conduct tests
- Record results
- Move to Results by Doctor

### 5. Results by Doctor
**Who:** Doctor
**Purpose:** Review lab results and make final assessment
**Data Collected:**
- **Lab Findings:** Doctor's interpretation of lab results
- Correlation with initial findings
- Updated diagnostic impressions

**Actions:**
- Review lab results
- Update findings
- Prepare diagnosis and treatment plan
- Move to Discharged

### 6. Discharged
**Who:** Doctor
**Purpose:** Final diagnosis, treatment plan, and discharge
**Data Collected:**
- **Diagnosis:** Final medical diagnosis
- **Treatment Plan:** Prescribed treatment and follow-up instructions
- **Final Findings:** Complete summary of visit
- **Prescription:** Medications with dosage and duration

**Actions:**
- Record final diagnosis
- Create treatment plan
- Write prescription
- Discharge patient

## Data Storage & History

All findings from each phase are stored permanently in the Visit record:
- `vital_signs` (JSON) - From Triage
- `triage_notes` - From Triage
- `questioning_findings` - From Questioning
- `lab_findings` - From Results by Doctor
- `final_findings` - From Discharge
- `diagnosis` - Final diagnosis
- `treatment_plan` - Treatment instructions

This creates a complete medical history that doctors can review in future visits.

## User Roles & Permissions

### Reception
- Check-in patients
- View waiting room queue
- Move patients to Triage

### Triage Nurse/Staff
- Access Triage phase
- Record vital signs
- Add triage notes
- Move to Questioning

### Doctor
- Access Questioning phase
- Record questioning findings
- Order lab tests
- Review lab results
- Record lab findings
- Create diagnosis and treatment plan
- Write prescriptions
- Discharge patients

### Laboratory
- View lab test orders
- Record test results
- Mark tests as completed

## Workflow Example

**Patient: John Doe**

1. **Waiting Room** (Reception)
   - Chief Complaint: "Fever and cough for 3 days"
   - → Move to Triage

2. **Triage** (Nurse Emily)
   - BP: 120/80 mmHg
   - Temperature: 38.5°C
   - Pulse: 88 bpm
   - Height: 175 cm
   - Weight: 70 kg
   - Notes: "Patient appears fatigued, mild respiratory distress"
   - → Move to Questioning

3. **Questioning** (Dr. Smith)
   - Findings: "Patient presents with productive cough, fever for 3 days. Chest auscultation reveals crackles in lower right lung. Suspect pneumonia. Ordering chest X-ray and CBC."
   - → Move to Laboratory Test

4. **Laboratory Test** (Lab Tech Robert)
   - Tests: Chest X-ray, Complete Blood Count
   - Results: "X-ray shows infiltrate in right lower lobe. WBC elevated at 15,000"
   - → Move to Results by Doctor

5. **Results by Doctor** (Dr. Smith)
   - Lab Findings: "X-ray confirms right lower lobe pneumonia. Elevated WBC consistent with bacterial infection."
   - → Move to Discharged

6. **Discharged** (Dr. Smith)
   - Diagnosis: "Community-acquired pneumonia, right lower lobe"
   - Treatment Plan: "Antibiotics for 7 days, rest, fluids. Follow-up in 1 week."
   - Prescription: "Amoxicillin 500mg, 3 times daily, 7 days"
   - Final Findings: "Patient diagnosed with bacterial pneumonia. Started on antibiotics. Advised to return if symptoms worsen."

## Implementation Notes

### Database Schema
```python
Visit Model:
- stage: Current workflow phase
- vital_signs: JSON field for triage data
- triage_notes: Text field
- triage_completed_by: FK to User (staff)
- triage_completed_at: DateTime
- questioning_findings: Text field
- questioning_completed_at: DateTime
- lab_findings: Text field
- lab_completed_at: DateTime
- diagnosis: Text field
- treatment_plan: Text field
- final_findings: Text field
- discharge_time: DateTime
```

### API Endpoints
```
POST /api/healthcare/visits/{id}/move_to_stage/
Body: {
  "stage": "triage",
  "vitalSigns": {
    "bloodPressure": "120/80",
    "temperature": "37.5",
    "pulse": "75",
    "height": "175",
    "weight": "70"
  },
  "triageNotes": "Patient appears stable"
}
```

### Frontend Components
- **TriageForm**: For recording vital signs
- **QuestioningForm**: For doctor's initial findings
- **LabResultsForm**: For lab findings review
- **DischargeForm**: For final diagnosis and treatment

## Benefits

1. **Complete Medical History**: All findings stored permanently
2. **Clear Workflow**: Each role knows their responsibilities
3. **Better Care**: Doctors have all information from previous phases
4. **Audit Trail**: Track who did what and when
5. **Efficient**: Streamlined process reduces wait times
