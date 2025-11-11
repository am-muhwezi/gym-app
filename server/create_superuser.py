#!/usr/bin/env python
"""
Quick script to create a superuser for testing
Run: python create_superuser.py
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymapp.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create superuser if doesn't exist
if not User.objects.filter(username='admin').exists():
    user = User.objects.create_superuser(
        username='admin',
        email='admin@gympal.com',
        password='admin123',
        phone_number='+1234567890'
    )
    print(f'✅ Superuser created successfully!')
    print(f'   Username: admin')
    print(f'   Password: admin123')
    print(f'   Email: admin@gympal.com')
else:
    print('ℹ️  Superuser "admin" already exists')
