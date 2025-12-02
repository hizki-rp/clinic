from django.contrib import admin
from .models import (
    Patient, Visit, LabTest, Prescription, Medication, Appointment, MedicalRecord,
    MedicalHistory, Allergy, PatientMedication, StaffProfile, Shift, PayrollEntry, PerformanceReview,
    MedicationAdministration, Immunization
)

# Custom admin site configuration
admin.site.site_header = "Healthcare Management System"
admin.site.site_title = "Healthcare Admin"
admin.site.index_title = "Welcome to Healthcare Management"

# Existing models
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['patient_id', 'user', 'age', 'gender', 'priority', 'created_at']
    list_filter = ['gender', 'priority', 'created_at']
    search_fields = ['patient_id', 'user__first_name', 'user__last_name']

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ['patient', 'stage', 'check_in_time', 'attending_doctor']
    list_filter = ['stage', 'check_in_time']
    search_fields = ['patient__user__first_name', 'patient__user__last_name']

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ['test_name', 'visit', 'status', 'requested_by', 'requested_at']
    list_filter = ['status', 'test_type', 'requested_at']

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['visit', 'prescribed_by', 'is_dispensed', 'created_at']
    list_filter = ['is_dispensed', 'created_at']

@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'strength', 'dosage_form', 'stock_quantity', 'is_active']
    list_filter = ['dosage_form', 'is_active', 'requires_prescription']
    search_fields = ['name', 'generic_name']

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'appointment_date', 'status']
    list_filter = ['status', 'appointment_date', 'is_follow_up']

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'blood_type', 'created_at', 'updated_at']
    search_fields = ['patient__user__first_name', 'patient__user__last_name']

# EHR Models
@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    list_display = ['patient', 'condition_name', 'condition_type', 'diagnosis_date', 'is_active']
    list_filter = ['condition_type', 'is_active', 'diagnosis_date']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'condition_name']

@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ['patient', 'allergen', 'allergy_type', 'severity', 'is_active']
    list_filter = ['allergy_type', 'severity', 'is_active']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'allergen']

@admin.register(PatientMedication)
class PatientMedicationAdmin(admin.ModelAdmin):
    list_display = ['patient', 'medication_name', 'dosage', 'frequency', 'is_active']
    list_filter = ['frequency', 'is_active', 'start_date']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'medication_name']

# ============ STAFF MANAGEMENT SECTION ============
@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'user', 'department', 'employment_status', 'hourly_rate', 'hire_date']
    list_filter = ['employment_status', 'department', 'hire_date']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name']
    
    fieldsets = (
        ('Employee Information', {
            'fields': ('user', 'employee_id', 'hire_date')
        }),
        ('Employment Details', {
            'fields': ('employment_status', 'department', 'hourly_rate', 'supervisor')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['staff', 'start_time', 'end_time', 'status', 'duration_display']
    list_filter = ['status', 'start_time']
    search_fields = ['staff__user__first_name', 'staff__user__last_name']
    date_hierarchy = 'start_time'
    
    def duration_display(self, obj):
        return f"{obj.duration_hours():.2f} hours"
    duration_display.short_description = 'Duration'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('staff__user')

@admin.register(PayrollEntry)
class PayrollEntryAdmin(admin.ModelAdmin):
    list_display = ['staff', 'pay_period_start', 'pay_period_end', 'total_hours', 'gross_pay', 'net_pay']
    list_filter = ['pay_period_start', 'pay_period_end']
    search_fields = ['staff__user__first_name', 'staff__user__last_name']
    readonly_fields = ['gross_pay', 'net_pay']
    date_hierarchy = 'pay_period_start'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('staff__user')

@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ['staff', 'review_period_end', 'overall_rating', 'reviewer']
    list_filter = ['overall_rating', 'review_period_end']
    search_fields = ['staff__user__first_name', 'staff__user__last_name']
    date_hierarchy = 'review_period_end'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('staff__user', 'reviewer')


# ============ MEDICATION ADMINISTRATION SECTION ============
@admin.register(MedicationAdministration)
class MedicationAdministrationAdmin(admin.ModelAdmin):
    list_display = ['patient', 'medication_name', 'dosage', 'route', 'status', 'administered_time', 'administered_by']
    list_filter = ['status', 'route', 'administered_time', 'adverse_reaction', 'requires_observation']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'medication_name']
    date_hierarchy = 'administered_time'

    fieldsets = (
        ('Patient & Visit', {
            'fields': ('visit', 'patient')
        }),
        ('Medication Details', {
            'fields': ('medication_name', 'dosage', 'route', 'status')
        }),
        ('Administration', {
            'fields': ('ordered_by', 'administered_by', 'scheduled_time', 'administered_time')
        }),
        ('Injection/IV Details', {
            'fields': ('injection_site', 'iv_line_location', 'flow_rate'),
            'classes': ('collapse',)
        }),
        ('Batch Tracking', {
            'fields': ('batch_number', 'expiry_date'),
            'classes': ('collapse',)
        }),
        ('Patient Response', {
            'fields': ('patient_response', 'adverse_reaction', 'adverse_reaction_details')
        }),
        ('Observation', {
            'fields': ('requires_observation', 'observation_duration_minutes', 'observation_completed')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'patient__user', 'visit', 'ordered_by', 'administered_by'
        )


@admin.register(Immunization)
class ImmunizationAdmin(admin.ModelAdmin):
    list_display = ['patient', 'vaccine_name', 'dose_number', 'total_doses_required', 'administered_date', 'next_dose_due']
    list_filter = ['vaccine_type', 'administered_date', 'adverse_reaction', 'vaccine_certificate_generated']
    search_fields = ['patient__user__first_name', 'patient__user__last_name', 'vaccine_name']
    date_hierarchy = 'administered_date'

    fieldsets = (
        ('Patient', {
            'fields': ('patient',)
        }),
        ('Vaccine Details', {
            'fields': ('vaccine_name', 'vaccine_type', 'dose_number', 'total_doses_required')
        }),
        ('Administration', {
            'fields': ('administered_by', 'administered_date', 'administration_site')
        }),
        ('Vaccine Tracking', {
            'fields': ('manufacturer', 'lot_number', 'expiry_date')
        }),
        ('Follow-up', {
            'fields': ('next_dose_due',)
        }),
        ('Reaction', {
            'fields': ('adverse_reaction', 'reaction_details')
        }),
        ('Documentation', {
            'fields': ('vaccine_certificate_generated', 'notes')
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('patient__user', 'administered_by')