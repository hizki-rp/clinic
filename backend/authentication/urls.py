from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.UserRegistrationView.as_view(), name='user_register'),
    
    # User management
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('role-info/', views.user_role_info, name='user_role_info'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Staff endpoints
    path('patients/', views.PatientListView.as_view(), name='patient_list'),
    path('staff/', views.StaffListView.as_view(), name='staff_list'),
    path('doctors/', views.DoctorListView.as_view(), name='doctor_list'),
    path('create-patient/', views.create_patient, name='create_patient'),
]