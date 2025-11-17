"""
Booking Serializers
"""

from rest_framework import serializers
from .models import Booking, Schedule, RecurringBooking
from clients.serializers import ClientListSerializer


class ScheduleSerializer(serializers.ModelSerializer):
    """Full schedule details"""
    weekday_name = serializers.ReadOnlyField()

    class Meta:
        model = Schedule
        fields = [
            'id', 'trainer', 'weekday', 'weekday_name', 'start_time', 'end_time',
            'is_available', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trainer', 'created_at', 'updated_at']


class ScheduleCreateSerializer(serializers.ModelSerializer):
    """Create/Update schedule"""
    class Meta:
        model = Schedule
        fields = ['weekday', 'start_time', 'end_time', 'is_available', 'notes']

    def validate(self, data):
        """Validate schedule times"""
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data


class BookingSerializer(serializers.ModelSerializer):
    """Full booking details"""
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    trainer_name = serializers.CharField(source='trainer.username', read_only=True)
    client_details = ClientListSerializer(source='client', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    session_type_display = serializers.CharField(source='get_session_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'trainer', 'trainer_name', 'client', 'client_name', 'client_details',
            'session_type', 'session_type_display', 'title', 'description',
            'session_date', 'start_time', 'end_time', 'duration_minutes',
            'location', 'status', 'status_display',
            'trainer_notes', 'client_notes', 'session_summary',
            'client_rating', 'client_feedback',
            'reminder_sent', 'reminder_sent_at',
            'is_upcoming', 'is_past',
            'created_at', 'updated_at', 'completed_at', 'cancelled_at',
            'cancellation_reason'
        ]
        read_only_fields = [
            'id', 'trainer', 'reminder_sent', 'reminder_sent_at',
            'created_at', 'updated_at', 'completed_at', 'cancelled_at'
        ]


class BookingListSerializer(serializers.ModelSerializer):
    """Simplified booking list"""
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    session_type_display = serializers.CharField(source='get_session_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_upcoming = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'client_name', 'session_type', 'session_type_display',
            'title', 'session_date', 'start_time', 'end_time', 'location',
            'status', 'status_display', 'is_upcoming', 'created_at'
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Create booking"""
    class Meta:
        model = Booking
        fields = [
            'client', 'session_type', 'title', 'description',
            'session_date', 'start_time', 'end_time', 'duration_minutes',
            'location', 'trainer_notes'
        ]

    def validate(self, data):
        """Validate booking data"""
        # Validate times
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")

        # Validate date is not in the past
        from django.utils import timezone
        if data['session_date'] < timezone.now().date():
            raise serializers.ValidationError("Cannot book sessions in the past")

        return data


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Update booking"""
    class Meta:
        model = Booking
        fields = [
            'session_type', 'title', 'description',
            'session_date', 'start_time', 'end_time', 'duration_minutes',
            'location', 'status', 'trainer_notes', 'client_notes',
            'session_summary', 'client_rating', 'client_feedback',
            'cancellation_reason'
        ]

    def validate(self, data):
        """Validate update data"""
        # Validate times if both provided
        if 'start_time' in data and 'end_time' in data:
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError("End time must be after start time")

        return data


class RecurringBookingSerializer(serializers.ModelSerializer):
    """Full recurring booking details"""
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    weekday_name = serializers.ReadOnlyField()
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    session_type_display = serializers.CharField(source='get_session_type_display', read_only=True)

    class Meta:
        model = RecurringBooking
        fields = [
            'id', 'trainer', 'client', 'client_name',
            'session_type', 'session_type_display', 'title', 'description',
            'weekday', 'weekday_name', 'start_time', 'end_time', 'duration_minutes',
            'location', 'frequency', 'frequency_display',
            'start_date', 'end_date', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trainer', 'created_at', 'updated_at']


class RecurringBookingCreateSerializer(serializers.ModelSerializer):
    """Create recurring booking"""
    class Meta:
        model = RecurringBooking
        fields = [
            'client', 'session_type', 'title', 'description',
            'weekday', 'start_time', 'end_time', 'duration_minutes',
            'location', 'frequency', 'start_date', 'end_date'
        ]

    def validate(self, data):
        """Validate recurring booking data"""
        # Validate times
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")

        # Validate dates if end_date provided
        if data.get('end_date') and data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after start date")

        return data
