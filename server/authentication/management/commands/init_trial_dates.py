"""
Management command to initialize trial dates for existing trainers
Run this once: python manage.py init_trial_dates
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from authentication.models import User


class Command(BaseCommand):
    help = 'Initialize trial dates for trainers who do not have them set'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without actually updating',
        )
        parser.add_argument(
            '--trial-days',
            type=int,
            default=14,
            help='Number of trial days to set (default: 14)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        trial_days = options['trial_days']

        # Find trainers without trial dates
        trainers_to_update = User.objects.filter(
            user_type='trainer',
            trial_start_date__isnull=True
        )

        count = trainers_to_update.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('All trainers already have trial dates set'))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY RUN: Would initialize trial dates for {count} trainer(s):'))
            for trainer in trainers_to_update:
                self.stdout.write(f'  - {trainer.username} ({trainer.email})')
                self.stdout.write(f'      Current status: {trainer.subscription_status or "None"}')
                self.stdout.write(f'      Joined: {trainer.date_joined.date()}')
        else:
            updated_count = 0
            for trainer in trainers_to_update:
                # Set trial start to when they joined (or today if that's in the future)
                trial_start = min(trainer.date_joined.date(), timezone.now().date())

                # Set trial end to 14 days after trial start
                trial_end = trial_start + timedelta(days=trial_days)

                trainer.trial_start_date = trial_start
                trainer.trial_end_date = trial_end

                # Set subscription status based on whether trial has expired
                if timezone.now().date() > trial_end:
                    trainer.subscription_status = 'expired'
                else:
                    trainer.subscription_status = 'trial'

                # Set plan type if not set
                if not trainer.plan_type:
                    trainer.plan_type = 'trial'

                # Set client limit if not set
                if trainer.client_limit is None:
                    trainer.client_limit = 5  # Default for trial

                trainer.save(update_fields=[
                    'trial_start_date',
                    'trial_end_date',
                    'subscription_status',
                    'plan_type',
                    'client_limit'
                ])
                updated_count += 1

                days_since_join = (timezone.now().date() - trial_start).days
                status = 'EXPIRED' if trainer.subscription_status == 'expired' else 'ACTIVE'

                self.stdout.write(
                    f'Updated {trainer.username}: '
                    f'trial {trial_start} to {trial_end} '
                    f'({days_since_join} days since join) - {status}'
                )

            self.stdout.write(
                self.style.SUCCESS(f'Successfully initialized trial dates for {updated_count} trainer(s)')
            )
