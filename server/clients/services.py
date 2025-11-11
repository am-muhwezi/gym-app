"""
Client Service Layer
Contains business logic for client management
Keeps views thin and focused on HTTP concerns
"""

from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .models import Client


class ClientService:
    """Business logic for client management"""

    @staticmethod
    @transaction.atomic
    def create_client(trainer, **client_data):
        """
        Create a new client with initial setup

        Business Logic:
        - Assigns trainer to client
        - Sets default membership dates (1 year) if not provided
        - Creates client record

        Args:
            trainer: User instance (trainer)
            **client_data: Validated client data from serializer

        Returns:
            Client: Created client instance
        """
        # Set default membership period if not provided
        if 'membership_start_date' not in client_data or not client_data.get('membership_start_date'):
            client_data['membership_start_date'] = timezone.now().date()

        if 'membership_end_date' not in client_data or not client_data.get('membership_end_date'):
            client_data['membership_end_date'] = (
                timezone.now().date() + timedelta(days=365)
            )

        # Create client
        client = Client.objects.create(
            trainer=trainer,
            **client_data
        )

        return client

    @staticmethod
    def get_trainer_clients(trainer, status=None):
        """
        Get all clients for a trainer, optionally filtered by status

        Args:
            trainer: User instance (trainer)
            status: Optional status filter ('active', 'inactive', 'suspended')

        Returns:
            QuerySet: Filtered clients
        """
        queryset = Client.objects.filter(trainer=trainer)

        if status:
            queryset = queryset.filter(status=status)

        return queryset.select_related('trainer')

    @staticmethod
    @transaction.atomic
    def update_client(client, **update_data):
        """
        Update client information

        Args:
            client: Client instance to update
            **update_data: Fields to update

        Returns:
            Client: Updated client instance
        """
        for field, value in update_data.items():
            setattr(client, field, value)

        client.save()
        return client

    @staticmethod
    @transaction.atomic
    def deactivate_client(client, reason=None):
        """
        Deactivate a client

        Business Logic:
        - Update client status to inactive
        - Note: In full implementation, would also cancel future bookings

        Args:
            client: Client instance to deactivate
            reason: Optional reason for deactivation

        Returns:
            Client: Updated client instance
        """
        client.status = 'inactive'

        if reason:
            if client.notes:
                client.notes += f"\n\nDeactivation reason ({timezone.now().date()}): {reason}"
            else:
                client.notes = f"Deactivation reason ({timezone.now().date()}): {reason}"

        client.save()
        return client

    @staticmethod
    def get_client_statistics(trainer):
        """
        Get trainer's client statistics

        Business Logic:
        - Aggregate client data for dashboard
        - Calculate counts by status

        Args:
            trainer: User instance (trainer)

        Returns:
            dict: Client statistics
        """
        clients = Client.objects.filter(trainer=trainer)

        stats = {
            'total_clients': clients.count(),
            'active_clients': clients.filter(status='active').count(),
            'inactive_clients': clients.filter(status='inactive').count(),
            'suspended_clients': clients.filter(status='suspended').count(),
        }

        return stats

    @staticmethod
    def search_clients(trainer, search_term):
        """
        Search clients by name, email, or phone

        Args:
            trainer: User instance (trainer)
            search_term: Search string

        Returns:
            QuerySet: Matching clients
        """
        from django.db.models import Q

        return Client.objects.filter(
            trainer=trainer
        ).filter(
            Q(first_name__icontains=search_term) |
            Q(last_name__icontains=search_term) |
            Q(email__icontains=search_term) |
            Q(phone__icontains=search_term)
        )
