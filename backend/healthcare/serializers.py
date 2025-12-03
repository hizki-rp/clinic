from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from datetime import datetime, timedelta
import re
from .models import (
    Patient, Visit, LabTest, Prescription, Medication, Appointment, MedicalRecord,
    MedicalHistory, Allergy, PatientMedication, StaffProfile, Shift, PayrollEntry, PerformanceReview
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role']


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'patient_id', 'card_number', 'full_name', 'age', 'gender', 'phone', 'address',
            'medical_history', 'allergies', 'current_medications', 'emergency_contact_name',
            'emergency_contact_phone', 'insurance_provider', 'insurance_policy_number',
            'priority', 'created_at', 'updated_at'
        ]
        read_only_fields = ['patient_id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()


class PatientCreateSerializer(serializers.ModelSerializer):
    # User fields - make them optional and handle different input formats
    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=30, required=False)
    name = serializers.CharField(max_length=100, required=False, write_only=True)  # Full name field
    email = serializers.EmailField(required=False)
    username = serializers.CharField(max_length=150, required=False)

    # Add validators for phone and age
    phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )
    age = serializers.IntegerField(
        required=False,
        allow_null=True,
        validators=[MinValueValidator(0), MaxValueValidator(150)]
    )
    
    # Card number field - optional, will be auto-generated if not provided
    card_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'name', 'email', 'username', 'age', 'gender', 'phone', 'address',
            'medical_history', 'allergies', 'current_medications', 'emergency_contact_name',
            'emergency_contact_phone', 'insurance_provider', 'insurance_policy_number', 'priority',
            'card_number'
        ]

    def validate_email(self, value):
        """Ensure email is unique across users"""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """Ensure username is unique"""
        if value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_phone(self, value):
        """Validate phone format, but allow blank/empty values"""
        if not value or value == '':
            return value
        # Only validate format if a value is provided
        if not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError(
                'Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.'
            )
        return value

    def validate_emergency_contact_phone(self, value):
        """Validate emergency contact phone format"""
        if value and not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError(
                'Emergency contact phone must be entered in the format: "+999999999". Up to 15 digits allowed.'
            )
        return value

    def validate_insurance_policy_number(self, value):
        """Validate insurance policy number format"""
        if value and len(value) < 5:
            raise serializers.ValidationError(
                'Insurance policy number must be at least 5 characters long.'
            )
        return value
    
    def validate_card_number(self, value):
        """Validate card number uniqueness"""
        if value and value.strip():
            # Check if card number already exists
            if Patient.objects.filter(card_number=value).exists():
                # Get the conflicting patient's name
                conflicting_patient = Patient.objects.get(card_number=value)
                raise serializers.ValidationError(
                    f'This card number is already assigned to {conflicting_patient.user.get_full_name()}.'
                )
        return value if value and value.strip() else None

    def validate(self, data):
        """Cross-field validation"""
        # Ensure minors (under 18) have emergency contact
        age = data.get('age')
        if age and age < 18:
            if not data.get('emergency_contact_name') or not data.get('emergency_contact_phone'):
                raise serializers.ValidationError({
                    'emergency_contact_name': 'Emergency contact is required for patients under 18 years old.',
                    'emergency_contact_phone': 'Emergency contact phone is required for patients under 18 years old.'
                })

        # If insurance provider is specified, policy number is required
        if data.get('insurance_provider') and not data.get('insurance_policy_number'):
            raise serializers.ValidationError({
                'insurance_policy_number': 'Insurance policy number is required when insurance provider is specified.'
            })

        return data
    
    def create(self, validated_data):
        # Handle different name input formats
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        full_name = validated_data.pop('name', '')
        
        # If full name is provided but first/last are not, split the full name
        if full_name and not (first_name and last_name):
            name_parts = full_name.strip().split(' ', 1)
            first_name = name_parts[0] if name_parts else 'Patient'
            last_name = name_parts[1] if len(name_parts) > 1 else 'User'
        
        # Ensure we have at least some name
        if not first_name:
            first_name = 'Patient'
        if not last_name:
            last_name = 'User'
        
        # Generate email and username if not provided
        email = validated_data.pop('email', f"{first_name.lower()}.{last_name.lower()}@clinic.local")
        username = validated_data.pop('username', f"{first_name.lower()}{last_name.lower()}{Patient.objects.count() + 1}")
        
        user_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'username': username,
            'role': 'patient'
        }
        
        # Create user
        user = User.objects.create_user(**user_data)
        
        # Create patient profile
        patient = Patient.objects.create(user=user, **validated_data)
        return patient
    
    def to_representation(self, instance):
        # Use the regular PatientSerializer for the response
        return PatientSerializer(instance).data


class LabTestSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)
    performed_by = UserSerializer(read_only=True)
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = LabTest
        fields = [
            'id', 'visit', 'test_name', 'test_type', 'status', 'requested_by', 'performed_by',
            'results', 'normal_range', 'interpretation', 'requested_at', 'completed_at',
            'patient_name'
        ]
        read_only_fields = ['requested_at', 'completed_at']

    def get_patient_name(self, obj):
        return obj.visit.patient.user.get_full_name()

    def validate_test_name(self, value):
        """Ensure test name is meaningful"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Test name must be at least 3 characters long.")
        return value

    def validate_test_type(self, value):
        """Validate test type against common lab tests"""
        valid_types = [
            'blood', 'urine', 'xray', 'mri', 'ct_scan', 'ultrasound',
            'ecg', 'biopsy', 'culture', 'pathology', 'other'
        ]
        if value and value.lower().replace(' ', '_') not in valid_types:
            # Allow any test type, but log a warning
            pass
        return value

    def validate(self, data):
        """Cross-field validation for lab tests"""
        status = data.get('status')
        results = data.get('results')

        # If status is completed, results must be provided
        if status == 'completed':
            if not results or len(results.strip()) < 5:
                raise serializers.ValidationError({
                    'results': 'Test results are required when marking a test as completed.',
                    'status': 'Cannot mark test as completed without results.'
                })

            # Ensure normal range is provided for completed tests
            if not data.get('normal_range'):
                raise serializers.ValidationError({
                    'normal_range': 'Normal range should be specified for completed tests.'
                })

        # If results are provided, status should not be 'requested'
        if results and status == 'requested':
            raise serializers.ValidationError({
                'status': 'Test status should be updated to "in_progress" or "completed" when results are entered.'
            })

        # Validate result format for specific test types
        test_type = data.get('test_type', '')
        if status == 'completed' and results:
            if test_type.lower() in ['blood', 'urine']:
                # Ensure numeric values or proper format
                if not any(char.isdigit() for char in results):
                    # Warning only, don't fail
                    pass

        return data


class PrescriptionSerializer(serializers.ModelSerializer):
    prescribed_by = UserSerializer(read_only=True)
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'visit', 'prescribed_by', 'medications', 'instructions', 'notes',
            'valid_until', 'is_dispensed', 'dispensed_at', 'dispensed_by',
            'created_at', 'updated_at', 'patient_name'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.visit.patient.user.get_full_name()


class VisitSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    attending_doctor = UserSerializer(read_only=True)
    triage_completed_by = UserSerializer(read_only=True)
    lab_tests = LabTestSerializer(many=True, read_only=True)
    prescription = PrescriptionSerializer(read_only=True)
    
    class Meta:
        model = Visit
        fields = [
            'id', 'patient', 'stage', 'check_in_time', 'discharge_time', 'chief_complaint',
            'symptoms', 'vital_signs', 'triage_notes', 'triage_completed_by', 'triage_completed_at',
            'questioning_findings', 'questioning_completed_at', 'lab_findings', 'lab_completed_at',
            'diagnosis', 'treatment_plan', 'final_findings', 'attending_doctor',
            'lab_tests', 'prescription', 'created_at', 'updated_at'
        ]
        read_only_fields = ['check_in_time', 'created_at', 'updated_at']


class VisitCreateSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField()
    
    class Meta:
        model = Visit
        fields = [
            'patient_id', 'chief_complaint', 'symptoms', 'vital_signs'
        ]
    
    def create(self, validated_data):
        patient_id = validated_data.pop('patient_id')
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            visit = Visit.objects.create(patient=patient, **validated_data)
            return visit
        except Patient.DoesNotExist:
            raise serializers.ValidationError(f"Patient with ID {patient_id} not found")


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = [
            'id', 'name', 'generic_name', 'strength', 'dosage_form', 'manufacturer',
            'stock_quantity', 'unit_price', 'is_active', 'requires_prescription',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AppointmentSerializer(serializers.ModelSerializer):
    patient_detail = PatientSerializer(source='patient', read_only=True)
    doctor_detail = UserSerializer(source='doctor', read_only=True)
    booked_by = UserSerializer(read_only=True)

    # Add writable fields for patient and doctor IDs
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    doctor = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='doctor'))

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_detail', 'doctor', 'doctor_detail', 'appointment_date',
            'duration_minutes', 'reason', 'notes', 'status', 'is_follow_up', 'previous_visit',
            'booked_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'patient_detail', 'doctor_detail']

    def validate_appointment_date(self, value):
        """Ensure appointment is not in the past"""
        if value < datetime.now():
            raise serializers.ValidationError(
                'Appointment date cannot be in the past.'
            )
        return value

    def validate_duration_minutes(self, value):
        """Ensure duration is reasonable"""
        if value < 15:
            raise serializers.ValidationError(
                'Appointment duration must be at least 15 minutes.'
            )
        if value > 480:  # 8 hours
            raise serializers.ValidationError(
                'Appointment duration cannot exceed 8 hours.'
            )
        return value

    def validate_reason(self, value):
        """Ensure reason is provided and meaningful"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError(
                'Appointment reason must be at least 5 characters long.'
            )
        return value

    def validate(self, data):
        """Prevent double-booking - check for overlapping appointments"""
        doctor = data.get('doctor')
        appointment_date = data.get('appointment_date')
        duration_minutes = data.get('duration_minutes', 30)

        if doctor and appointment_date:
            # Calculate appointment end time
            appointment_end = appointment_date + timedelta(minutes=duration_minutes)

            # Build query to check for overlapping appointments
            overlapping_query = Appointment.objects.filter(
                doctor=doctor,
                status__in=['scheduled', 'confirmed'],  # Only active appointments
            )

            # Exclude current appointment if updating
            if self.instance:
                overlapping_query = overlapping_query.exclude(pk=self.instance.pk)

            # Check each potentially overlapping appointment
            for existing_appt in overlapping_query:
                existing_end = existing_appt.appointment_date + timedelta(
                    minutes=existing_appt.duration_minutes
                )

                # Check if appointments overlap
                if (appointment_date < existing_end and
                    appointment_end > existing_appt.appointment_date):
                    raise serializers.ValidationError({
                        'appointment_date': f'This appointment overlaps with an existing appointment for Dr. {doctor.get_full_name()} at {existing_appt.appointment_date.strftime("%Y-%m-%d %H:%M")}.',
                        'doctor': 'This doctor is not available at the selected time.'
                    })

        return data


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'chronic_conditions', 'surgical_history', 'family_medical_history',
            'social_history', 'drug_allergies', 'food_allergies', 'environmental_allergies',
            'current_medications', 'immunization_record', 'blood_type', 'emergency_medical_info',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


# Simplified serializers for queue management
class QueuePatientSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    stage = serializers.CharField()
    checkInTime = serializers.DateTimeField(source='check_in_time')
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    sex = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    
    # Medical data from current visit
    vitalSigns = serializers.JSONField(source='vital_signs')
    triageNotes = serializers.CharField(source='triage_notes')
    questioningFindings = serializers.CharField(source='questioning_findings')
    labFindings = serializers.CharField(source='lab_findings')
    requestedLabTests = serializers.SerializerMethodField()
    labResults = serializers.SerializerMethodField()
    diagnosis = serializers.SerializerMethodField()
    prescription = serializers.SerializerMethodField()
    finalFindings = serializers.CharField(source='final_findings')
    
    class Meta:
        model = Visit
        fields = [
            'id', 'name', 'stage', 'checkInTime', 'email', 'phone', 'address', 'age', 'sex',
            'priority', 'vitalSigns', 'triageNotes', 'questioningFindings', 'labFindings',
            'requestedLabTests', 'labResults', 'diagnosis', 'prescription', 'finalFindings'
        ]
    
    def get_id(self, obj):
        return obj.patient.patient_id
    
    def get_name(self, obj):
        return obj.patient.user.get_full_name()
    
    def get_email(self, obj):
        return obj.patient.user.email
    
    def get_phone(self, obj):
        return obj.patient.phone
    
    def get_address(self, obj):
        return obj.patient.address
    
    def get_age(self, obj):
        return obj.patient.age
    
    def get_sex(self, obj):
        return obj.patient.gender
    
    def get_priority(self, obj):
        return obj.patient.priority.title()
    
    def get_requestedLabTests(self, obj):
        return [test.test_name for test in obj.lab_tests.all()]
    
    def get_labResults(self, obj):
        results = []
        for test in obj.lab_tests.filter(status='completed'):
            results.append(f"{test.test_name}: {test.results}")
        return "\n".join(results) if results else None
    
    def get_diagnosis(self, obj):
        return obj.diagnosis
    
    def get_prescription(self, obj):
        if hasattr(obj, 'prescription') and obj.prescription:
            medications = obj.prescription.medications
            if isinstance(medications, list):
                return "\n".join([f"{med.get('name', '')}, {med.get('dose', '')}, {med.get('frequency', '')}, {med.get('duration', '')}" for med in medications])
        return None


# EHR Serializers
class MedicalHistorySerializer(serializers.ModelSerializer):
    treating_doctor = UserSerializer(read_only=True)
    
    class Meta:
        model = MedicalHistory
        fields = '__all__'
        read_only_fields = ['created_at']


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = '__all__'
        read_only_fields = ['created_at']


class PatientMedicationSerializer(serializers.ModelSerializer):
    prescribed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = PatientMedication
        fields = '__all__'
        read_only_fields = ['created_at']


# Staff Management Serializers
class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    supervisor = serializers.SerializerMethodField()
    
    class Meta:
        model = StaffProfile
        fields = '__all__'
        read_only_fields = ['created_at']
    
    def get_supervisor(self, obj):
        if obj.supervisor:
            return obj.supervisor.user.get_full_name()
        return None


class StaffCreateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=30, required=True)
    last_name = serializers.CharField(max_length=30, required=True)
    email = serializers.EmailField(required=True)
    username = serializers.CharField(max_length=150, required=False)
    role = serializers.ChoiceField(choices=['reception', 'doctor', 'laboratory', 'staff'], required=True)

    # Add validators
    hourly_rate = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True,
        validators=[MinValueValidator(0.01)]
    )

    class Meta:
        model = StaffProfile
        fields = [
            'first_name', 'last_name', 'email', 'username', 'role',
            'hire_date', 'employment_status', 'hourly_rate', 'department', 'supervisor'
        ]

    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """Ensure username is unique"""
        if value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_hire_date(self, value):
        """Ensure hire date is not in the future"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Hire date cannot be in the future.")
        return value

    def validate_department(self, value):
        """Ensure department is specified"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Department must be specified and at least 2 characters long.")
        return value

    def validate(self, data):
        """Cross-field validation"""
        # Doctor role requires specific department validation
        role = data.get('role')
        department = data.get('department')

        if role == 'doctor' and department:
            valid_departments = ['cardiology', 'pediatrics', 'orthopedics', 'general', 'emergency', 'surgery']
            if department.lower() not in valid_departments:
                # Just a warning, don't fail validation
                pass

        # Ensure employment status is valid
        employment_status = data.get('employment_status', 'active')
        if employment_status not in ['active', 'on_leave', 'terminated']:
            raise serializers.ValidationError({
                'employment_status': 'Employment status must be one of: active, on_leave, terminated.'
            })

        return data
    
    def create(self, validated_data):
        # Extract user fields
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        role = validated_data.pop('role')
        username = validated_data.pop('username', f"{first_name.lower()}.{last_name.lower()}")
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        
        # Generate employee ID
        last_staff = StaffProfile.objects.order_by('-id').first()
        if last_staff:
            last_id = int(last_staff.employee_id.split('-')[1])
            employee_id = f"EMP-{str(last_id + 1).zfill(3)}"
        else:
            employee_id = "EMP-001"
        
        # Create staff profile
        staff = StaffProfile.objects.create(
            user=user,
            employee_id=employee_id,
            **validated_data
        )
        return staff
    
    def to_representation(self, instance):
        return StaffProfileSerializer(instance).data


class ShiftSerializer(serializers.ModelSerializer):
    staff = StaffProfileSerializer(read_only=True)
    duration_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Shift
        fields = '__all__'
        read_only_fields = ['created_at']
    
    def get_duration_hours(self, obj):
        return obj.duration_hours()


class PayrollEntrySerializer(serializers.ModelSerializer):
    staff = StaffProfileSerializer(read_only=True)
    
    class Meta:
        model = PayrollEntry
        fields = '__all__'
        read_only_fields = ['created_at', 'gross_pay', 'net_pay']


class PerformanceReviewSerializer(serializers.ModelSerializer):
    staff = StaffProfileSerializer(read_only=True)
    reviewer = UserSerializer(read_only=True)
    
    class Meta:
        model = PerformanceReview
        fields = '__all__'
        read_only_fields = ['created_at']