from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer, UserSerializer, CustomTokenObtainPairSerializer,
    PatientSerializer, StaffSerializer
)
from .permissions import IsStaffMember, IsPatient, IsReception, IsDoctor, IsLaboratory

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class PatientListView(generics.ListAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsStaffMember]
    
    def get_queryset(self):
        return User.objects.filter(role='patient')


class StaffListView(generics.ListAPIView):
    serializer_class = StaffSerializer
    permission_classes = [IsStaffMember]
    
    def get_queryset(self):
        return User.objects.filter(role__in=['reception', 'doctor', 'laboratory'])


class DoctorListView(generics.ListAPIView):
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAuthenticated]  # Changed from IsStaffMember to allow all authenticated users
    
    def get_queryset(self):
        return User.objects.filter(role='doctor')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_role_info(request):
    """Get current user's role information"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'is_patient': user.is_patient,
        'is_reception': user.is_reception,
        'is_doctor': user.is_doctor,
        'is_laboratory': user.is_laboratory,
        'is_staff_member': user.is_staff_member,
        'permissions': {
            'can_view_patients': user.is_staff_member,
            'can_create_appointments': user.is_patient or user.is_reception,
            'can_view_lab_results': user.is_doctor or user.is_laboratory,
            'can_prescribe': user.is_doctor,
        }
    })


@api_view(['POST'])
@permission_classes([IsReception])
def create_patient(request):
    """Reception can create patient accounts"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        # Force role to be patient
        serializer.validated_data['role'] = 'patient'
        user = serializer.save()
        return Response(PatientSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics based on user role"""
    from healthcare.models import Patient, Appointment, LabTest, Prescription, Visit
    from django.db.models import Q, Count
    from datetime import date, datetime

    user = request.user
    today = date.today()

    if user.is_patient:
        # Patient dashboard stats
        try:
            patient = Patient.objects.get(user=user)

            # Upcoming appointments (scheduled or confirmed, date >= today)
            upcoming_appointments = Appointment.objects.filter(
                patient=patient,
                appointment_date__gte=datetime.combine(today, datetime.min.time()),
                status__in=['scheduled', 'confirmed']
            ).count()

            # Pending lab results (tests that are not completed)
            pending_lab_results = LabTest.objects.filter(
                visit__patient=patient,
                status__in=['requested', 'in_progress']
            ).count()

            # Active prescriptions (not dispensed and still valid)
            active_prescriptions = Prescription.objects.filter(
                visit__patient=patient,
                is_dispensed=False,
                valid_until__gte=today
            ).count()

            return Response({
                'role': 'patient',
                'upcoming_appointments': upcoming_appointments,
                'pending_lab_results': pending_lab_results,
                'active_prescriptions': active_prescriptions,
            })
        except Patient.DoesNotExist:
            return Response({
                'role': 'patient',
                'upcoming_appointments': 0,
                'pending_lab_results': 0,
                'active_prescriptions': 0,
                'error': 'Patient profile not found'
            })

    elif user.is_reception:
        # Reception dashboard stats
        # Today's appointments (all appointments scheduled for today)
        todays_appointments = Appointment.objects.filter(
            appointment_date__date=today
        ).count()

        # Pending registrations (patients registered in last 7 days without visits)
        from datetime import timedelta
        week_ago = today - timedelta(days=7)
        pending_registrations = Patient.objects.filter(
            created_at__gte=datetime.combine(week_ago, datetime.min.time()),
            visits__isnull=True
        ).count()

        return Response({
            'role': 'reception',
            'total_patients': User.objects.filter(role='patient').count(),
            'todays_appointments': todays_appointments,
            'pending_registrations': pending_registrations,
        })

    elif user.is_doctor:
        # Doctor dashboard stats
        # Today's appointments assigned to this doctor
        todays_appointments = Appointment.objects.filter(
            doctor=user,
            appointment_date__date=today
        ).count()

        # Pending consultations (visits assigned to this doctor that are not discharged)
        pending_consultations = Visit.objects.filter(
            attending_doctor=user,
            stage__in=['questioning', 'laboratory_test', 'results_by_doctor']
        ).count()

        # Patients under care (distinct patients from active visits)
        patients_under_care = Visit.objects.filter(
            attending_doctor=user,
            stage__in=['questioning', 'laboratory_test', 'results_by_doctor']
        ).values('patient').distinct().count()

        return Response({
            'role': 'doctor',
            'todays_appointments': todays_appointments,
            'pending_consultations': pending_consultations,
            'patients_under_care': patients_under_care,
        })

    elif user.is_laboratory:
        # Laboratory dashboard stats
        # Pending tests (requested or in progress)
        pending_tests = LabTest.objects.filter(
            status__in=['requested', 'in_progress']
        ).count()

        # Completed today
        completed_today = LabTest.objects.filter(
            completed_at__date=today,
            status='completed'
        ).count()

        # Urgent tests (not completed with urgent priority)
        urgent_tests = LabTest.objects.filter(
            Q(status__in=['requested', 'in_progress']) &
            Q(visit__patient__priority='urgent')
        ).count()

        return Response({
            'role': 'laboratory',
            'pending_tests': pending_tests,
            'completed_today': completed_today,
            'urgent_tests': urgent_tests,
        })

    elif user.is_staff or user.role == 'admin':
        # Admin/Staff dashboard stats - comprehensive overview
        from datetime import timedelta

        return Response({
            'role': user.role,
            'total_patients': Patient.objects.count(),
            'total_staff': User.objects.filter(role__in=['reception', 'doctor', 'laboratory', 'staff']).count(),
            'todays_appointments': Appointment.objects.filter(appointment_date__date=today).count(),
            'active_visits': Visit.objects.exclude(stage='discharged').count(),
            'pending_lab_tests': LabTest.objects.filter(status__in=['requested', 'in_progress']).count(),
        })

    return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)