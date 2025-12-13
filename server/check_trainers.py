#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymapp.settings')
django.setup()

from authentication.models import User
from django.utils import timezone

# Check ALL trainers and their subscription details
trainers = User.objects.filter(user_type='trainer')

print(f'Total trainers: {trainers.count()}')
print(f'Today: {timezone.now().date()}\n')

for trainer in trainers:
    print(f'Username: {trainer.username}')
    print(f'  Email: {trainer.email}')
    print(f'  Subscription Status: {trainer.subscription_status}')
    print(f'  Plan Type: {trainer.plan_type}')
    print(f'  Trial Start: {trainer.trial_start_date}')
    print(f'  Trial End: {trainer.trial_end_date}')
    print(f'  Is Trial Active: {trainer.is_trial_active}')
    print(f'  Account Blocked: {trainer.account_blocked}')
    print(f'  Is Active: {trainer.is_active}')

    if trainer.trial_end_date:
        days_diff = (timezone.now().date() - trainer.trial_end_date).days
        print(f'  Days since trial end: {days_diff}')
        print(f'  Should be auto-blocked: {trainer.should_be_auto_blocked}')

    print()
