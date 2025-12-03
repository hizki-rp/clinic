# Staff Profile Management

## Overview
The clinic management system now supports comprehensive staff profile management for users who are not patients or doctors. Users with roles other than 'patient' and 'doctor' are eligible for staff management features.

## User Roles
The system supports the following user roles:
- `patient` - Patients receiving medical care
- `reception` - Reception/front desk staff
- `doctor` - Medical doctors
- `laboratory` - Laboratory technicians
- `staff` - General staff members (new role added)

## Staff Eligibility
Users with the following roles are considered staff and eligible for management:
- `reception`
- `doctor` 
- `laboratory`
- `staff`

## Key Features

### 1. Staff Profile Creation
- Automatic employee ID generation (EMP-001, EMP-002, etc.)
- User account creation with role assignment
- Department and specialization tracking
- Employment status management

### 2. Staff Management Endpoints

#### Create Staff Profile
```
POST /api/healthcare/staff/
```
Creates both user account and staff profile.

#### Staff Onboarding
```
POST /api/healthcare/staff/onboard/
```
Simplified staff creation with temporary password generation.

#### Staff Dashboard Statistics
```
GET /api/healthcare/staff/dashboard_stats/
```
Returns staff metrics and department breakdown.

### 3. Shift Management
- Schedule and track staff shifts
- Calendar view for shift planning
- Shift status tracking (scheduled, in_progress, completed, cancelled)

### 4. Payroll Management
- Automatic payroll calculation based on shifts
- Hourly rate tracking
- Deductions and net pay calculation
- Bulk payroll generation for pay periods

### 5. Performance Reviews
- Staff performance tracking
- Rating system (1-5 scale)
- Review period management
- Goals and improvement areas tracking

## API Usage Examples

### Creating a Staff Member
```json
POST /api/healthcare/staff/
{
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@clinic.com",
    "role": "staff",
    "hire_date": "2024-01-15",
    "hourly_rate": "25.00",
    "department": "Administration"
}
```

### Staff Onboarding (Simplified)
```json
POST /api/healthcare/staff/onboard/
{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@clinic.com",
    "role": "reception",
    "department": "Front Desk",
    "phone": "+1234567890"
}
```

## Database Changes
- Added 'staff' role to User.ROLE_CHOICES
- Updated User.is_staff_member property to include 'staff' role
- Migration file created: `0002_add_staff_role.py`

## Implementation Notes
- Staff profiles are automatically linked to user accounts
- Employee IDs are auto-generated sequentially
- All staff management features are accessible through REST API
- Comprehensive filtering, searching, and ordering supported
- Dashboard statistics provide insights into staff metrics