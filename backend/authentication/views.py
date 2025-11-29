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
    user = request.user
    
    if user.is_patient:
        # Patient dashboard stats
        return Response({
            'role': 'patient',
            'upcoming_appointments': 0,  # TODO: Implement appointments
            'pending_lab_results': 0,    # TODO: Implement lab results
            'active_prescriptions': 0,   # TODO: Implement prescriptions
        })
    
    elif user.is_reception:
        # Reception dashboard stats
        return Response({
            'role': 'reception',
            'total_patients': User.objects.filter(role='patient').count(),
            'todays_appointments': 0,    # TODO: Implement appointments
            'pending_registrations': 0,  # TODO: Implement registrations
        })
    
    elif user.is_doctor:
        # Doctor dashboard stats
        return Response({
            'role': 'doctor',
            'todays_appointments': 0,    # TODO: Implement appointments
            'pending_consultations': 0,  # TODO: Implement consultations
            'patients_under_care': 0,    # TODO: Implement patient assignments
        })
    
    elif user.is_laboratory:
        # Laboratory dashboard stats
        return Response({
            'role': 'laboratory',
            'pending_tests': 0,          # TODO: Implement lab tests
            'completed_today': 0,        # TODO: Implement lab results
            'urgent_tests': 0,           # TODO: Implement priority tests
        })
    
    return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)