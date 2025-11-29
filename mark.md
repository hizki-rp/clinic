# Menaharia Medium Clinic - Healthcare Management System

## Project Overview

**Menaharia Medium Clinic** is a comprehensive healthcare management system built with Django REST Framework backend and React/Vite frontend. The system provides complete clinic operations management including patient registration, appointment scheduling, medical records, staff management, and more.

## 🏗️ System Architecture

### Technology Stack

**Backend:**
- **Framework:** Django 5.2.5 with Django REST Framework
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **Authentication:** JWT with Simple JWT
- **Task Queue:** Celery with Redis
- **Email:** SMTP (Gmail)
- **Deployment:** Render with WhiteNoise for static files

**Frontend:**
- **Framework:** React 18.3.1 with Vite 7.2.2
- **Language:** TypeScript + JavaScript (JSX)
- **Styling:** Tailwind CSS 3.4.18
- **UI Components:** Radix UI + Custom Components
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form with Zod validation
- **Routing:** React Router DOM 6.28.0

## 📁 Project Structure

### Backend Structure (`/backend`)

```
backend/
├── authentication/           # User authentication & role management
│   ├── models.py            # Custom User model with roles
│   ├── views.py             # Auth endpoints (login, register, profile)
│   ├── serializers.py       # User serialization
│   ├── permissions.py       # Role-based permissions
│   └── management/commands/ # Default user creation
├── healthcare/              # Core healthcare functionality
│   ├── models.py           # Patient, Visit, Appointment, etc.
│   ├── views.py            # Healthcare API endpoints
│   ├── serializers.py      # Healthcare data serialization
│   └── admin.py            # Django admin configuration
├── university_api/         # Main Django project
│   ├── settings.py         # Django configuration
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI application
├── media/                  # User uploaded files
├── templates/              # Django templates
├── requirements.txt        # Python dependencies
├── manage.py              # Django management script
└── docker-compose.yml     # Docker configuration
```

### Frontend Structure (`/frontend`)

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Radix UI components (shadcn/ui)
│   │   ├── Layout.tsx     # Main application layout
│   │   ├── Navbar.jsx     # Navigation bar
│   │   ├── AuthProvider.tsx # Authentication context
│   │   ├── ThemeProvider.tsx # Theme management
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── pages/             # Application pages
│   │   ├── Home.jsx       # Landing page
│   │   ├── Login.tsx      # Authentication page
│   │   ├── Admin.tsx      # Admin dashboard
│   │   ├── Queue.tsx      # Patient queue management
│   │   ├── PatientManagement.tsx # Patient CRUD
│   │   ├── StaffManagement.tsx # Staff management
│   │   ├── Appointments.jsx # Appointment management
│   │   ├── Reports.jsx    # Analytics & reports
│   │   └── Settings.jsx   # System settings
│   ├── lib/               # Utility libraries
│   │   ├── api.ts         # API client configuration
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── utils.ts       # Utility functions
│   │   └── constants.ts   # Application constants
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   ├── styles/            # Styling files
│   │   ├── globals.css    # Global CSS with Tailwind
│   │   └── theme.ts       # Theme configuration
│   └── utils/             # Utility functions
├── public/                # Static assets
│   └── assets/icons/      # SVG icons
├── package.json           # Node.js dependencies
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite build configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎨 Design System & Theme

### Color Palette

**Primary Colors:**
- **Background:** `#1C1F2E` (Dark slate)
- **Card Background:** `#081226` (Darker blue)
- **Input Background:** `#040C1D` (Very dark blue)
- **Text Primary:** `#FFFFFF` (White)
- **Text Secondary:** `#A6AAB2` (Light gray)
- **Border:** `hsl(var(--border))` (CSS custom properties)

**Status Colors:**
- **Appointments:** `#7ce0c3` (Soothing green)
- **Pending:** `#8ab7ff` (Friendly blue)
- **Cancelled:** `#ff9a9a` (Soft red)
- **Lab:** `#f0c47b` (Warm orange)
- **Discharged:** `#b2aaff` (Calming purple)

**Accent Colors:**
- **Primary:** `#3A8DFF` (Blue)
- **Success:** `#24AE7C` (Green)
- **Warning:** `#FFA500` (Orange)

### Typography

**Font Family:** Plus Jakarta Sans (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700
- **Usage:** Consistent across all components

**Font Sizes:**
- Headers: 24px, 30px, 36px
- Body: 14px, 16px, 18px
- Small: 10px, 12px

### UI Components

**Built with Radix UI + Custom Styling:**
- Buttons, Cards, Dialogs, Dropdowns
- Tables, Forms, Inputs, Selects
- Toasts, Alerts, Badges
- Sidebar, Tabs, Accordions

## 🔐 Authentication & Authorization

### User Roles

1. **Patient** - End users receiving medical care
2. **Reception** - Front desk staff managing appointments
3. **Doctor** - Medical professionals providing consultations
4. **Laboratory** - Lab technicians handling test results
5. **Staff** - General staff members
6. **Admin** - System administrators

### Permission System

**Role-Based Access Control:**
- Custom permission classes for each role
- JWT tokens with role information
- Protected routes in frontend
- API endpoint restrictions

**Authentication Flow:**
1. User login with username/password
2. JWT token generation with role claims
3. Token storage in frontend
4. Automatic token refresh
5. Role-based navigation and features

## 🏥 Core Features

### 1. Patient Management
- **Patient Registration:** Complete patient profiles with medical history
- **Patient Search:** Advanced filtering and search capabilities
- **Medical Records:** Comprehensive EHR system

### 2. Appointment System
- **Appointment Scheduling:** Date/time booking with doctor assignment
- **Status Tracking:** Scheduled, confirmed, in-progress, completed, cancelled
- **Calendar View:** Visual appointment management
- **Automated Notifications:** Email/SMS reminders

### 3. Medical Records (EHR)
- **Visit Tracking:** Complete visit history with stages
- **Diagnosis & Treatment:** Doctor assessments and treatment plans
- **Prescriptions:** Medication management with dosage tracking
- **Lab Tests:** Test ordering, results, and interpretation
- **Medical History:** Chronic conditions, allergies, medications

### 4. Staff Management
- **Staff Profiles:** Employee information and credentials
- **Shift Management:** Schedule tracking and management
- **Payroll System:** Automated payroll calculation
- **Performance Reviews:** Staff evaluation and feedback

### 5. Laboratory Management
- **Test Ordering:** Doctor-initiated lab test requests
- **Results Entry:** Lab technician result input
- **Status Tracking:** Requested, in-progress, completed
- **Report Generation:** Formatted lab reports

### 6. Patient Queue Management
- **Real-time Queue:** Live patient status updates with role-based access for doctors
- **Stage Progression:** Waiting room → Questioning → Lab → Doctor → Discharged
- **Priority Handling:** Urgent vs standard patient prioritization
- **Doctor Workflow:** Single unified queue view for doctors
- **Navigation Fix:** Eliminate duplicate "Patient Queue" entries in sidebar for doctor role
- **Staff Workflow:** Role-based queue interactions

**Implementation Fix for Duplicate Queue:**
```javascript
// In Navbar.jsx - Role-based navigation filtering
const getNavigationItems = (userRole) => {
  const baseItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
  ];
  
  if (userRole === 'doctor') {
    return [
      ...baseItems,
      { name: 'Patient Queue', path: '/queue', icon: QueueIcon }, // Single entry only
      { name: 'Appointments', path: '/appointments', icon: CalendarIcon },
    ];
  }
  // Other role configurations...
};
```

### 7. UI Consistency Implementation
- **Settings Page:** Black input backgrounds, consistent card colors, unified theme
- **Reports & Analytics:** Consistent metric cards, themed report sections
- **Appointments Page:** Full functionality with database integration
- **Patient Management:** Consistent with Staff Management using Card components
- **Staff Management:** Template for consistent card-based design
- **Home Page:** Rolled back to standard styling, removed unnecessary theme classes
- **Cross-Page Consistency:** Management pages use identical Card component patterns
- **Theme Standardization:** All pages use the established color palette without custom theme classes

### 8. Appointments System Enhancement
- **Django Backend Integration:** Full CRUD operations with Django REST Framework
- **Database Persistence:** Appointments stored in Django admin via Appointment model
- **Searchable Patient Selection:** Search patients by name, phone, age, or emergency contact
- **Date Filtering:** Filter appointments by selected date with real-time updates
- **API Endpoints:** RESTful API with proper serialization and validation
- **Form Validation:** Comprehensive validation before appointment creation
- **User Feedback:** Success/error messages for all operations
- **Permission System:** Uses `permissions.AllowAny` for development compatibility

**Django Backend Integration:**
```python
# Appointment Model (backend/healthcare/models.py)
class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'})
    appointment_date = models.DateTimeField()
    reason = models.CharField(max_length=200)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
```

**API Implementation:**
```javascript
// Create appointment with Django backend
const createAppointment = async () => {
  const appointmentData = {
    patient: patientId,
    appointment_date: `${date}T${time}:00`,
    reason: type,
    status: 'scheduled'
  };
  
  const response = await fetch('http://localhost:8000/api/healthcare/appointments/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointmentData)
  });
  
  if (response.ok) {
    fetchAppointments(); // Refresh from Django backend
    alert('Appointment saved to Django admin!');
  }
};

// Fetch appointments from Django backend
const fetchAppointments = async () => {
  const response = await fetch('http://localhost:8000/api/healthcare/appointments/');
  const data = await response.json();
  // Format appointments from Django serializer
  const formattedAppointments = data.map(apt => ({
    id: apt.id,
    patient: apt.patient?.user?.first_name + ' ' + apt.patient?.user?.last_name,
    doctor: apt.doctor?.first_name + ' ' + apt.doctor?.last_name,
    type: apt.reason,
    status: apt.status,
    date: new Date(apt.appointment_date).toISOString().split('T')[0]
  }));
};
```

**Complete UI Theme Implementation:**
```css
/* Standardized Theme Colors */
:root {
  --background: #1C1F2E;        /* Main background */
  --card-bg: #081226;           /* Card backgrounds */
  --input-bg: #040C1D;          /* Input backgrounds */
  --text-primary: #FFFFFF;      /* Primary text */
  --text-secondary: #A6AAB2;    /* Secondary text */
  --border: hsl(var(--border)); /* Consistent borders */
  --accent-blue: #3A8DFF;       /* Primary accent */
  --status-green: #7ce0c3;      /* Success/completed */
  --status-orange: #f0c47b;     /* Warning/pending */
  --status-red: #ff9a9a;        /* Error/cancelled */
  --status-blue: #8ab7ff;       /* Info/pending */
}
```

**Component Styling Standards:**
```jsx
// Consistent card styling
const ThemeCard = ({ children }) => (
  <div className="p-6 rounded-lg border" 
       style={{backgroundColor: '#081226', borderColor: 'hsl(var(--border))'}}>
    {children}
  </div>
);

// Consistent input styling
const ThemeInput = (props) => (
  <input {...props} 
         className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
         style={{backgroundColor: '#040C1D', borderColor: 'hsl(var(--border))', color: '#FFFFFF'}} />
);
```

### 8. Reports & Analytics
- **Dashboard Statistics:** Key performance indicators
- **Patient Analytics:** Visit trends and demographics
- **Staff Performance:** Productivity metrics
- **Financial Reports:** Revenue and billing analytics

## 🗄️ Database Schema

### Key Models

**User Model (Custom):**
```python
class User(AbstractUser):
    role = CharField(choices=ROLE_CHOICES)
    phone_number = CharField()
    date_of_birth = DateField()
    medical_history = TextField()  # For patients
    license_number = CharField()   # For staff
    specialization = CharField()   # For doctors
```

**Patient Model:**
```python
class Patient(models.Model):
    user = OneToOneField(User)
    patient_id = CharField(unique=True)
    age = PositiveIntegerField()
    gender = CharField(choices=GENDER_CHOICES)
    medical_history = TextField()
    allergies = TextField()
    emergency_contact_name = CharField()
    priority = CharField(choices=PRIORITY_CHOICES)
```

**Visit Model:**
```python
class Visit(models.Model):
    patient = ForeignKey(Patient)
    stage = CharField(choices=STAGE_CHOICES)
    check_in_time = DateTimeField()
    chief_complaint = TextField()
    diagnosis = TextField()
    attending_doctor = ForeignKey(User)
```

**Appointment Model:**
```python
class Appointment(models.Model):
    patient = ForeignKey(Patient)
    doctor = ForeignKey(User)
    appointment_date = DateTimeField()
    status = CharField(choices=STATUS_CHOICES)
    reason = CharField()
```

## 🔧 Development Setup

### Backend Setup

1. **Environment Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Database Setup:**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py create_default_users
```

3. **Run Development Server:**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Install Dependencies:**
```bash
cd frontend
npm install
```

2. **Environment Variables:**
```bash
# .env
VITE_API_URL=http://localhost:8000/api
```

3. **Run Development Server:**
```bash
npm run dev
```

### Default Test Accounts

- **Admin:** `admin` / `admin123`
- **Patient:** `patient1` / `patient123`
- **Reception:** `reception1` / `reception123`
- **Doctor:** `doctor1` / `doctor123`
- **Laboratory:** `lab1` / `lab123`

## 🚀 Deployment

### Backend Deployment (Render)
- PostgreSQL database
- WhiteNoise for static files
- Environment variables for configuration
- Celery for background tasks

### Frontend Deployment
- Vite build optimization
- Static file serving
- Environment-specific API URLs

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - User profile
- `POST /api/auth/token/refresh/` - Token refresh

### Healthcare
- `GET /api/healthcare/patients/` - List patients
- `POST /api/healthcare/patients/` - Create patient
- `GET /api/healthcare/visits/` - List visits
- `POST /api/healthcare/visits/` - Create visit
- `GET /api/healthcare/appointments/` - List appointments
- `POST /api/healthcare/appointments/` - Create appointment

### Staff Management
- `GET /api/healthcare/staff/` - List staff
- `POST /api/healthcare/staff/` - Create staff
- `GET /api/healthcare/shifts/` - List shifts
- `POST /api/healthcare/payroll/` - Generate payroll

## 🎯 Key Features for New Developers

### 1. Component Architecture
- **Reusable Components:** Consistent UI components with Radix UI
- **Theme System:** Centralized theme management with CSS variables
- **Type Safety:** TypeScript for better development experience

### 2. State Management
- **Context Providers:** Authentication, Theme, Patient Queue
- **Custom Hooks:** Reusable logic for API calls and state
- **Form Handling:** React Hook Form with Zod validation

### 3. API Integration
- **Centralized API Client:** Axios-based API client with interceptors
- **Error Handling:** Consistent error handling across the application
- **Loading States:** Proper loading and error states

### 4. Security Features
- **JWT Authentication:** Secure token-based authentication
- **Role-Based Access:** Granular permission system
- **Input Validation:** Both frontend and backend validation
- **CORS Configuration:** Proper cross-origin resource sharing

## 📝 Development Guidelines

### Code Style
- **ESLint + Prettier:** Consistent code formatting
- **TypeScript:** Type safety where applicable
- **Component Naming:** PascalCase for components, camelCase for functions
- **File Organization:** Feature-based folder structure

### Best Practices
- **Error Boundaries:** Proper error handling in React
- **Loading States:** User feedback during async operations
- **Responsive Design:** Mobile-first approach with Tailwind
- **Accessibility:** ARIA labels and keyboard navigation

### Testing Strategy
- **Unit Tests:** Component and utility function testing
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Critical user flow testing

## 🔮 Future Enhancements

### Planned Features
1. **Telemedicine:** Video consultation integration
2. **Mobile App:** React Native mobile application
3. **AI Integration:** Symptom analysis and diagnosis assistance
4. **Billing System:** Insurance and payment processing
5. **Inventory Management:** Medical supplies and equipment tracking
6. **Multi-location:** Support for multiple clinic branches

### Technical Improvements
1. **Real-time Updates:** WebSocket integration for live updates
2. **Offline Support:** PWA capabilities for offline access
3. **Performance Optimization:** Code splitting and lazy loading
4. **Advanced Analytics:** Business intelligence dashboard
5. **API Documentation:** Swagger/OpenAPI documentation

## 📞 Support & Maintenance

### Monitoring
- **Error Tracking:** Sentry integration for error monitoring
- **Performance Monitoring:** Application performance metrics
- **Database Monitoring:** Query optimization and indexing

### Backup & Recovery
- **Database Backups:** Automated daily backups
- **File Storage:** Secure media file storage
- **Disaster Recovery:** Recovery procedures and documentation

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintainer:** Development Team

This documentation provides a comprehensive overview of the Menaharia Medium Clinic system. For specific implementation details, refer to the individual component documentation and code comments.