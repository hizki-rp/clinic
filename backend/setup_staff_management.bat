@echo off
echo Setting up Staff Management for Healthcare System...
echo.

echo Step 1: Checking current setup...
python check_admin_setup.py
echo.

echo Step 2: Creating staff profiles for existing users...
python manage.py setup_staff
echo.

echo Step 3: Final check...
python check_admin_setup.py
echo.

echo Setup complete! You should now see Staff Management in Django admin.
echo Navigate to: http://localhost:8000/admin/
pause