from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create default users for testing'

    def handle(self, *args, **options):
        # Create superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@careable.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='reception'
            )
            self.stdout.write(
                self.style.SUCCESS('Successfully created admin user')
            )

        # Create test users for each role
        test_users = [
            {
                'username': 'patient1',
                'email': 'patient1@careable.com',
                'password': 'patient123',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'patient',
                'phone_number': '+1234567890',
                'date_of_birth': '1990-01-01',
                'address': '123 Main St, City, State',
                'emergency_contact': 'Jane Doe',
                'emergency_phone': '+1234567891',
                'medical_history': 'No significant medical history',
                'allergies': 'None known',
                'current_medications': 'None'
            },
            {
                'username': 'reception1',
                'email': 'reception1@careable.com',
                'password': 'reception123',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'role': 'reception',
                'phone_number': '+1234567892',
                'license_number': 'REC001',
                'department': 'Front Desk'
            },
            {
                'username': 'doctor1',
                'email': 'doctor1@careable.com',
                'password': 'doctor123',
                'first_name': 'Dr. Robert',
                'last_name': 'Smith',
                'role': 'doctor',
                'phone_number': '+1234567893',
                'license_number': 'MD001',
                'department': 'Internal Medicine',
                'specialization': 'General Practice'
            },
            {
                'username': 'lab1',
                'email': 'lab1@careable.com',
                'password': 'lab123',
                'first_name': 'Sarah',
                'last_name': 'Wilson',
                'role': 'laboratory',
                'phone_number': '+1234567894',
                'license_number': 'LAB001',
                'department': 'Laboratory',
                'specialization': 'Clinical Laboratory Science'
            }
        ]

        for user_data in test_users:
            if not User.objects.filter(username=user_data['username']).exists():
                password = user_data.pop('password')
                user = User.objects.create_user(password=password, **user_data)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created {user.role} user: {user.username}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User {user_data["username"]} already exists')
                )

        self.stdout.write(
            self.style.SUCCESS('\nDefault users created successfully!')
        )
        self.stdout.write('Login credentials:')
        self.stdout.write('Admin: admin / admin123')
        self.stdout.write('Patient: patient1 / patient123')
        self.stdout.write('Reception: reception1 / reception123')
        self.stdout.write('Doctor: doctor1 / doctor123')
        self.stdout.write('Laboratory: lab1 / lab123')