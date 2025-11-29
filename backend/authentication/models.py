from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('reception', 'Reception'),
        ('doctor', 'Doctor'),
        ('laboratory', 'Laboratory'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    emergency_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Medical fields for patients
    medical_history = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    current_medications = models.TextField(blank=True, null=True)
    
    # Professional fields for staff
    license_number = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    @property
    def is_patient(self):
        return self.role == 'patient'
    
    @property
    def is_reception(self):
        return self.role == 'reception'
    
    @property
    def is_doctor(self):
        return self.role == 'doctor'
    
    @property
    def is_laboratory(self):
        return self.role == 'laboratory'
    
    @property
    def is_staff_member(self):
        return self.role in ['reception', 'doctor', 'laboratory', 'staff']
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def can_manage_staff(self):
        return self.role in ['admin', 'staff']