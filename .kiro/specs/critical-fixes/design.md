# Design Document: Critical System Fixes

## Overview

This design document outlines the technical approach for implementing critical fixes to the clinic management system. The fixes focus on role-based access control, complete data capture, and comprehensive patient information management.

## Architecture

### System Components

```
Frontend (React/TypeScript)
├── Pages
│   ├── Queue.tsx (Enhanced with role filtering)
│   ├── PatientHistory.tsx (New)
│   └── PrescriptionView.tsx (New)
├── Components
│   ├── TriageForm.tsx (Enhanced)
│   ├── QuestioningModal.tsx (Enhanced)
│   ├── PrescriptionPrint.tsx (New)
│   └── PatientHistoryTimeline.tsx (New)
└── Context
    └── PatientQueueContext.tsx (Enhanced)

Backend (Django REST)
├── Models
│   ├── Patient (Enhanced with card_number)
│   ├── Visit (Enhanced with complete vital_signs)
│   └── Prescription (Enhanced with print tracking)
├── Serializers
│   ├── PatientSerializer (Enhanced)
│   ├── VisitDetailSerializer (New)
│   └── PrescriptionPrintSerializer (New)
└── Views
    ├── VisitViewSet (Enhanced)
    └── PrescriptionViewSet (Enhanced)
```

## Components and Interfaces

### 1. Role-Based Queue Filtering

**Frontend Implementation:**
- Location: `frontend/src/pages/Queue.tsx`
- Function: `getRelevantStages(userRole: string): QueueStage[]` (already exists)
- Apply filtering to `patients` array and `STAGES` display

**Changes Required:**
```typescript
// In ClinicQueueManager component
const { user } = useAuth();
const relevantStages = getRelevantStages(user?.role || '');
const relevantPatients = patients.filter(p => relevantStages.includes(p.stage));
```

### 2. Patient Card Number System

**Backend Changes:**
- Model: `backend/healthcare/models.py` - Patient model
- Add field: `card_number = models.CharField(max_length=20, unique=True, null=True, blank=True)`
- Add field: `card_number_history = models.JSONField(default=list, blank=True)`
- Add index for fast lookups

**Frontend Changes:**
- Update patient registration form to include card number input
- Update patient search to support card number lookup
- Display card number alongside patient ID

### 3. Complete Vital Signs Collection

**Frontend Changes:**
- Location: `frontend/src/pages/Queue.tsx` - Triage modal
- Add fields: `respiratoryRate`, `oxygenSaturation`
- Add BMI calculation: `BMI = weight / (height/100)²`

**Vital Signs Structure:**
```typescript
interface VitalSigns {
  height: string;          // cm
  weight: string;          // kg
  bloodPressure: string;   // mmHg (e.g., "120/80")
  temperature: string;     // °C
  pulse: string;           // bpm
  respiratoryRate: string; // breaths/min
  oxygenSaturation: string; // %
  bmi?: string;            // calculated
}
```

### 4. Questioning Findings Capture

**Frontend Changes:**
- Location: `frontend/src/pages/Queue.tsx` - Questioning modal
- Add textarea for `questioningFindings` before lab test selection
- Require findings before enabling "Send to Lab" button

**Backend Changes:**
- Ensure `questioning_findings` field is saved when moving to lab stage
- Add timestamp: `questioning_completed_at`

### 5. Prominent Triage Data Display

**Frontend Component:**
- Create `TriageDataCard` component
- Display in questioning and discharge modals
- Highlight abnormal values

**Display Format:**
```typescript
<div className="bg-blue-50 rounded-lg p-4 mb-4">
  <h4>Triage Data</h4>
  <div className="grid grid-cols-2 gap-2">
    <div>Height: {vitalSigns.height} cm</div>
    <div>Weight: {vitalSigns.weight} kg</div>
    <div>BP: {vitalSigns.bloodPressure}</div>
    <div>Temp: {vitalSigns.temperature}°C</div>
    <div>Pulse: {vitalSigns.pulse} bpm</div>
    <div>RR: {vitalSigns.respiratoryRate}/min</div>
    <div>SpO2: {vitalSigns.oxygenSaturation}%</div>
    <div>BMI: {vitalSigns.bmi}</div>
  </div>
  <div className="mt-2">
    <strong>Notes:</strong> {triageNotes}
  </div>
</div>
```

### 6. Lab Results Notification

**Frontend Changes:**
- Add badge count to "Results by Doctor" column header
- Add "New Results" badge to patient cards in that stage
- Sort patients by result wait time

**Implementation:**
```typescript
// In QueueColumn component
<Badge variant="secondary" className="font-bold">
  {patients.length}
  {stage === 'Results by Doctor' && patients.length > 0 && (
    <span className="ml-1 text-red-600">●</span>
  )}
</Badge>
```

### 7. Prescription Viewing and Printing

**New Component:** `frontend/src/components/PrescriptionPrint.tsx`

**Features:**
- Professional template with clinic letterhead
- Patient information section
- Medications table
- Doctor signature and license
- Prescription number
- Print functionality

**Backend Changes:**
- Add `prescription_number` field (auto-generated: RX-001, RX-002, etc.)
- Add `printed_at` and `printed_by` fields
- Create print endpoint: `/api/healthcare/prescriptions/{id}/print/`

### 8. Patient History View

**New Page:** `frontend/src/pages/PatientHistory.tsx`

**Features:**
- Timeline layout showing all visits
- Expandable visit cards
- Display all visit data: triage, findings, labs, diagnosis, prescriptions
- Search and filter by date range
- Export to PDF

**Backend Endpoint:**
- `/api/healthcare/patients/{id}/history/` - Returns all visits with complete data

**Serializer:**
```python
class VisitHistorySerializer(serializers.ModelSerializer):
    triage_data = serializers.SerializerMethodField()
    lab_tests = LabTestSerializer(many=True, read_only=True)
    prescription = PrescriptionSerializer(read_only=True)
    
    class Meta:
        model = Visit
        fields = '__all__'
```

## Data Models

### Patient Model Updates

```python
class Patient(models.Model):
    # Existing fields...
    
    # New fields
    card_number = models.CharField(
        max_length=20, 
        unique=True, 
        null=True, 
        blank=True,
        help_text="Physical card number for patient identification"
    )
    card_number_history = models.JSONField(
        default=list, 
        blank=True,
        help_text="History of card number changes"
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['card_number']),
        ]
```

### Visit Model - Vital Signs Structure

```python
# vital_signs JSONField structure
{
    "height": "175",
    "weight": "70",
    "bloodPressure": "120/80",
    "temperature": "37.5",
    "pulse": "75",
    "respiratoryRate": "16",
    "oxygenSaturation": "98",
    "bmi": "22.9"
}
```

### Prescription Model Updates

```python
class Prescription(models.Model):
    # Existing fields...
    
    # New fields
    prescription_number = models.CharField(
        max_length=20, 
        unique=True,
        help_text="Unique prescription identifier (RX-001, RX-002, etc.)"
    )
    printed_at = models.DateTimeField(null=True, blank=True)
    printed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='printed_prescriptions'
    )
    
    def save(self, *args, **kwargs):
        if not self.prescription_number:
            last_rx = Prescription.objects.order_by('-id').first()
            if last_rx and last_rx.prescription_number:
                last_num = int(last_rx.prescription_number.split('-')[1])
                self.prescription_number = f"RX-{str(last_num + 1).zfill(3)}"
            else:
                self.prescription_number = "RX-001"
        super().save(*args, **kwargs)
```

## Error Handling

### Frontend Error Handling

1. **Queue Filtering Errors:**
   - If user role is undefined, default to empty array (no stages shown)
   - Log error to console for debugging

2. **Vital Signs Validation:**
   - Validate numeric fields are within reasonable ranges
   - Show inline error messages for invalid inputs
   - Prevent form submission until all fields valid

3. **Card Number Conflicts:**
   - Catch unique constraint errors from backend
   - Display user-friendly message with conflicting patient name
   - Allow user to correct the entry

4. **Prescription Print Errors:**
   - Handle missing data gracefully
   - Show error message if print fails
   - Log error details for debugging

### Backend Error Handling

1. **Card Number Uniqueness:**
   - Return 400 Bad Request with clear error message
   - Include conflicting patient information in response

2. **Missing Required Data:**
   - Validate all required fields before saving
   - Return 400 with field-specific error messages

3. **Permission Errors:**
   - Return 403 Forbidden for unauthorized access
   - Log security events for audit

## Testing Strategy

### Unit Tests

1. **Role Filtering Logic:**
   - Test `getRelevantStages()` with each role
   - Verify correct stages returned for each role

2. **BMI Calculation:**
   - Test with various height/weight combinations
   - Verify correct formula application
   - Test edge cases (very tall, very short, etc.)

3. **Card Number Validation:**
   - Test uniqueness constraint
   - Test null/blank handling
   - Test search functionality

4. **Prescription Number Generation:**
   - Test sequential generation
   - Test with no existing prescriptions
   - Test concurrent creation

### Integration Tests

1. **Queue Filtering:**
   - Login as each role
   - Verify only relevant stages visible
   - Verify patient count accuracy

2. **Triage Flow:**
   - Complete triage with all vital signs
   - Verify data saved correctly
   - Verify BMI calculated
   - Verify data displayed to doctor

3. **Questioning Flow:**
   - Enter questioning findings
   - Order lab tests
   - Verify findings saved
   - Verify tests created

4. **Prescription Flow:**
   - Create prescription
   - Verify prescription number generated
   - Print prescription
   - Verify print timestamp recorded

5. **Patient History:**
   - Create multiple visits for a patient
   - View history
   - Verify all data displayed correctly
   - Test filtering and search

### Manual Testing Checklist

- [ ] Login as reception - verify sees only Waiting Room
- [ ] Login as triage - verify sees only Triage
- [ ] Login as doctor - verify sees Questioning and Results
- [ ] Login as lab - verify sees only Lab Test
- [ ] Login as admin - verify sees all stages
- [ ] Register patient with card number
- [ ] Search patient by card number
- [ ] Complete triage with all 7 vital signs
- [ ] Verify BMI calculated correctly
- [ ] Enter questioning findings as doctor
- [ ] Verify triage data displayed prominently
- [ ] Order lab tests
- [ ] Enter lab results
- [ ] Verify "New Results" indicator shows
- [ ] Review results and discharge
- [ ] View and print prescription
- [ ] View patient history
- [ ] Verify all visit data displayed

## Performance Considerations

1. **Queue Filtering:**
   - Filter on frontend (already loaded data)
   - No additional API calls needed
   - Instant response

2. **Patient Search:**
   - Add database index on card_number
   - Use efficient query with Q objects
   - Limit results to 50 for performance

3. **Patient History:**
   - Use select_related and prefetch_related
   - Paginate results (20 visits per page)
   - Lazy load visit details on expand

4. **Prescription Printing:**
   - Generate PDF on backend
   - Cache generated PDFs for 24 hours
   - Use async task for large prescriptions

## Security Considerations

1. **Role-Based Access:**
   - Verify role on every protected route
   - Check permissions on backend endpoints
   - Log unauthorized access attempts

2. **Data Privacy:**
   - Encrypt sensitive patient data at rest
   - Use HTTPS for all communications
   - Audit log all data access

3. **Prescription Security:**
   - Include verification QR code
   - Track all prints with timestamp and user
   - Prevent unauthorized modifications

## Deployment Considerations

1. **Database Migration:**
   - Create migration for Patient.card_number
   - Create migration for Prescription.prescription_number
   - Add indexes
   - No data loss expected

2. **Frontend Deployment:**
   - No breaking changes
   - Backward compatible
   - Can deploy independently

3. **Rollback Plan:**
   - Keep previous version available
   - Database migrations are reversible
   - Feature flags for gradual rollout

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. Role-based queue filtering
2. Complete vital signs collection
3. Questioning findings capture

### Phase 2: High Priority (Week 2)
4. Patient card number system
5. Prominent triage data display
6. Lab results notification

### Phase 3: Medium Priority (Week 3)
7. Prescription viewing and printing
8. Patient history view
9. Enhanced access control

## Success Criteria

1. ✅ All roles see only their relevant queue stages
2. ✅ All 7 vital signs captured in triage
3. ✅ Doctors can enter questioning findings
4. ✅ Triage data displayed prominently to doctors
5. ✅ Lab results have visual indicators
6. ✅ Prescriptions can be viewed and printed
7. ✅ Complete patient history accessible
8. ✅ Card numbers support long-term patient management
9. ✅ All tests passing
10. ✅ No performance degradation
