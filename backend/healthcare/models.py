from django.db import models
from django.conf import settings
from django.utils import timezone


class Patient(models.Model):
    PRIORITY_CHOICES = [
        ('standard', 'Standard'),
        ('urgent', 'Urgent'),
    ]
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    # Link to User model for authentication
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_profile')
    
    # Patient identification
    patient_id = models.CharField(max_length=20, unique=True)
    
    # Personal information
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    # Medical information
    medical_history = models.TextField(null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    current_medications = models.TextField(null=True, blank=True)
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)
    
    # Insurance information
    insurance_provider = models.CharField(max_length=100, null=True, blank=True)
    insurance_policy_number = models.CharField(max_length=50, null=True, blank=True)
    
    # Priority level
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='standard')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.patient_id})"
    
    def save(self, *args, **kwargs):
        if not self.patient_id:
            # Generate patient ID
            last_patient = Patient.objects.order_by('-id').first()
            if last_patient:
                last_id = int(last_patient.patient_id.split('-')[1])
                self.patient_id = f"P-{str(last_id + 1).zfill(3)}"
            else:
                self.patient_id = "P-001"
        super().save(*args, **kwargs)


class Visit(models.Model):
    STAGE_CHOICES = [
        ('waiting_room', 'Waiting Room'),
        ('triage', 'Triage'),  # New triage phase
        ('questioning', 'Questioning'),
        ('laboratory_test', 'Laboratory Test'),
        ('results_by_doctor', 'Results by Doctor'),
        ('discharged', 'Discharged'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='waiting_room')
    check_in_time = models.DateTimeField(default=timezone.now)
    discharge_time = models.DateTimeField(null=True, blank=True)
    
    # Visit details
    chief_complaint = models.TextField(null=True, blank=True)
    symptoms = models.TextField(null=True, blank=True)
    
    # Triage Phase - Vital signs and initial assessment
    vital_signs = models.JSONField(default=dict, blank=True)  # BP, temp, pulse, height, weight, etc.
    triage_notes = models.TextField(null=True, blank=True)
    triage_completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='triage_visits',
        limit_choices_to={'role': 'staff'}
    )
    triage_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Questioning Phase - Doctor's initial findings
    questioning_findings = models.TextField(null=True, blank=True)
    questioning_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Laboratory Phase - Test results and findings
    lab_findings = models.TextField(null=True, blank=True)
    lab_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Final Assessment - Doctor's diagnosis and treatment
    diagnosis = models.TextField(null=True, blank=True)
    treatment_plan = models.TextField(null=True, blank=True)
    final_findings = models.TextField(null=True, blank=True)
    
    # Staff assignments
    attending_doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='doctor_visits',
        limit_choices_to={'role': 'doctor'}
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.check_in_time.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['-check_in_time']


class LabTest(models.Model):
    TEST_STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='lab_tests')
    test_name = models.CharField(max_length=200)
    test_type = models.CharField(max_length=100)  # CBC, Urinalysis, etc.
    status = models.CharField(max_length=15, choices=TEST_STATUS_CHOICES, default='requested')
    
    # Test details
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='requested_tests',
        limit_choices_to={'role': 'doctor'}
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='performed_tests',
        limit_choices_to={'role': 'laboratory'}
    )
    
    # Results
    results = models.TextField(null=True, blank=True)
    normal_range = models.CharField(max_length=200, null=True, blank=True)
    interpretation = models.TextField(null=True, blank=True)
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.test_name} - {self.visit.patient.user.get_full_name()}"
    
    class Meta:
        ordering = ['-requested_at']


class Prescription(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='prescription')
    prescribed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='prescriptions',
        limit_choices_to={'role': 'doctor'}
    )
    
    # Prescription details
    medications = models.JSONField(default=list)  # List of medication objects
    instructions = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    # Validity
    valid_until = models.DateField(null=True, blank=True)
    is_dispensed = models.BooleanField(default=False)
    dispensed_at = models.DateTimeField(null=True, blank=True)
    dispensed_by = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Prescription for {self.visit.patient.user.get_full_name()} - {self.created_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-created_at']


class Medication(models.Model):
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, null=True, blank=True)
    strength = models.CharField(max_length=50)  # e.g., "500mg", "10ml"
    dosage_form = models.CharField(max_length=50)  # tablet, capsule, syrup, etc.
    manufacturer = models.CharField(max_length=100, null=True, blank=True)
    
    # Inventory
    stock_quantity = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    requires_prescription = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} {self.strength}"
    
    class Meta:
        ordering = ['name']


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_appointments',
        limit_choices_to={'role': 'doctor'}
    )
    
    # Appointment details
    appointment_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    reason = models.CharField(max_length=200)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    
    # Follow-up
    is_follow_up = models.BooleanField(default=False)
    previous_visit = models.ForeignKey(Visit, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Booking details
    booked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='booked_appointments'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.appointment_date.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['appointment_date']


class MedicalRecord(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='medical_record')
    
    # Medical history
    chronic_conditions = models.TextField(null=True, blank=True)
    surgical_history = models.TextField(null=True, blank=True)
    family_medical_history = models.TextField(null=True, blank=True)
    social_history = models.TextField(null=True, blank=True)  # smoking, alcohol, etc.
    
    # Allergies and reactions
    drug_allergies = models.TextField(null=True, blank=True)
    food_allergies = models.TextField(null=True, blank=True)
    environmental_allergies = models.TextField(null=True, blank=True)
    
    # Current status
    current_medications = models.TextField(null=True, blank=True)
    immunization_record = models.TextField(null=True, blank=True)
    
    # Emergency information
    blood_type = models.CharField(max_length=5, null=True, blank=True)
    emergency_medical_info = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Medical Record - {self.patient.user.get_full_name()}"


# EHR Models
class MedicalHistory(models.Model):
    CONDITION_TYPES = [
        ('chronic', 'Chronic Condition'),
        ('acute', 'Acute Condition'),
        ('surgery', 'Surgery'),
        ('injury', 'Injury'),
        ('allergy', 'Allergy'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_histories')
    condition_type = models.CharField(max_length=20, choices=CONDITION_TYPES)
    condition_name = models.CharField(max_length=200)
    diagnosis_date = models.DateField()
    description = models.TextField(blank=True)
    treating_doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-diagnosis_date']
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.condition_name}"


class Allergy(models.Model):
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('life_threatening', 'Life Threatening'),
    ]
    
    ALLERGY_TYPES = [
        ('drug', 'Drug'),
        ('food', 'Food'),
        ('environmental', 'Environmental'),
        ('other', 'Other'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_allergies')
    allergen = models.CharField(max_length=200)
    allergy_type = models.CharField(max_length=20, choices=ALLERGY_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    reaction = models.TextField()
    diagnosed_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-severity', '-diagnosed_date']
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.allergen} ({self.severity})"


class PatientMedication(models.Model):
    FREQUENCY_CHOICES = [
        ('once_daily', 'Once Daily'),
        ('twice_daily', 'Twice Daily'),
        ('three_times_daily', 'Three Times Daily'),
        ('four_times_daily', 'Four Times Daily'),
        ('as_needed', 'As Needed'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_medications')
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    prescribed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.medication_name}"


# Staff Management Models
class StaffProfile(models.Model):
    EMPLOYMENT_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('terminated', 'Terminated'),
        ('on_leave', 'On Leave'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    hire_date = models.DateField()
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='active')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    department = models.CharField(max_length=100)
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.employee_id}"


class Shift(models.Model):
    SHIFT_STATUS = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name='shifts')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=SHIFT_STATUS, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_time']
    
    def duration_hours(self):
        return (self.end_time - self.start_time).total_seconds() / 3600
    
    def __str__(self):
        return f"{self.staff.user.get_full_name()} - {self.start_time.date()}"


class PayrollEntry(models.Model):
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name='payroll_entries')
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    total_hours = models.DecimalField(max_digits=8, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-pay_period_end']
    
    def save(self, *args, **kwargs):
        self.gross_pay = self.total_hours * self.hourly_rate
        self.net_pay = self.gross_pay - self.deductions
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.staff.user.get_full_name()} - {self.pay_period_start} to {self.pay_period_end}"


class PerformanceReview(models.Model):
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Below Average'),
        (3, 'Average'),
        (4, 'Above Average'),
        (5, 'Excellent'),
    ]
    
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    overall_rating = models.IntegerField(choices=RATING_CHOICES)
    strengths = models.TextField()
    areas_for_improvement = models.TextField()
    goals = models.TextField(blank=True)
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-review_period_end']
    
    def __str__(self):
        return f"{self.staff.user.get_full_name()} - {self.review_period_end} (Rating: {self.overall_rating})"