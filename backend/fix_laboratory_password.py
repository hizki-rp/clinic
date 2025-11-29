#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_api.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

try:
    lab = User.objects.get(username='laboratory')
    lab.set_password('laboratory123')
    lab.save()
    print('✓ Password updated for laboratory user')
except User.DoesNotExist:
    print('✗ Laboratory user not found')
