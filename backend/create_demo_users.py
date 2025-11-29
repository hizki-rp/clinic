#!/usr/bin/env python
"""
Create demo users for the clinic management system
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from healthcare.models import Patient

User = get_user_model()

def create_demo_users():
    """Create demo users with different roles"""
    
    users_data = [
        {
            'username': 'admin',
            'password': 'admin123',
            'email': 'admin@clinic.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'username': 'doctor',
            'password': 'doctor123',
            'email': 'doctor@clinic.com',
            'first_name': 'Dr. John',
            'last_name': 'Smith',
            'role': 'doctor',
            'specialization': 'General Medicine',
            'license_number': 'DOC-001',
        },
        {
            'username': 'doctor1',
            'password': 'doctor123',
            'email': 'doctor1@clinic.com',
            'first_name': 'Dr. Sarah',
            'last_name': 'Johnson',
            'role': 'doctor',
            'specialization': 'Pediatrics',
            'license_number': 'DOC-002',
        },
        {
            'username': 'reception',
            'password': 'reception123',
            'email': 'reception@clinic.com',
            'first_name': 'Mary',
            'last_name': 'Williams',
            'role': 'reception',
            'department': 'Front Desk',
        },
        {
            'username': 'reception1',
            'password': 'reception123',
            'email': 'reception1@clinic.com',
            'first_name': 'Jane',
            'last_name': 'Brown',
            'role': 'reception',
            'department': 'Front Desk',
        },
        {
            'username': 'laboratory',
            'password': 'laboratory123',
            'email': 'laboratory@clinic.com',
            'first_name': 'Robert',
            'last_name': 'Davis',
            'role': 'laboratory',
            'department': 'Laboratory',
            'license_number': 'LAB-001',
        },
        {
            'username': 'lab1',
            'password': 'lab123',
            'email': 'lab1@clinic.com',
            'first_name': 'Michael',
            'last_name': 'Wilson',
            'role': 'laboratory',
            'department': 'Laboratory',
            'license_number': 'LAB-002',
        },
        {
            'username': 'triage',
            'password': 'triage123',
            'email': 'triage@clinic.com',
            'first_name': 'Emily',
            'last_name': 'Martinez',
            'role': 'staff',  # Using 'staff' role for triage nurse
            'department': 'Triage',
            'specialization': 'Triage Nurse',
            'license_number': 'NUR-001',
        },
        {
            'username': 'nurse',
            'password': 'nurse123',
            'email': 'nurse@clinic.com',
            'first_name': 'Lisa',
            'last_name': 'Anderson',
            'role': 'staff',
            'department': 'Nursing',
            'specialization': 'Registered Nurse',
            'license_number': 'NUR-002',
        },
        {
            'username': 'patient1',
            'password': 'patient123',
            'email': 'patient1@clinic.com',
            'first_name': 'James',
            'last_name': 'Taylor',
            'role': 'patient',
            'phone_number': '555-0101',
            'date_of_birth': '1985-05-15',
        },
        {
            'username': 'patient2',
            'password': 'patient123',
            'email': 'patient2@clinic.com',
            'first_name': 'Emma',
            'last_name': 'Thomas',
            'role': 'patient',
            'phone_number': '555-0102',
            'date_of_birth': '1990-08-22',
        },
    ]
    
    created_users = []
    
    for user_data in users_data:
        username = user_data['username']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"✓ User '{username}' already exists")
            user = User.objects.get(username=username)
            created_users.append(user)
            continue
        
        # Extract password and username before creating user
        password = user_data.pop('password')
        user_data.pop('username')  # Remove username from dict since we pass it separately
        
        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            **user_data
        )
        
        print(f"✓ Created user: {username} ({user.role})")
        created_users.append(user)
        
        # Create patient profile if role is patient
        if user.role == 'patient':
            patient, created = Patient.objects.get_or_create(
                user=user,
                defaults={
                    'age': 35 if 'James' in user.first_name else 33,
                    'gender': 'male' if 'James' in user.first_name else 'female',
                    'phone': user.phone_number,
                    'address': '123 Main St, City',
                    'emergency_contact_name': 'Emergency Contact',
                    'emergency_contact_phone': '555-9999',
                }
            )
            if created:
                print(f"  → Created patient profile: {patient.patient_id}")
    
    print(f"\n✅ Total users in database: {User.objects.count()}")
    print(f"   - Admins: {User.objects.filter(role='admin').count()}")
    print(f"   - Doctors: {User.objects.filter(role='doctor').count()}")
    print(f"   - Reception: {User.objects.filter(role='reception').count()}")
    print(f"   - Laboratory: {User.objects.filter(role='laboratory').count()}")
    print(f"   - Staff (Triage/Nurses): {User.objects.filter(role='staff').count()}")
    print(f"   - Patients: {User.objects.filter(role='patient').count()}")
    
    return created_users

if __name__ == '__main__':
    print("Creating demo users...\n")
    create_demo_users()
    print("\n✅ Demo users created successfully!")
    print("\nLogin credentials:")
    print("  Admin:      admin / admin123")
    print("  Doctor:     doctor / doctor123")
    print("  Reception:  reception / reception123")
    print("  Laboratory: laboratory / laboratory123")
    print("  Triage:     triage / triage123")
    print("  Nurse:      nurse / nurse123")
    print("  Patient:    patient1 / patient123")
