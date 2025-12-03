from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role & Medical Info', {
            'fields': ('role', 'phone_number', 'date_of_birth', 'address', 
                      'emergency_contact', 'emergency_phone')
        }),
        ('Medical History', {
            'fields': ('medical_history', 'allergies', 'current_medications'),
            'classes': ('collapse',)
        }),
        ('Professional Info', {
            'fields': ('license_number', 'department', 'specialization'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'email', 'first_name', 'last_name', 'phone_number')
        }),
    )