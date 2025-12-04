# Backend Server Restart Instructions

The Django backend server needs to be restarted to pick up the latest code changes.

## Changes Made:
1. Fixed appointment timezone comparison issue in `AppointmentSerializer`
2. Fixed patient update to handle nested user data properly in `PatientViewSet`

## To Restart the Backend:

### If running with Python directly:
1. Stop the current server (Ctrl+C in the terminal)
2. Navigate to backend directory: `cd backend`
3. Start the server: `python manage.py runserver`

### If running with Docker:
```bash
docker-compose restart
```

### If running as a service:
```bash
# Stop
sudo systemctl stop clinic-backend

# Start
sudo systemctl start clinic-backend
```

## Verify the Fix:
After restarting, test:
1. **Appointment Creation**: Go to admin dashboard → Appointments → Create new appointment
2. **Patient Edit**: Go to Patient Management → Search patient → Edit tab → Change patient info → Save

Both should now work without errors!
