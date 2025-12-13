#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymapp.settings')
django.setup()

from authentication.models import User
from django.utils import timezone

# Check trainers with expired trials
expired = User.objects.filter(
    user_type='trainer',
    subscription_status__in=['trial', 'expired'],
    trial_end_date__lt=timezone.now().date(),
    account_blocked=False
)

print(f'Total expired trial trainers: {expired.count()}')
print('\nDetails:')
for trainer in expired:
    days_expired = (timezone.now().date() - trainer.trial_end_date).days if trainer.trial_end_date else 0
    print(f'  - {trainer.username}:')
    print(f'      status: {trainer.subscription_status}')
    print(f'      trial_end: {trainer.trial_end_date}')
    print(f'      days_expired: {days_expired}')
    print(f'      blocked: {trainer.account_blocked}')
    print()

# Also check what the analytics endpoint would return
blocked_count = User.objects.filter(user_type='trainer', account_blocked=True).count()
print(f'Total blocked trainers: {blocked_count}')
