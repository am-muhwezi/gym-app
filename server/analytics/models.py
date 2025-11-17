"""
Analytics Models
Handles business analytics and reporting for trainers
"""

from django.db import models
from django.contrib.auth import get_user_model
from clients.models import Client
from django.utils import timezone
from django.db.models import Sum, Count, Avg
from datetime import timedelta

User = get_user_model()


class ClientRetention(models.Model):
    """
    Client retention and churn tracking
    Tracks client activity and retention metrics
    """
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_retentions'
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='retention_records'
    )

    # Retention metrics
    signup_date = models.DateField()
    last_session_date = models.DateField(null=True, blank=True)
    last_payment_date = models.DateField(null=True, blank=True)
    total_sessions = models.IntegerField(default=0)
    total_payments = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Status
    is_active = models.BooleanField(default=True)
    churned_date = models.DateField(null=True, blank=True)
    churn_reason = models.TextField(blank=True)

    # Engagement score (0-100)
    engagement_score = models.IntegerField(default=50, help_text='Calculated engagement score 0-100')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Client Retention'
        verbose_name_plural = 'Client Retentions'
        unique_together = ['trainer', 'client']
        indexes = [
            models.Index(fields=['trainer', 'is_active']),
            models.Index(fields=['engagement_score']),
        ]

    def __str__(self):
        return f"{self.client.full_name} - Retention Record"

    @property
    def retention_days(self):
        """Days since signup"""
        if self.churned_date:
            return (self.churned_date - self.signup_date).days
        return (timezone.now().date() - self.signup_date).days

    @property
    def days_since_last_session(self):
        """Days since last session"""
        if not self.last_session_date:
            return None
        return (timezone.now().date() - self.last_session_date).days


class RevenueMetric(models.Model):
    """
    Revenue tracking and analysis
    Aggregates revenue data by different time periods
    """
    PERIOD_CHOICES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    )

    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='revenue_metrics'
    )

    # Period
    period_type = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    period_start = models.DateField()
    period_end = models.DateField()

    # Revenue metrics
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    completed_payments = models.IntegerField(default=0)
    pending_payments = models.IntegerField(default=0)
    pending_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overdue_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Client metrics
    active_clients = models.IntegerField(default=0)
    new_clients = models.IntegerField(default=0)
    churned_clients = models.IntegerField(default=0)

    # Session metrics
    total_sessions = models.IntegerField(default=0)
    completed_sessions = models.IntegerField(default=0)
    cancelled_sessions = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period_start']
        verbose_name = 'Revenue Metric'
        verbose_name_plural = 'Revenue Metrics'
        unique_together = ['trainer', 'period_type', 'period_start']
        indexes = [
            models.Index(fields=['trainer', 'period_type', '-period_start']),
        ]

    def __str__(self):
        return f"{self.trainer.username} - {self.get_period_type_display()} - {self.period_start}"

    @property
    def average_revenue_per_client(self):
        """Calculate average revenue per active client"""
        if self.active_clients > 0:
            return self.total_revenue / self.active_clients
        return 0


class ClientGoalAnalytics(models.Model):
    """
    Analytics for client goal achievement and progress
    Tracks goal completion rates and trends
    """
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='goal_analytics'
    )

    # Period
    period_start = models.DateField()
    period_end = models.DateField()

    # Goal metrics
    total_goals = models.IntegerField(default=0)
    completed_goals = models.IntegerField(default=0)
    active_goals = models.IntegerField(default=0)
    paused_goals = models.IntegerField(default=0)
    abandoned_goals = models.IntegerField(default=0)

    # Goal types breakdown
    weight_loss_goals = models.IntegerField(default=0)
    muscle_gain_goals = models.IntegerField(default=0)
    strength_goals = models.IntegerField(default=0)
    endurance_goals = models.IntegerField(default=0)

    # Completion rates
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='Percentage 0-100')
    average_days_to_complete = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period_start']
        verbose_name = 'Goal Analytics'
        verbose_name_plural = 'Goal Analytics'
        unique_together = ['trainer', 'period_start']
        indexes = [
            models.Index(fields=['trainer', '-period_start']),
        ]

    def __str__(self):
        return f"{self.trainer.username} - Goal Analytics - {self.period_start}"


class SessionAnalytics(models.Model):
    """
    Session and booking analytics
    Tracks session statistics and trends
    """
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='session_analytics'
    )

    # Period
    period_start = models.DateField()
    period_end = models.DateField()

    # Session metrics
    total_sessions = models.IntegerField(default=0)
    completed_sessions = models.IntegerField(default=0)
    cancelled_sessions = models.IntegerField(default=0)
    no_show_sessions = models.IntegerField(default=0)

    # Session types
    personal_training_sessions = models.IntegerField(default=0)
    group_class_sessions = models.IntegerField(default=0)
    virtual_sessions = models.IntegerField(default=0)
    consultation_sessions = models.IntegerField(default=0)

    # Time metrics
    total_session_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    average_session_duration = models.IntegerField(default=0, help_text='Average duration in minutes')

    # Ratings
    average_client_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, null=True, blank=True)
    total_ratings = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period_start']
        verbose_name = 'Session Analytics'
        verbose_name_plural = 'Session Analytics'
        unique_together = ['trainer', 'period_start']
        indexes = [
            models.Index(fields=['trainer', '-period_start']),
        ]

    def __str__(self):
        return f"{self.trainer.username} - Session Analytics - {self.period_start}"

    @property
    def completion_rate(self):
        """Calculate session completion rate"""
        if self.total_sessions > 0:
            return (self.completed_sessions / self.total_sessions) * 100
        return 0

    @property
    def cancellation_rate(self):
        """Calculate session cancellation rate"""
        if self.total_sessions > 0:
            return (self.cancelled_sessions / self.total_sessions) * 100
        return 0


class TrainerSnapshot(models.Model):
    """
    Daily snapshot of trainer's business metrics
    Provides a quick overview of business health
    """
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='snapshots'
    )

    snapshot_date = models.DateField()

    # Client metrics
    total_clients = models.IntegerField(default=0)
    active_clients = models.IntegerField(default=0)
    inactive_clients = models.IntegerField(default=0)

    # Financial metrics
    monthly_recurring_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outstanding_payments = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overdue_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Session metrics
    upcoming_sessions_7days = models.IntegerField(default=0)
    upcoming_sessions_30days = models.IntegerField(default=0)

    # Goal metrics
    active_goals = models.IntegerField(default=0)
    goals_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Engagement
    avg_engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-snapshot_date']
        verbose_name = 'Trainer Snapshot'
        verbose_name_plural = 'Trainer Snapshots'
        unique_together = ['trainer', 'snapshot_date']
        indexes = [
            models.Index(fields=['trainer', '-snapshot_date']),
        ]

    def __str__(self):
        return f"{self.trainer.username} - Snapshot - {self.snapshot_date}"

    @property
    def client_growth_potential(self):
        """Estimate client growth potential"""
        if self.active_clients == 0:
            return 0
        # Simple calculation: ratio of active to total clients
        return (self.active_clients / self.total_clients) * 100 if self.total_clients > 0 else 0
