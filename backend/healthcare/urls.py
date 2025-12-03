from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import AdminDashboardViewSet, admin_reports
from .test_views import test_endpoint

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'visits', views.VisitViewSet)
router.register(r'lab-tests', views.LabTestViewSet)
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'medications', views.MedicationViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'medical-records', views.MedicalRecordViewSet)

# EHR endpoints
router.register(r'medical-history', views.MedicalHistoryViewSet)
router.register(r'allergies', views.AllergyViewSet)
router.register(r'patient-medications', views.PatientMedicationViewSet)

# Staff Management endpoints
router.register(r'staff', views.StaffProfileViewSet)
router.register(r'shifts', views.ShiftViewSet)
router.register(r'payroll', views.PayrollEntryViewSet)
router.register(r'performance-reviews', views.PerformanceReviewViewSet)

# Admin Management endpoints
router.register(r'admin', AdminDashboardViewSet, basename='admin')

urlpatterns = [
    path('test/', test_endpoint, name='test_endpoint'),
    path('staff/onboard/', views.staff_onboard, name='staff_onboard'),
    path('admin/reports/', admin_reports, name='admin_reports'),
    path('', include(router.urls)),
]