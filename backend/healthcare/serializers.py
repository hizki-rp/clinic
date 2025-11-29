from rest_framework import serializers
from django.contrib.auth import get_user_model
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
            'id', 'user', 'patient_id', 'full_name', 'age', 'gender', 'phone', 'address',
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
    
    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'name', 'email', 'username', 'age', 'gender', 'phone', 'address',
            'medical_history', 'allergies', 'current_medications', 'emergency_contact_name',
            'emergency_contact_phone', 'insurance_provider', 'insurance_policy_number', 'priority'
        ]
    
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
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150, required=False)
    role = serializers.ChoiceField(choices=['reception', 'doctor', 'laboratory', 'staff'])
    
    class Meta:
        model = StaffProfile
        fields = [
            'first_name', 'last_name', 'email', 'username', 'role',
            'hire_date', 'employment_status', 'hourly_rate', 'department', 'supervisor'
        ]
    
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