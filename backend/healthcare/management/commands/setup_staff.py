from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from healthcare.models import StaffProfile
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Create staff profiles for existing staff users and ensure admin access'

    def handle(self, *args, **options):
        # Get all staff users (non-patient roles)
        staff_users = User.objects.filter(role__in=['reception', 'doctor', 'laboratory'])
        
        created_count = 0
        for user in staff_users:
            # Check if staff profile already exists
            if not hasattr(user, 'staff_profile'):
                # Generate employee ID
                last_staff = StaffProfile.objects.order_by('-id').first()
                if last_staff:
                    last_id = int(last_staff.employee_id.split('-')[1])
                    employee_id = f"EMP-{str(last_id + 1).zfill(3)}"
                else:
                    employee_id = "EMP-001"
                
                # Create staff profile
                StaffProfile.objects.create(
                    user=user,
                    employee_id=employee_id,
                    hire_date=date.today(),
                    employment_status='active',
                    hourly_rate=25.00,  # Default rate
                    department=user.role.title()
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created staff profile for {user.get_full_name()} ({employee_id})')
                )
        
        # Ensure admin users have staff access
        admin_users = User.objects.filter(is_superuser=True)
        for admin in admin_users:
            admin.is_staff = True
            admin.save()
            self.stdout.write(
                self.style.SUCCESS(f'Ensured admin access for {admin.username}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} staff profiles')
        )
        self.stdout.write(
            self.style.SUCCESS('Staff management should now be visible in admin!')
        )