# Careable Authentication System

## Overview
This Django backend now includes a role-based authentication system designed for healthcare management with four distinct user roles:

- **Patient**: End users who receive medical care
- **Reception**: Front desk staff who manage appointments and patient registration
- **Doctor**: Medical professionals who provide consultations and prescriptions
- **Laboratory**: Lab technicians who handle test results

## Database Changes

### Custom User Model
The system now uses a custom User model (`authentication.User`) that extends Django's AbstractUser with additional fields:

**Common Fields:**
- `role`: User role (patient/reception/doctor/laboratory)
- `phone_number`: Contact number
- `date_of_birth`: Birth date
- `address`: Physical address
- `emergency_contact`: Emergency contact name
- `emergency_phone`: Emergency contact number

**Patient-Specific Fields:**
- `medical_history`: Medical background
- `allergies`: Known allergies
- `current_medications`: Current medications

**Staff-Specific Fields:**
- `license_number`: Professional license number
- `department`: Department/unit
- `specialization`: Area of expertise

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/auth/register/` - User registration

### User Management
- `GET /api/auth/profile/` - Get/update user profile
- `GET /api/auth/role-info/` - Get current user's role information
- `GET /api/auth/dashboard-stats/` - Get role-specific dashboard statistics

### Staff Endpoints (Staff Only)
- `GET /api/auth/patients/` - List all patients
- `GET /api/auth/staff/` - List all staff members
- `GET /api/auth/doctors/` - List all doctors
- `POST /api/auth/create-patient/` - Create patient account (Reception only)

## Permissions

### Custom Permission Classes
- `IsPatient`: Only patients can access
- `IsReception`: Only reception staff can access
- `IsDoctor`: Only doctors can access
- `IsLaboratory`: Only laboratory staff can access
- `IsStaffMember`: Any staff member can access
- `IsPatientOrStaff`: Patients or staff can access
- `IsOwnerOrStaff`: Users can access their own data, staff can access any

## Setup Instructions

1. **Database Migration**
   ```bash
   cd /workspaces/careable/backend/uni-find-api-main
   python manage.py makemigrations authentication
   python manage.py migrate
   ```

2. **Create Default Users**
   ```bash
   python manage.py create_default_users
   ```

3. **Test Login Credentials**
   - Admin: `admin` / `admin123`
   - Patient: `patient1` / `patient123`
   - Reception: `reception1` / `reception123`
   - Doctor: `doctor1` / `doctor123`
   - Laboratory: `lab1` / `lab123`

## JWT Token Structure

The JWT tokens include custom claims:
```json
{
  "user_id": 1,
  "role": "doctor",
  "is_staff_member": true,
  "username": "doctor1",
  "exp": 1234567890
}
```

## Frontend Integration

### Login Response
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "username": "doctor1",
    "email": "doctor1@careable.com",
    "first_name": "Dr. Robert",
    "last_name": "Smith",
    "role": "doctor",
    "is_staff_member": true
  }
}
```

### Role-Based Navigation
Use the `role` field to determine which features to show:
- **Patient**: Appointments, Medical Records, Prescriptions
- **Reception**: Patient Registration, Appointment Management, Queue
- **Doctor**: Patient Consultations, Prescriptions, Medical Records
- **Laboratory**: Test Orders, Results Entry, Reports

## Security Features

1. **Role-Based Access Control**: Each endpoint checks user roles
2. **JWT Authentication**: Secure token-based authentication
3. **Permission Classes**: Granular access control
4. **Data Isolation**: Users can only access their own data (unless staff)

## Next Steps

To complete the healthcare system, you'll need to implement:
1. Appointment management system
2. Medical records and prescriptions
3. Laboratory test management
4. Patient queue system
5. Notification system

The authentication foundation is now ready to support these features with proper role-based access control.