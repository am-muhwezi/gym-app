"""
Management command to auto-block trainers with expired trials
Run this periodically via cron: python manage.py block_expired_trials
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from authentication.models import User


class Command(BaseCommand):
    help = 'Auto-block trainer accounts with expired trial periods'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be blocked without actually blocking',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # Find all trainers who should be auto-blocked
        # Include both 'trial' and 'expired' status (admin can prevent by setting to 'active')
        trainers_to_block = User.objects.filter(
            user_type='trainer',
            subscription_status__in=['trial', 'expired'],
            trial_end_date__lt=timezone.now().date(),
            account_blocked=False
        )

        count = trainers_to_block.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('No trainers with expired trials found'))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY RUN: Would block {count} trainer(s):'))
            for trainer in trainers_to_block:
                days_expired = (timezone.now().date() - trainer.trial_end_date).days
                self.stdout.write(
                    f'  - {trainer.username} ({trainer.email}) - Trial expired {days_expired} day(s) ago'
                )
        else:
            # Block all expired trial accounts
            blocked_count = 0
            for trainer in trainers_to_block:
                trainer.account_blocked = True
                trainer.block_reason = 'Your 14-day trial period has expired. Please contact support to upgrade your subscription.'
                trainer.blocked_at = timezone.now()
                trainer.save(update_fields=['account_blocked', 'block_reason', 'blocked_at'])
                blocked_count += 1

                days_expired = (timezone.now().date() - trainer.trial_end_date).days
                self.stdout.write(
                    f'Blocked: {trainer.username} ({trainer.email}) - Trial expired {days_expired} day(s) ago'
                )

            self.stdout.write(
                self.style.SUCCESS(f'Successfully auto-blocked {blocked_count} trainer(s) with expired trials')
            )
