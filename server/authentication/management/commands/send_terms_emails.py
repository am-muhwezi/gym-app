"""
Management command to send terms and conditions notification emails to all users
who haven't accepted the terms yet.

Usage:
    python manage.py send_terms_emails
    python manage.py send_terms_emails --dry-run  # Preview without sending
    python manage.py send_terms_emails --user-type trainer  # Send to trainers only
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from authentication.models import User, TermsAcceptance
from authentication.gmail_utils import send_terms_notification_email
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send terms and conditions notification emails to users who have not accepted them'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview the emails that would be sent without actually sending them'
        )
        parser.add_argument(
            '--user-type',
            type=str,
            choices=['trainer', 'client', 'admin'],
            help='Filter users by type (default: all users)'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        user_type = options.get('user_type')

        # Build terms URL
        terms_url = f"{settings.FRONTEND_URL}/#/terms"
        # Or use the backend URL if you want users to view it directly on the backend
        # terms_url = f"{settings.BACKEND_URL}/api/auth/terms/"

        # Get all users who have not accepted terms
        users_query = User.objects.exclude(terms_acceptance__isnull=False)

        # Filter by user type if specified
        if user_type:
            users_query = users_query.filter(user_type=user_type)

        users_to_notify = users_query.select_related().all()
        total_users = users_to_notify.count()

        if total_users == 0:
            self.stdout.write(self.style.SUCCESS('No users need to be notified. All users have accepted the terms!'))
            return

        self.stdout.write(f'\nFound {total_users} user(s) who have not accepted the terms.\n')

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No emails will be sent\n'))
            self.stdout.write('Users who would receive emails:')
            for user in users_to_notify:
                self.stdout.write(f'  - {user.username} ({user.email}) - {user.user_type}')
            return

        # Ask for confirmation
        confirm = input(f'\nDo you want to send terms notification emails to {total_users} user(s)? (yes/no): ')

        if confirm.lower() not in ['yes', 'y']:
            self.stdout.write(self.style.WARNING('Operation cancelled.'))
            return

        # Send emails
        success_count = 0
        failure_count = 0

        self.stdout.write('\nSending emails...\n')

        for user in users_to_notify:
            try:
                email_sent = send_terms_notification_email(
                    user_email=user.email,
                    username=user.username,
                    terms_url=terms_url
                )

                if email_sent:
                    success_count += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Sent to {user.username} ({user.email})'))
                else:
                    failure_count += 1
                    self.stdout.write(self.style.ERROR(f'✗ Failed to send to {user.username} ({user.email})'))

            except Exception as e:
                failure_count += 1
                self.stdout.write(self.style.ERROR(f'✗ Error sending to {user.username} ({user.email}): {str(e)}'))
                logger.error(f'Error sending terms email to {user.email}: {str(e)}')

        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'Successfully sent: {success_count}'))
        if failure_count > 0:
            self.stdout.write(self.style.ERROR(f'Failed to send: {failure_count}'))
        self.stdout.write('='*60)
