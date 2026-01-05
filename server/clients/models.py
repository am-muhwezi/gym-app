from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Client(models.Model):
    """Client Model - Represents a trainer's client"""

    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    )

    # Relationships
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='clients'
    )

    # Basic Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    dob = models.DateField(null=True, blank=True, verbose_name="Date of Birth")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    notes = models.TextField(blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    membership_start_date = models.DateField(null=True, blank=True)
    membership_end_date = models.DateField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft Delete
    is_removed = models.BooleanField(default=False, help_text='Soft-delete flag - client removed from trainer account')
    removed_at = models.DateTimeField(null=True, blank=True, help_text='When the client was removed')
    removed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='removed_clients',
        help_text='User who removed the client'
    )
    removal_reason = models.TextField(blank=True, help_text='Optional reason for removal')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['trainer', 'status']),
            models.Index(fields=['email']),
            models.Index(fields=['trainer', 'is_removed']),
        ]
        # Ensure a trainer can't add the same client twice
        # But different trainers can have clients with same email/phone
        # Email is optional, so only enforce uniqueness for non-null emails
        constraints = [
            models.UniqueConstraint(
                fields=['trainer', 'email'],
                name='unique_trainer_client_email',
                condition=models.Q(email__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['trainer', 'phone'],
                name='unique_trainer_client_phone'
            ),
        ]
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        """Return full name of client"""
        return f"{self.first_name} {self.last_name}"




class Goal(models.Model):
    """Goal Model - Represents fitness goals for clients"""
    GOAL_TYPE_CHOICES = (
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('strength', 'Strength Training'),
        ('endurance', 'Endurance'),
        ('flexibility', 'Flexibility'),
        ('general_fitness', 'General Fitness'),
        ('rehabilitation', 'Rehabilitation'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('abandoned', 'Abandoned'),
    )

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    title = models.CharField(max_length=255, default='')
    description = models.TextField()
    target_value = models.CharField(max_length=100, blank=True, default='')
    current_value = models.CharField(max_length=100, blank=True, default='')
    starting_value = models.CharField(max_length=100, blank=True, default='')  # New field to track starting point
    target_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    achieved = models.BooleanField(default=False)  # Kept for backward compatibility
    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Goal'
        verbose_name_plural = 'Goals'

    def __str__(self):
        return f"Goal for {self.client.full_name}: {self.title or self.description[:30]}..."

    def save(self, *args, **kwargs):
        # Auto-set starting_value if not provided and current_value exists
        if not self.starting_value and self.current_value:
            self.starting_value = self.current_value

        # Auto-update status based on achieved flag for backward compatibility
        if self.achieved and self.status == 'active':
            self.status = 'completed'
            if not self.completed_at:
                from django.utils import timezone
                self.completed_at = timezone.now()
        super().save(*args, **kwargs)


class WorkoutPlan(models.Model):
    """WorkoutPlan Model - Represents workout plans assigned to clients"""
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='workout_plans'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Workout Plan'
        verbose_name_plural = 'Workout Plans'

    def __str__(self):
        return f"Workout Plan for {self.client.full_name}: {self.name}"


class Exercise(models.Model):
    """Exercise Model - Represents exercises within a workout plan"""
    workout_plan = models.ForeignKey(
        WorkoutPlan,
        on_delete=models.CASCADE,
        related_name='exercises'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Weight in kg')
    rpe = models.PositiveIntegerField(null=True, blank=True, help_text='Rate of Perceived Exertion (1-10)')
    rest_period_seconds = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Exercise'
        verbose_name_plural = 'Exercises'

    def __str__(self):
        return f"Exercise in {self.workout_plan.name}: {self.name}"


class ActivityLog(models.Model):
    """ActivityLog Model - Daily activity logs for clients"""
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    date = models.DateField()
    notes = models.TextField(blank=True)
    performance_rating = models.IntegerField(
        null=True,
        blank=True,
        help_text='Rating from 1-5'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        unique_together = ['client', 'date']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'

    def __str__(self):
        return f"Activity log for {self.client.full_name} on {self.date}"


class ProgressMeasurement(models.Model):
    """ProgressMeasurement Model - Bio/Progress tracking for clients"""
    MEASUREMENT_TYPE_CHOICES = (
        ('weight', 'Weight'),
        ('body_fat', 'Body Fat %'),
        ('muscle_mass', 'Muscle Mass'),
        ('chest', 'Chest'),
        ('waist', 'Waist'),
        ('hips', 'Hips'),
        ('arms', 'Arms'),
        ('thighs', 'Thighs'),
        ('other', 'Other'),
    )

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='progress_measurements'
    )
    measurement_type = models.CharField(max_length=20, choices=MEASUREMENT_TYPE_CHOICES)
    value = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')
    notes = models.TextField(blank=True)
    measured_at = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-measured_at', '-created_at']
        verbose_name = 'Progress Measurement'
        verbose_name_plural = 'Progress Measurements'
        indexes = [
            models.Index(fields=['client', 'measurement_type', '-measured_at']),
        ]

    def __str__(self):
        return f"{self.client.full_name} - {self.measurement_type}: {self.value}{self.unit} on {self.measured_at}"