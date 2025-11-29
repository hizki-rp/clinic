from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Sum, Q
from datetime import datetime, timedelta
import secrets
import string
from django.contrib.auth.hashers import make_password

from .models import (
    Patient, Visit, LabTest, Prescription, Medication, Appointment, MedicalRecord,
    MedicalHistory, Allergy, PatientMedication, StaffProfile, Shift, PayrollEntry, PerformanceReview
)
from .serializers import (
    PatientSerializer, VisitSerializer, LabTestSerializer, PrescriptionSerializer, 
    MedicationSerializer, AppointmentSerializer, MedicalRecordSerializer,
    MedicalHistorySerializer, AllergySerializer, PatientMedicationSerializer,
    StaffProfileSerializer, ShiftSerializer, PayrollEntrySerializer, PerformanceReviewSerializer
)

User = get_user_model()


class AdminDashboardViewSet(viewsets.ViewSet):
    """Comprehensive admin dashboard with all clinic management features"""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def overview_stats(self, request):
        """Get comprehensive dashboard statistics"""
        today = timezone.now().date()
        this_month = timezone.now().replace(day=1).date()
        
        stats = {
            # Patient Statistics
            'patients': {
                'total': Patient.objects.count(),
                'new_this_month': Patient.objects.filter(created_at__date__gte=this_month).count(),
                'active_visits': Visit.objects.filter(stage__in=['waiting_room', 'questioning', 'laboratory_test', 'results_by_doctor']).count(),
                'completed_today': Visit.objects.filter(stage='discharged', discharge_time__date=today).count(),
            },
            
            # Staff Statistics
            'staff': {
                'total': StaffProfile.objects.count(),
                'active': StaffProfile.objects.filter(employment_status='active').count(),
                'on_duty_today': Shift.objects.filter(
                    start_time__date=today,
                    status__in=['scheduled', 'in_progress']
                ).count(),
                'departments': dict(StaffProfile.objects.values('department').annotate(count=Count('department')).values_list('department', 'count')),
            },
            
            # Medical Statistics
            'medical': {
                'pending_lab_tests': LabTest.objects.filter(status='requested').count(),
                'prescriptions_today': Prescription.objects.filter(created_at__date=today).count(),
                'appointments_today': Appointment.objects.filter(appointment_date__date=today).count(),
                'medication_inventory': Medication.objects.filter(is_active=True).count(),
            },
            
            # Financial Statistics
            'financial': {
                'monthly_payroll': PayrollEntry.objects.filter(
                    pay_period_start__gte=this_month
                ).aggregate(total=Sum('net_pay'))['total'] or 0,
                'staff_hours_this_month': Shift.objects.filter(
                    start_time__date__gte=this_month,
                    status='completed'
                ).count(),
            },
            
            # Recent Activity
            'recent_activity': {
                'new_patients': PatientSerializer(
                    Patient.objects.order_by('-created_at')[:5], many=True
                ).data,
                'recent_visits': VisitSerializer(
                    Visit.objects.order_by('-check_in_time')[:5], many=True
                ).data,
                'recent_staff': StaffProfileSerializer(
                    StaffProfile.objects.order_by('-hire_date')[:5], many=True
                ).data,
            }
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def patient_management(self, request):
        """Get comprehensive patient data for admin management"""
        patients = Patient.objects.select_related('user').prefetch_related('visits', 'appointments')
        
        # Apply filters
        search = request.query_params.get('search', '')
        if search:
            patients = patients.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(patient_id__icontains=search) |
                Q(phone__icontains=search)
            )
        
        priority = request.query_params.get('priority', '')
        if priority:
            patients = patients.filter(priority=priority)
        
        serializer = PatientSerializer(patients, many=True)
        return Response({
            'patients': serializer.data,
            'total_count': patients.count(),
            'priority_distribution': dict(
                Patient.objects.values('priority').annotate(count=Count('priority')).values_list('priority', 'count')
            )
        })
    
    @action(detail=False, methods=['get'])
    def staff_management(self, request):
        """Get comprehensive staff data for admin management"""
        staff = StaffProfile.objects.select_related('user').prefetch_related('shifts', 'payroll_entries')
        
        # Apply filters
        department = request.query_params.get('department', '')
        if department:
            staff = staff.filter(department=department)
        
        status_filter = request.query_params.get('status', '')
        if status_filter:
            staff = staff.filter(employment_status=status_filter)
        
        serializer = StaffProfileSerializer(staff, many=True)
        return Response({
            'staff': serializer.data,
            'total_count': staff.count(),
            'departments': list(StaffProfile.objects.values_list('department', flat=True).distinct()),
            'employment_status_distribution': dict(
                StaffProfile.objects.values('employment_status').annotate(count=Count('employment_status')).values_list('employment_status', 'count')
            )
        })
    
    @action(detail=False, methods=['post'])
    def create_staff(self, request):
        """Create new staff member with user account"""
        try:
            # Generate temporary password
            temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            
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
                'specialization': request.data.get('specialization', ''),
                'license_number': request.data.get('license_number', '')
            }
            
            user = User.objects.create(**user_data)
            
            # Generate employee ID
            last_staff = StaffProfile.objects.order_by('-id').first()
            if last_staff:
                last_id = int(last_staff.employee_id.split('-')[1])
                employee_id = f"EMP-{str(last_id + 1).zfill(4)}"
            else:
                employee_id = "EMP-0001"
            
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
                'staff': StaffProfileSerializer(staff_profile).data,
                'message': f'Staff member {user.get_full_name()} created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def ehr_management(self, request):
        """Get comprehensive EHR data for admin management"""
        patient_id = request.query_params.get('patient_id', '')
        
        if patient_id:
            # Get specific patient's EHR data
            try:
                patient = Patient.objects.get(id=patient_id)
                medical_histories = MedicalHistory.objects.filter(patient=patient)
                allergies = Allergy.objects.filter(patient=patient)
                medications = PatientMedication.objects.filter(patient=patient)
                
                return Response({
                    'patient': PatientSerializer(patient).data,
                    'medical_histories': MedicalHistorySerializer(medical_histories, many=True).data,
                    'allergies': AllergySerializer(allergies, many=True).data,
                    'medications': PatientMedicationSerializer(medications, many=True).data,
                })
            except Patient.DoesNotExist:
                return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get overview EHR statistics
        return Response({
            'statistics': {
                'total_medical_histories': MedicalHistory.objects.count(),
                'active_allergies': Allergy.objects.filter(is_active=True).count(),
                'current_medications': PatientMedication.objects.filter(is_active=True).count(),
                'chronic_conditions': MedicalHistory.objects.filter(condition_type='chronic', is_active=True).count(),
            },
            'recent_entries': {
                'medical_histories': MedicalHistorySerializer(
                    MedicalHistory.objects.order_by('-created_at')[:10], many=True
                ).data,
                'allergies': AllergySerializer(
                    Allergy.objects.order_by('-created_at')[:10], many=True
                ).data,
                'medications': PatientMedicationSerializer(
                    PatientMedication.objects.order_by('-created_at')[:10], many=True
                ).data,
            }
        })
    
    @action(detail=False, methods=['get'])
    def prescription_management(self, request):
        """Get comprehensive prescription data for admin management"""
        prescriptions = Prescription.objects.select_related('visit__patient__user', 'prescribed_by')
        
        # Apply filters
        status_filter = request.query_params.get('status', '')
        if status_filter == 'dispensed':
            prescriptions = prescriptions.filter(is_dispensed=True)
        elif status_filter == 'pending':
            prescriptions = prescriptions.filter(is_dispensed=False)
        
        date_from = request.query_params.get('date_from', '')
        if date_from:
            prescriptions = prescriptions.filter(created_at__date__gte=date_from)
        
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response({
            'prescriptions': serializer.data,
            'statistics': {
                'total': prescriptions.count(),
                'dispensed': prescriptions.filter(is_dispensed=True).count(),
                'pending': prescriptions.filter(is_dispensed=False).count(),
                'today': prescriptions.filter(created_at__date=timezone.now().date()).count(),
            }
        })
    
    @action(detail=False, methods=['get'])
    def appointment_management(self, request):
        """Get comprehensive appointment data for admin management"""
        appointments = Appointment.objects.select_related('patient__user', 'doctor')
        
        # Apply filters
        status_filter = request.query_params.get('status', '')
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        
        date_from = request.query_params.get('date_from', '')
        if date_from:
            appointments = appointments.filter(appointment_date__date__gte=date_from)
        
        doctor_id = request.query_params.get('doctor_id', '')
        if doctor_id:
            appointments = appointments.filter(doctor_id=doctor_id)
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response({
            'appointments': serializer.data,
            'statistics': {
                'total': appointments.count(),
                'scheduled': appointments.filter(status='scheduled').count(),
                'completed': appointments.filter(status='completed').count(),
                'cancelled': appointments.filter(status='cancelled').count(),
                'today': appointments.filter(appointment_date__date=timezone.now().date()).count(),
            },
            'doctors': list(User.objects.filter(role='doctor').values('id', 'first_name', 'last_name'))
        })
    
    @action(detail=False, methods=['get'])
    def payroll_management(self, request):
        """Get comprehensive payroll data for admin management"""
        payroll_entries = PayrollEntry.objects.select_related('staff__user')
        
        # Apply filters
        month = request.query_params.get('month', '')
        if month:
            try:
                month_date = datetime.strptime(month, '%Y-%m').date()
                payroll_entries = payroll_entries.filter(pay_period_start__year=month_date.year, pay_period_start__month=month_date.month)
            except ValueError:
                pass
        
        staff_id = request.query_params.get('staff_id', '')
        if staff_id:
            payroll_entries = payroll_entries.filter(staff_id=staff_id)
        
        serializer = PayrollEntrySerializer(payroll_entries, many=True)
        
        # Calculate totals
        total_gross = payroll_entries.aggregate(total=Sum('gross_pay'))['total'] or 0
        total_net = payroll_entries.aggregate(total=Sum('net_pay'))['total'] or 0
        total_deductions = payroll_entries.aggregate(total=Sum('deductions'))['total'] or 0
        
        return Response({
            'payroll_entries': serializer.data,
            'statistics': {
                'total_entries': payroll_entries.count(),
                'total_gross_pay': total_gross,
                'total_net_pay': total_net,
                'total_deductions': total_deductions,
                'average_hours': payroll_entries.aggregate(avg=Sum('total_hours'))['avg'] or 0,
            },
            'staff_list': list(StaffProfile.objects.values('id', 'user__first_name', 'user__last_name', 'employee_id'))
        })
    
    @action(detail=False, methods=['post'])
    def generate_payroll(self, request):
        """Generate payroll entries for a specific period"""
        try:
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
                    # Check if payroll entry already exists
                    existing_entry = PayrollEntry.objects.filter(
                        staff=staff,
                        pay_period_start=start_date,
                        pay_period_end=end_date
                    ).first()
                    
                    if not existing_entry:
                        payroll_entry = PayrollEntry.objects.create(
                            staff=staff,
                            pay_period_start=start_date,
                            pay_period_end=end_date,
                            total_hours=total_hours,
                            hourly_rate=staff.hourly_rate
                        )
                        created_entries.append(payroll_entry)
            
            serializer = PayrollEntrySerializer(created_entries, many=True)
            return Response({
                'success': True,
                'created_entries': len(created_entries),
                'payroll_entries': serializer.data,
                'message': f'Generated {len(created_entries)} payroll entries'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def shift_management(self, request):
        """Get comprehensive shift data for admin management"""
        shifts = Shift.objects.select_related('staff__user')
        
        # Apply filters
        date_from = request.query_params.get('date_from', '')
        if date_from:
            shifts = shifts.filter(start_time__date__gte=date_from)
        
        date_to = request.query_params.get('date_to', '')
        if date_to:
            shifts = shifts.filter(start_time__date__lte=date_to)
        
        staff_id = request.query_params.get('staff_id', '')
        if staff_id:
            shifts = shifts.filter(staff_id=staff_id)
        
        status_filter = request.query_params.get('status', '')
        if status_filter:
            shifts = shifts.filter(status=status_filter)
        
        serializer = ShiftSerializer(shifts, many=True)
        return Response({
            'shifts': serializer.data,
            'statistics': {
                'total': shifts.count(),
                'scheduled': shifts.filter(status='scheduled').count(),
                'in_progress': shifts.filter(status='in_progress').count(),
                'completed': shifts.filter(status='completed').count(),
                'cancelled': shifts.filter(status='cancelled').count(),
                'today': shifts.filter(start_time__date=timezone.now().date()).count(),
            },
            'staff_list': list(StaffProfile.objects.values('id', 'user__first_name', 'user__last_name', 'employee_id'))
        })
    
    @action(detail=False, methods=['post'])
    def create_shift(self, request):
        """Create a new shift for staff member"""
        try:
            shift = Shift.objects.create(
                staff_id=request.data['staff_id'],
                start_time=request.data['start_time'],
                end_time=request.data['end_time'],
                notes=request.data.get('notes', '')
            )
            
            serializer = ShiftSerializer(shift)
            return Response({
                'success': True,
                'shift': serializer.data,
                'message': 'Shift created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def inventory_management(self, request):
        """Get comprehensive medication inventory for admin management"""
        medications = Medication.objects.all()
        
        # Apply filters
        low_stock = request.query_params.get('low_stock', '')
        if low_stock:
            medications = medications.filter(stock_quantity__lt=10)
        
        active_only = request.query_params.get('active_only', '')
        if active_only:
            medications = medications.filter(is_active=True)
        
        search = request.query_params.get('search', '')
        if search:
            medications = medications.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(manufacturer__icontains=search)
            )
        
        serializer = MedicationSerializer(medications, many=True)
        return Response({
            'medications': serializer.data,
            'statistics': {
                'total': medications.count(),
                'active': medications.filter(is_active=True).count(),
                'low_stock': medications.filter(stock_quantity__lt=10).count(),
                'out_of_stock': medications.filter(stock_quantity=0).count(),
                'total_value': medications.aggregate(
                    total=Sum('stock_quantity') * Sum('unit_price')
                )['total'] or 0,
            }
        })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def admin_reports(request):
    """Generate comprehensive admin reports"""
    report_type = request.query_params.get('type', 'overview')
    
    if report_type == 'patient_summary':
        return Response({
            'total_patients': Patient.objects.count(),
            'patients_by_priority': dict(Patient.objects.values('priority').annotate(count=Count('priority')).values_list('priority', 'count')),
            'patients_by_gender': dict(Patient.objects.values('gender').annotate(count=Count('gender')).values_list('gender', 'count')),
            'recent_registrations': PatientSerializer(Patient.objects.order_by('-created_at')[:10], many=True).data,
        })
    
    elif report_type == 'staff_summary':
        return Response({
            'total_staff': StaffProfile.objects.count(),
            'staff_by_department': dict(StaffProfile.objects.values('department').annotate(count=Count('department')).values_list('department', 'count')),
            'staff_by_status': dict(StaffProfile.objects.values('employment_status').annotate(count=Count('employment_status')).values_list('employment_status', 'count')),
            'recent_hires': StaffProfileSerializer(StaffProfile.objects.order_by('-hire_date')[:10], many=True).data,
        })
    
    elif report_type == 'financial_summary':
        this_month = timezone.now().replace(day=1).date()
        return Response({
            'monthly_payroll': PayrollEntry.objects.filter(pay_period_start__gte=this_month).aggregate(total=Sum('net_pay'))['total'] or 0,
            'total_staff_hours': Shift.objects.filter(start_time__date__gte=this_month, status='completed').count(),
            'payroll_by_department': dict(
                PayrollEntry.objects.filter(pay_period_start__gte=this_month)
                .values('staff__department')
                .annotate(total=Sum('net_pay'))
                .values_list('staff__department', 'total')
            ),
        })
    
    # Default overview report
    return Response({
        'patients': Patient.objects.count(),
        'staff': StaffProfile.objects.count(),
        'active_visits': Visit.objects.filter(stage__in=['waiting_room', 'questioning', 'laboratory_test', 'results_by_doctor']).count(),
        'appointments_today': Appointment.objects.filter(appointment_date__date=timezone.now().date()).count(),
        'pending_lab_tests': LabTest.objects.filter(status='requested').count(),
        'prescriptions_today': Prescription.objects.filter(created_at__date=timezone.now().date()).count(),
    })