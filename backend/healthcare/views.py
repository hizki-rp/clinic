from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import (
    Patient, Visit, LabTest, Prescription, Medication, Appointment, MedicalRecord,
    MedicalHistory, Allergy, PatientMedication, StaffProfile, Shift, PayrollEntry, PerformanceReview
)
from .serializers import (
    PatientSerializer, PatientCreateSerializer, VisitSerializer, VisitCreateSerializer,
    LabTestSerializer, PrescriptionSerializer, MedicationSerializer,
    AppointmentSerializer, MedicalRecordSerializer, QueuePatientSerializer,
    MedicalHistorySerializer, AllergySerializer, PatientMedicationSerializer,
    StaffProfileSerializer, StaffCreateSerializer, ShiftSerializer, PayrollEntrySerializer, PerformanceReviewSerializer
)
from authentication.permissions import IsStaffMember, IsDoctor, IsLaboratory

User = get_user_model()


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]  # Allow authenticated users, filter in get_queryset
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['gender', 'priority']
    search_fields = ['user__first_name', 'user__last_name', 'patient_id', 'phone']
    ordering_fields = ['created_at', 'user__first_name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        if user.is_staff_member:
            # Staff can see all patients
            return Patient.objects.all()
        elif user.is_patient:
            # Patients can only see themselves
            return Patient.objects.filter(user=user)
        return Patient.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return PatientCreateSerializer
        return PatientSerializer
    
    def update(self, request, *args, **kwargs):
        """Custom update to handle nested user updates"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Make a mutable copy of request data
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Extract user data if provided
        user_data = data.pop('user', None)
        
        # Update patient fields
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Update user fields if provided
        if user_data and instance.user:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'email' in user_data:
                user.email = user_data['email']
            user.save()
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def medical_record(self, request, pk=None):
        patient = self.get_object()
        medical_record, created = MedicalRecord.objects.get_or_create(patient=patient)
        serializer = MedicalRecordSerializer(medical_record)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def visits(self, request, pk=None):
        patient = self.get_object()
        visits = patient.visits.all()
        serializer = VisitSerializer(visits, many=True)
        return Response(serializer.data)


class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]  # Authenticated users with filtered access
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['stage', 'patient__priority']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'patient__patient_id']
    ordering_fields = ['check_in_time', 'updated_at']
    ordering = ['-check_in_time']

    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        if user.is_staff_member:
            # Staff can see all visits
            return Visit.objects.all()
        elif user.is_patient:
            # Patients can only see their own visits
            try:
                patient = Patient.objects.get(user=user)
                return Visit.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return Visit.objects.none()
        return Visit.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return VisitCreateSerializer
        return VisitSerializer
    
    @action(detail=True, methods=['post'])
    def move_to_stage(self, request, pk=None):
        visit = self.get_object()
        new_stage = request.data.get('stage')
        user = request.user

        if new_stage not in dict(Visit.STAGE_CHOICES):
            return Response(
                {'error': 'Invalid stage'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # All authenticated staff can move patients through stages (queue coordination)
        # But only specific roles can add medical data during transitions

        visit.stage = new_stage

        # Handle Triage data - can be added when completing triage (moving FROM triage stage)
        if 'vitalSigns' in request.data or 'triageNotes' in request.data:
            allowed_roles = ['triage', 'nurse', 'doctor', 'staff', 'admin']
            if user.role not in allowed_roles:
                return Response(
                    {'error': f'Only {", ".join(allowed_roles)} staff can add vital signs and triage notes. Your role: {user.role}'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # User has permission to add medical data
            if 'vitalSigns' in request.data:
                import json
                vital_signs_data = request.data['vitalSigns']
                # If it's a string, parse it as JSON; otherwise use it directly
                if isinstance(vital_signs_data, str):
                    try:
                        visit.vital_signs = json.loads(vital_signs_data)
                    except json.JSONDecodeError:
                        # If parsing fails, store as-is for backward compatibility
                        visit.vital_signs = vital_signs_data
                else:
                    visit.vital_signs = vital_signs_data
            if 'triageNotes' in request.data:
                visit.triage_notes = request.data['triageNotes']
            visit.triage_completed_by = user
            visit.triage_completed_at = timezone.now()

        # Handle Questioning phase - ONLY doctors can add consultation findings
        if new_stage == 'questioning':
            # Check if user is trying to add medical data
            if 'questioningFindings' in request.data:
                if not (user.is_doctor or user.is_admin):
                    return Response(
                        {'error': 'Only doctors can add consultation findings'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                # User has permission to add medical data
                visit.questioning_findings = request.data['questioningFindings']
                visit.questioning_completed_at = timezone.now()
                visit.attending_doctor = user

        # Handle Laboratory phase - ONLY doctors can REQUEST lab tests
        if new_stage == 'laboratory_test':
            # Save questioning findings if provided
            if 'questioningFindings' in request.data:
                if not (user.is_doctor or user.is_admin):
                    return Response(
                        {'error': 'Only doctors can add consultation findings'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                visit.questioning_findings = request.data['questioningFindings']
                visit.questioning_completed_at = timezone.now()
                visit.attending_doctor = user
            
            if 'requestedLabTests' in request.data:
                if not (user.is_doctor or user.is_admin):
                    return Response(
                        {'error': 'Only doctors can request lab tests'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                requested_tests = request.data['requestedLabTests']
                for test_name in requested_tests:
                    LabTest.objects.create(
                        visit=visit,
                        test_name=test_name,
                        test_type=test_name,
                        requested_by=user
                    )
        
        # Handle Results by Doctor phase - ONLY doctors can add lab findings
        if new_stage == 'results_by_doctor':
            # Save questioning findings if provided (for cases where lab was skipped)
            if 'questioningFindings' in request.data:
                if not (user.is_doctor or user.is_admin):
                    return Response(
                        {'error': 'Only doctors can add consultation findings'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                visit.questioning_findings = request.data['questioningFindings']
                visit.questioning_completed_at = timezone.now()
                visit.attending_doctor = user
            
            # Check if user is trying to add medical data
            if 'labFindings' in request.data:
                if not (user.is_doctor or user.is_admin):
                    return Response(
                        {'error': 'Only doctors can add lab findings and interpretations'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                # User has permission to add medical data
                visit.lab_findings = request.data['labFindings']
                visit.lab_completed_at = timezone.now()

            # Note: Lab tests are marked as completed by laboratory staff in LabTestViewSet
            # Doctors only review and interpret results here

        # Handle Discharge phase - ONLY doctors can add diagnosis/treatment/prescriptions
        if new_stage == 'discharged':
            visit.discharge_time = timezone.now()

            # Check if user is trying to add medical data (diagnosis, treatment, prescriptions)
            if 'diagnosis' in request.data or 'treatment_plan' in request.data or 'finalFindings' in request.data or 'prescription' in request.data:
                if not (user.is_doctor or user.is_admin):
                    return Response(
                        {'error': 'Only doctors can add diagnosis, treatment plans, and prescriptions'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                # User has permission to add medical data
                if 'diagnosis' in request.data:
                    visit.diagnosis = request.data['diagnosis']
                if 'treatment_plan' in request.data:
                    visit.treatment_plan = request.data['treatment_plan']
                if 'finalFindings' in request.data:
                    visit.final_findings = request.data['finalFindings']

            # Handle prescription - ONLY doctors
            if 'prescription' in request.data:
                prescription_text = request.data['prescription']
                medications = []
                for line in prescription_text.split('\n'):
                    if line.strip():
                        parts = [part.strip() for part in line.split(',')]
                        if len(parts) >= 4:
                            medications.append({
                                'name': parts[0],
                                'dose': parts[1],
                                'frequency': parts[2],
                                'duration': parts[3]
                            })

                prescription, created = Prescription.objects.get_or_create(
                    visit=visit,
                    defaults={
                        'prescribed_by': user,
                        'medications': medications
                    }
                )
                if not created:
                    prescription.medications = medications
                    prescription.save()
        
        visit.save()
        serializer = self.get_serializer(visit)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def queue(self, request):
        """Get current patient queue for the clinic management system"""
        active_visits = Visit.objects.filter(stage__in=[
            'waiting_room', 'triage', 'questioning', 'laboratory_test', 'results_by_doctor'
        ]).select_related(
            'patient__user', 
            'attending_doctor',
            'triage_completed_by'
        ).prefetch_related(
            'lab_tests',
            'prescription'
        ).order_by('check_in_time')
        
        serializer = QueuePatientSerializer(active_visits, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_patients(self, request):
        """Get all patients including discharged ones for admin dashboard"""
        all_visits = Visit.objects.all().select_related(
            'patient__user', 
            'attending_doctor',
            'triage_completed_by'
        ).prefetch_related(
            'lab_tests',
            'prescription'
        ).order_by('-check_in_time')
        
        serializer = QueuePatientSerializer(all_visits, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        from django.db.models import Count
        
        stats = {
            'total_patients': Patient.objects.count(),
            'active_visits': Visit.objects.filter(stage__in=['waiting_room', 'questioning', 'laboratory_test', 'results_by_doctor']).count(),
            'completed_visits_today': Visit.objects.filter(stage='discharged', discharge_time__date=timezone.now().date()).count(),
            'pending_lab_tests': LabTest.objects.filter(status='requested').count(),
            'visits_by_stage': dict(Visit.objects.values('stage').annotate(count=Count('stage')).values_list('stage', 'count')),
            'recent_visits': QueuePatientSerializer(Visit.objects.order_by('-check_in_time')[:5], many=True).data
        }
        return Response(stats)


class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'test_type']
    search_fields = ['test_name', 'visit__patient__user__first_name', 'visit__patient__user__last_name']
    ordering_fields = ['requested_at', 'completed_at']
    ordering = ['-requested_at']
    
    @action(detail=True, methods=['post'])
    def complete_test(self, request, pk=None):
        # Only laboratory staff can complete lab tests
        if not (request.user.is_laboratory or request.user.is_admin):
            return Response(
                {'error': 'Only laboratory staff can complete lab tests'},
                status=status.HTTP_403_FORBIDDEN
            )

        test = self.get_object()
        test.results = request.data.get('results', '')
        test.interpretation = request.data.get('interpretation', '')
        test.status = 'completed'
        test.completed_at = timezone.now()
        test.performed_by = request.user
        test.save()

        serializer = self.get_serializer(test)
        return Response(serializer.data)


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_dispensed']
    search_fields = ['visit__patient__user__first_name', 'visit__patient__user__last_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def dispense(self, request, pk=None):
        # Only staff/nurse can dispense medications (not doctors, they prescribe)
        if not (request.user.is_staff_member):
            return Response(
                {'error': 'Only staff members can dispense medications'},
                status=status.HTTP_403_FORBIDDEN
            )

        prescription = self.get_object()
        prescription.is_dispensed = True
        prescription.dispensed_at = timezone.now()
        prescription.dispensed_by = request.data.get('dispensed_by', request.user.get_full_name())
        prescription.save()

        serializer = self.get_serializer(prescription)
        return Response(serializer.data)


class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'requires_prescription', 'dosage_form']
    search_fields = ['name', 'generic_name', 'manufacturer']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'doctor', 'is_follow_up']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'reason']
    ordering_fields = ['appointment_date', 'created_at']
    ordering = ['appointment_date']
    
    def perform_create(self, serializer):
        serializer.save(booked_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]  # Authenticated with filtered access
    filter_backends = [SearchFilter]
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'patient__patient_id']

    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        if user.is_staff_member:
            return MedicalRecord.objects.all()
        elif user.is_patient:
            try:
                patient = Patient.objects.get(user=user)
                return MedicalRecord.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return MedicalRecord.objects.none()
        return MedicalRecord.objects.none()


# EHR ViewSets
class MedicalHistoryViewSet(viewsets.ModelViewSet):
    queryset = MedicalHistory.objects.all()
    serializer_class = MedicalHistorySerializer
    permission_classes = [permissions.IsAuthenticated]  # Authenticated with filtered access
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['patient', 'condition_type', 'is_active']
    search_fields = ['condition_name', 'description']
    ordering_fields = ['diagnosis_date', 'created_at']
    ordering = ['-diagnosis_date']

    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        if user.is_staff_member:
            return MedicalHistory.objects.all()
        elif user.is_patient:
            try:
                patient = Patient.objects.get(user=user)
                return MedicalHistory.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return MedicalHistory.objects.none()
        return MedicalHistory.objects.none()


class AllergyViewSet(viewsets.ModelViewSet):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer
    permission_classes = [permissions.IsAuthenticated]  # Only staff can access allergy records
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['patient', 'allergy_type', 'severity', 'is_active']
    search_fields = ['allergen', 'reaction']
    ordering_fields = ['diagnosed_date', 'severity']
    ordering = ['-severity', '-diagnosed_date']

    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        if user.is_staff_member:
            return Allergy.objects.all()
        elif user.is_patient:
            try:
                patient = Patient.objects.get(user=user)
                return Allergy.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return Allergy.objects.none()
        return Allergy.objects.none()


class PatientMedicationViewSet(viewsets.ModelViewSet):
    queryset = PatientMedication.objects.all()
    serializer_class = PatientMedicationSerializer
    permission_classes = [permissions.IsAuthenticated]  # Authenticated with filtered access
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['patient', 'is_active', 'frequency']
    search_fields = ['medication_name', 'dosage']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        if user.is_staff_member:
            return PatientMedication.objects.all()
        elif user.is_patient:
            try:
                patient = Patient.objects.get(user=user)
                return PatientMedication.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return PatientMedication.objects.none()
        return PatientMedication.objects.none()


# Staff Management ViewSets
class StaffProfileViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [IsStaffMember]  # Only staff can access staff profiles
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employment_status', 'department']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id']
    ordering_fields = ['hire_date', 'created_at']
    ordering = ['-hire_date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        return StaffProfileSerializer
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get staff dashboard statistics"""
        from django.db.models import Count
        from datetime import datetime, timedelta
        
        stats = {
            'total_staff': StaffProfile.objects.count(),
            'active_staff': StaffProfile.objects.filter(employment_status='active').count(),
            'departments': dict(StaffProfile.objects.values('department').annotate(count=Count('department')).values_list('department', 'count')),
            'recent_hires': StaffProfileSerializer(StaffProfile.objects.filter(hire_date__gte=datetime.now().date() - timedelta(days=30))[:5], many=True).data,
            'staff_by_role': dict(StaffProfile.objects.values('user__role').annotate(count=Count('user__role')).values_list('user__role', 'count'))
        }
        return Response(stats)


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [IsStaffMember]  # Only staff can access shift schedules
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['staff', 'status']
    search_fields = ['staff__user__first_name', 'staff__user__last_name']
    ordering_fields = ['start_time', 'created_at']
    ordering = ['-start_time']
    
    @action(detail=False, methods=['get'])
    def calendar_view(self, request):
        """Get shifts formatted for calendar display"""
        shifts = self.get_queryset()
        calendar_data = []
        for shift in shifts:
            calendar_data.append({
                'id': shift.id,
                'title': f"{shift.staff.user.get_full_name()}",
                'start': shift.start_time.isoformat(),
                'end': shift.end_time.isoformat(),
                'status': shift.status,
                'department': shift.staff.department
            })
        return Response(calendar_data)


class PayrollEntryViewSet(viewsets.ModelViewSet):
    queryset = PayrollEntry.objects.all()
    serializer_class = PayrollEntrySerializer
    permission_classes = [IsStaffMember]  # Only staff can access payroll - sensitive salary data!
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['staff']
    search_fields = ['staff__user__first_name', 'staff__user__last_name']
    ordering_fields = ['pay_period_end', 'created_at']
    ordering = ['-pay_period_end']
    
    @action(detail=False, methods=['post'])
    def generate_payroll(self, request):
        """Generate payroll entries for a pay period"""
        from datetime import datetime, timedelta
        from django.db.models import Sum
        
        start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(request.data['end_date'], '%Y-%m-%d').date()
        
        staff_profiles = StaffProfile.objects.filter(employment_status='active')
        created_entries = []
        
        for staff in staff_profiles:
            # Calculate total hours from shifts
            shifts = Shift.objects.filter(
                staff=staff,
                start_time__date__gte=start_date,
                end_time__date__lte=end_date,
                status='completed'
            )
            
            total_hours = sum([shift.duration_hours() for shift in shifts])
            
            if total_hours > 0:
                payroll_entry = PayrollEntry.objects.create(
                    staff=staff,
                    pay_period_start=start_date,
                    pay_period_end=end_date,
                    total_hours=total_hours,
                    hourly_rate=staff.hourly_rate
                )
                created_entries.append(payroll_entry)
        
        serializer = self.get_serializer(created_entries, many=True)
        return Response(serializer.data)


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsStaffMember]  # Only staff can access performance reviews
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['staff', 'overall_rating']
    search_fields = ['staff__user__first_name', 'staff__user__last_name']
    ordering_fields = ['review_period_end', 'overall_rating']
    ordering = ['-review_period_end']


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def staff_onboard(request):
    """Create a new staff member with user account"""
    import secrets
    import string
    from django.contrib.auth.hashers import make_password
    
    try:
        # Generate temporary password
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
        
        # Create user account
        user_data = {
            'username': request.data['email'],
            'email': request.data['email'],
            'first_name': request.data['first_name'],
            'last_name': request.data['last_name'],
            'password': make_password(temp_password),
            'role': request.data['role'],
            'phone_number': request.data.get('phone', ''),
            'department': request.data['department'],
            'specialization': request.data.get('specialization', '')
        }
        
        user = User.objects.create(**user_data)
        
        # Generate employee ID
        last_staff = StaffProfile.objects.order_by('-id').first()
        if last_staff:
            last_id = int(last_staff.employee_id.split('-')[1])
            employee_id = f"EMP-{str(last_id + 1).zfill(3)}"
        else:
            employee_id = "EMP-001"
        
        # Create staff profile
        staff_profile = StaffProfile.objects.create(
            user=user,
            employee_id=employee_id,
            hire_date=request.data.get('hire_date', timezone.now().date()),
            hourly_rate=request.data.get('hourly_rate', '25.00'),
            department=request.data['department']
        )
        
        return Response({
            'success': True,
            'employee_id': employee_id,
            'temporary_password': temp_password,
            'message': f'Staff member {user.get_full_name()} created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)