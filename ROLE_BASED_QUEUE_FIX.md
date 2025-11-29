# Role-Based Queue System - Separation of Concerns

## Problem
Currently, all roles see the same queue view, which is confusing and inefficient. Each role should only see patients relevant to their workflow stage.

## Solution: Role-Based Queue Filtering

### Reception View
**Sees:** Patients in "Waiting Room" and "Triage"
**Actions:**
- Check-in new patients
- Move patients to Triage
- View patient demographics

### Triage Nurse View
**Sees:** Patients in "Triage" stage only
**Actions:**
- Record vital signs
- Add triage notes
- Move to Questioning

### Doctor View
**Sees:** Patients in "Questioning" and "Results by Doctor" stages
**Actions:**
- Add questioning findings
- Order lab tests
- Review lab results
- Add lab findings
- Discharge patients

### Laboratory View
**Sees:** Patients in "Laboratory Test" stage only
**Actions:**
- View test orders
- Enter test results
- Mark tests complete
- Move to Results by Doctor

## Implementation

### Backend - Already Implemented ✅
The backend Visit model supports all stages:
- waiting_room
- triage
- questioning
- laboratory_test
- results_by_doctor
- discharged

### Frontend - Needs Update

#### 1. Update Queue Component
Add role-based filtering:

```typescript
const getRelevantStages = (userRole: string): QueueStage[] => {
  switch(userRole) {
    case 'reception':
      return ['Waiting Room', 'Triage'];
    case 'staff': // Triage nurse
      return ['Triage'];
    case 'doctor':
      return ['Questioning', 'Results by Doctor'];
    case 'laboratory':
      return ['Laboratory Test'];
    default:
      return [];
  }
};

// Filter patients based on user role
const relevantStages = getRelevantStages(user.role);
const filteredPatients = allPatients.filter(p => 
  relevantStages.includes(p.stage)
);
```

#### 2. Update Stage Transitions
Each role can only move patients to specific next stages:

**Reception:**
- Waiting Room → Triage

**Triage:**
- Triage → Questioning

**Doctor:**
- Questioning → Laboratory Test (if tests needed)
- Questioning → Discharged (if no tests needed)
- Results by Doctor → Discharged

**Laboratory:**
- Laboratory Test → Results by Doctor

## Benefits

1. **Clarity**: Each role sees only relevant patients
2. **Efficiency**: No confusion about which patients to handle
3. **Security**: Roles can't interfere with other stages
4. **Workflow**: Clear progression through stages
5. **Scalability**: Easy to add new roles/stages

## Updated Workflow

```
Reception → Triage → Doctor → Lab → Doctor → Discharge
   ↓          ↓        ↓       ↓      ↓         ↓
Waiting    Vitals  Findings  Tests  Review  Complete
  Room      Signs
```

## Queue Dashboard Views

### Reception Dashboard
- Total patients checked in today
- Patients in waiting room
- Patients in triage
- Average wait time

### Triage Dashboard
- Patients awaiting triage
- Average triage time
- Urgent patients flagged

### Doctor Dashboard
- Patients awaiting consultation
- Patients with lab results ready
- Today's consultations completed

### Laboratory Dashboard
- Pending test orders
- Tests in progress
- Completed tests today
- Urgent tests flagged
