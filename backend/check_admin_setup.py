#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from healthcare.models import StaffProfile

User = get_user_model()

def check_admin_setup():
    print("=== ADMIN SETUP CHECK ===")
    
    # Check admin users
    admin_users = User.objects.filter(is_superuser=True)
    print(f"\nAdmin users found: {admin_users.count()}")
    for admin in admin_users:
        print(f"- {admin.username} (Email: {admin.email}, Role: {admin.role}, is_staff: {admin.is_staff})")
    
    # Check staff users
    staff_users = User.objects.filter(role__in=['reception', 'doctor', 'laboratory'])
    print(f"\nStaff users found: {staff_users.count()}")
    for staff in staff_users:
        has_profile = hasattr(staff, 'staff_profile')
        print(f"- {staff.get_full_name()} ({staff.role}) - Has StaffProfile: {has_profile}")
    
    # Check staff profiles
    staff_profiles = StaffProfile.objects.all()
    print(f"\nStaff profiles found: {staff_profiles.count()}")
    for profile in staff_profiles:
        print(f"- {profile.employee_id}: {profile.user.get_full_name()} ({profile.department})")
    
    print("\n=== RECOMMENDATIONS ===")
    if admin_users.count() == 0:
        print("❌ No admin users found. Create a superuser with: python manage.py createsuperuser")
    else:
        for admin in admin_users:
            if not admin.is_staff:
                print(f"⚠️  Admin user {admin.username} doesn't have is_staff=True")
    
    if staff_users.count() > staff_profiles.count():
        print("⚠️  Some staff users don't have StaffProfile. Run: python manage.py setup_staff")
    
    if staff_profiles.count() > 0:
        print("✅ Staff management should be visible in Django admin!")
    else:
        print("❌ No staff profiles found. Staff management won't show in admin.")

if __name__ == "__main__":
    check_admin_setup()