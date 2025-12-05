from django.core.management.base import BaseCommand, CommandError
from authentication.models import User


class Command(BaseCommand):
    help = 'Make a user an admin or superuser'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to make admin')
        parser.add_argument(
            '--superuser',
            action='store_true',
            help='Also set is_superuser=True (grants all permissions)',
        )

    def handle(self, *args, **options):
        username = options['username']
        make_superuser = options['superuser']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f'User "{username}" does not exist')

        # Update user_type to admin
        user.user_type = 'admin'

        # Optionally set superuser flag
        if make_superuser:
            user.is_superuser = True
            user.is_staff = True

        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated user "{username}":\n'
                f'  - user_type: admin\n'
                f'  - is_superuser: {user.is_superuser}\n'
                f'  - is_staff: {user.is_staff}'
            )
        )
