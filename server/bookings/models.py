"""
Booking Models
Handles client session bookings and trainer scheduling
"""

from django.db import models
from django.contrib.auth import get_user_model
from clients.models import Client
from django.utils import timezone

User = get_user_model()


class Schedule(models.Model):
    """
    Trainer's availability schedule
    Defines when trainers are available for bookings
    """
    WEEKDAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )

    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['weekday', 'start_time']
        verbose_name = 'Schedule'
        verbose_name_plural = 'Schedules'
        indexes = [
            models.Index(fields=['trainer', 'weekday', 'is_available']),
        ]

    def __str__(self):
        return f"{self.trainer.username} - {self.get_weekday_display()} {self.start_time}-{self.end_time}"

    @property
    def weekday_name(self):
        """Get weekday name"""
        return self.get_weekday_display()


class Booking(models.Model):
    """
    Client session bookings
    Represents scheduled training sessions between trainer and client
    """
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )

    SESSION_TYPE_CHOICES = (
        ('personal_training', 'Personal Training'),
        ('group_class', 'Group Class'),
        ('consultation', 'Consultation'),
        ('assessment', 'Assessment'),
        ('virtual', 'Virtual Session'),
    )

    # Relationships
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='trainer_bookings'
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    # Session details
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES, default='personal_training')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Scheduling
    session_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField(default=60)

    # Location
    location = models.CharField(max_length=255, blank=True, default='Gym')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    # Session notes
    trainer_notes = models.TextField(blank=True, help_text='Private notes for trainer')
    client_notes = models.TextField(blank=True, help_text='Notes from client')
    session_summary = models.TextField(blank=True, help_text='Summary after session completion')

    # Feedback
    client_rating = models.IntegerField(null=True, blank=True, help_text='Rating from 1-5')
    client_feedback = models.TextField(blank=True)

    # Reminders
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-session_date', '-start_time']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        indexes = [
            models.Index(fields=['trainer', 'session_date', 'status']),
            models.Index(fields=['client', 'session_date']),
            models.Index(fields=['status', 'session_date']),
        ]

    def __str__(self):
        return f"{self.client.full_name} - {self.session_date} {self.start_time}"

    @property
    def is_upcoming(self):
        """Check if booking is in the future"""
        now = timezone.now()
        session_datetime = timezone.make_aware(
            timezone.datetime.combine(self.session_date, self.start_time)
        )
        return session_datetime > now and self.status not in ['cancelled', 'completed']

    @property
    def is_past(self):
        """Check if booking is in the past"""
        now = timezone.now()
        session_datetime = timezone.make_aware(
            timezone.datetime.combine(self.session_date, self.start_time)
        )
        return session_datetime < now

    def mark_completed(self, summary=''):
        """Mark booking as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        if summary:
            self.session_summary = summary
        self.save()

    def cancel(self, reason=''):
        """Cancel booking"""
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        if reason:
            self.cancellation_reason = reason
        self.save()


class RecurringBooking(models.Model):
    """
    Recurring booking template
    For clients with regular scheduled sessions
    """
    FREQUENCY_CHOICES = (
        ('weekly', 'Weekly'),
        ('biweekly', 'Biweekly'),
        ('monthly', 'Monthly'),
    )

    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='recurring_bookings'
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='recurring_bookings'
    )

    # Recurrence details
    session_type = models.CharField(max_length=20, choices=Booking.SESSION_TYPE_CHOICES, default='personal_training')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    weekday = models.IntegerField(choices=Schedule.WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField(default=60)
    location = models.CharField(max_length=255, blank=True, default='Gym')

    # Recurrence pattern
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='weekly')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text='Leave blank for indefinite')

    # Status
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['weekday', 'start_time']
        verbose_name = 'Recurring Booking'
        verbose_name_plural = 'Recurring Bookings'

    def __str__(self):
        return f"{self.client.full_name} - {self.get_frequency_display()} on {self.get_weekday_display()}"

    @property
    def weekday_name(self):
        """Get weekday name"""
        return self.get_weekday_display()
