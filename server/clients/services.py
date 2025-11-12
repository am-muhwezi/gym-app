"""
Client Service Layer
Contains business logic for client management - NOT basic CRUD operations
Views handle CRUD directly, services handle complex business logic
"""

from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .models import Client


class ClientService:
    """Business logic for client management - complex operations only"""

    @staticmethod
    @transaction.atomic
    def deactivate_client(client, reason=None):
        """
        Deactivate a client with business logic

        Business Logic:
        - Update client status to inactive
        - Log deactivation reason in notes
        - In full implementation: cancel future bookings, notify client, etc.

        Args:
            client: Client instance to deactivate
            reason: Optional reason for deactivation

        Returns:
            Client: Updated client instance
        """
        client.status = 'inactive'

        if reason:
            deactivation_note = f"\n\nDeactivation reason ({timezone.now().date()}): {reason}"
            client.notes = (client.notes + deactivation_note) if client.notes else deactivation_note.strip()

        client.save()
        return client

    @staticmethod
    def get_client_statistics(trainer):
        """
        Get trainer's client statistics

        Business Logic:
        - Aggregate client data for dashboard
        - Calculate counts by status
        - Calculate payment statistics

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
    def set_default_membership_dates(client_data):
        """
        Set default membership dates if not provided

        Business Logic:
        - Default membership period is 1 year from today
        - Start date defaults to today if not provided
        - End date defaults to 1 year from start date

        Args:
            client_data: Dict of client data

        Returns:
            dict: Updated client_data with default dates
        """
        if 'membership_start_date' not in client_data or not client_data.get('membership_start_date'):
            client_data['membership_start_date'] = timezone.now().date()

        if 'membership_end_date' not in client_data or not client_data.get('membership_end_date'):
            start_date = client_data.get('membership_start_date') or timezone.now().date()
            client_data['membership_end_date'] = start_date + timedelta(days=365)

        return client_data

    @staticmethod
    def check_membership_expiry(client):
        """
        Check if client's membership has expired

        Business Logic:
        - Compare membership end date with today
        - Optionally auto-suspend expired memberships

        Args:
            client: Client instance

        Returns:
            dict: Expiry status and days remaining/overdue
        """
        if not client.membership_end_date:
            return {'expired': False, 'days_remaining': None}

        today = timezone.now().date()
        days_difference = (client.membership_end_date - today).days

        return {
            'expired': days_difference < 0,
            'days_remaining': days_difference if days_difference >= 0 else 0,
            'days_overdue': abs(days_difference) if days_difference < 0 else 0,
        }
