from django.db import models
from django.contrib.auth import get_user_model
from clients.models import Client

User = get_user_model()


class ExerciseLibrary(models.Model):
    """Exercise Library - Global or trainer-specific exercises"""

    MODALITY_CHOICES = (
        ('warmup', 'Warm Up'),
        ('cooldown', 'Cool Down'),
        ('cardio', 'Cardio'),
        ('conditioning', 'Conditioning'),
        ('mobility', 'Mobility'),
        ('strength', 'Strength'),
        ('power', 'Power'),
        ('yoga', 'Yoga'),
        ('weightlifting', 'Weightlifting'),
    )

    MUSCLE_GROUP_CHOICES = (
        ('chest', 'Chest'),
        ('back', 'Back'),
        ('shoulders', 'Shoulders'),
        ('biceps', 'Biceps'),
        ('triceps', 'Triceps'),
        ('forearms', 'Forearms'),
        ('abs', 'Abs'),
        ('lower_back', 'Lower Back'),
        ('glutes', 'Glutes'),
        ('quads', 'Quads'),
        ('hamstrings', 'Hamstrings'),
        ('adductors', 'Adductors'),
        ('abductors', 'Abductors'),
        ('calves', 'Calves'),
        ('shins', 'Shins'),
    )

    CATEGORY_CHOICES = (
        ('strength', 'Strength (Weight x Reps)'),
        ('bodyweight', 'Bodyweight'),
        ('timed', 'Timed'),
    )

    # Relationships
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exercises',
        null=True,
        blank=True,
        help_text='Null for global exercises'
    )

    # Basic Info
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True, null=True, max_length=500)
    image_url = models.URLField(blank=True, null=True, max_length=500)

    # Classification
    is_global = models.BooleanField(default=False, help_text='Platform-wide exercise')
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES)
    muscle_groups = models.JSONField(default=list, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='strength')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['trainer', 'is_global']),
            models.Index(fields=['modality']),
            models.Index(fields=['category']),
        ]
        verbose_name = 'Exercise'
        verbose_name_plural = 'Exercise Library'

    def __str__(self):
        prefix = "Global" if self.is_global else f"{self.trainer.username if self.trainer else 'Unknown'}"
        return f"{prefix}: {self.name}"


class WorkoutTemplate(models.Model):
    """Workout Template - Reusable workout structure"""

    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )

    # Relationships
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='workout_templates'
    )
    exercises = models.ManyToManyField(
        ExerciseLibrary,
        through='WorkoutExercise',
        related_name='workout_templates'
    )

    # Basic Info
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    difficulty_level = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default='intermediate'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['trainer', '-created_at']),
        ]
        verbose_name = 'Workout Template'
        verbose_name_plural = 'Workout Templates'

    def __str__(self):
        return f"{self.trainer.username}: {self.name}"


class WorkoutExercise(models.Model):
    """Junction table between WorkoutTemplate and ExerciseLibrary"""

    # Relationships
    workout_template = models.ForeignKey(
        WorkoutTemplate,
        on_delete=models.CASCADE,
        related_name='workout_exercises'
    )
    exercise = models.ForeignKey(
        ExerciseLibrary,
        on_delete=models.CASCADE,
        related_name='workout_exercises'
    )

    # Exercise Configuration
    order = models.PositiveIntegerField(default=0, help_text='Order in workout')
    sets = models.PositiveIntegerField(null=True, blank=True)
    reps = models.PositiveIntegerField(null=True, blank=True)
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Weight in kg'
    )
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    rest_period_seconds = models.PositiveIntegerField(default=60)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ['workout_template', 'order']
        verbose_name = 'Workout Exercise'
        verbose_name_plural = 'Workout Exercises'

    def __str__(self):
        return f"{self.workout_template.name} - {self.exercise.name} (#{self.order})"


class Program(models.Model):
    """Program - Multi-week training program"""

    DURATION_CHOICES = (
        ('4_weeks', '4 Weeks'),
        ('8_weeks', '8 Weeks'),
        ('12_weeks', '12 Weeks'),
        ('16_weeks', '16 Weeks'),
    )

    MODALITY_CHOICES = ExerciseLibrary.MODALITY_CHOICES

    EXPERIENCE_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )

    # Relationships
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='programs'
    )

    # Basic Info
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES)
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES)
    goals = models.TextField(blank=True, help_text='Program goals')
    requirements = models.TextField(blank=True, help_text='Equipment/Prerequisites')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['trainer', '-created_at']),
            models.Index(fields=['modality', 'experience_level']),
        ]
        verbose_name = 'Program'
        verbose_name_plural = 'Programs'

    def __str__(self):
        return f"{self.trainer.username}: {self.name} ({self.get_duration_display()})"

    @property
    def total_weeks(self):
        """Get number of weeks in program"""
        return int(self.duration.split('_')[0])


class ProgramWeek(models.Model):
    """Program Week - Week within a program"""

    # Relationships
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='weeks'
    )

    # Week Info
    week_number = models.PositiveIntegerField(help_text='Week 1-16')
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['week_number']
        unique_together = ['program', 'week_number']
        verbose_name = 'Program Week'
        verbose_name_plural = 'Program Weeks'

    def __str__(self):
        return f"{self.program.name} - Week {self.week_number}"


class ProgramDay(models.Model):
    """Program Day - Daily workout within a program week"""

    DAY_OF_WEEK_CHOICES = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )

    # Relationships
    week = models.ForeignKey(
        ProgramWeek,
        on_delete=models.CASCADE,
        related_name='days'
    )
    workout_template = models.ForeignKey(
        WorkoutTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='program_days'
    )

    # Day Info
    day_number = models.PositiveIntegerField(help_text='Day 1-7')
    day_of_week = models.CharField(max_length=20, choices=DAY_OF_WEEK_CHOICES)
    title = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    is_rest_day = models.BooleanField(default=False)

    class Meta:
        ordering = ['day_number']
        unique_together = ['week', 'day_number']
        verbose_name = 'Program Day'
        verbose_name_plural = 'Program Days'

    def __str__(self):
        return f"{self.week.program.name} - Week {self.week.week_number} - Day {self.day_number}"


class ClientWorkoutAssignment(models.Model):
    """Client Workout Assignment - Assign workout to specific date"""

    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    )

    # Relationships
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='workout_assignments'
    )
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_workout_assignments'
    )
    workout_template = models.ForeignKey(
        WorkoutTemplate,
        on_delete=models.CASCADE,
        related_name='assignments'
    )

    # Assignment Info
    assigned_date = models.DateField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-assigned_date']
        indexes = [
            models.Index(fields=['client', 'assigned_date']),
            models.Index(fields=['trainer', 'assigned_date']),
            models.Index(fields=['status']),
        ]
        verbose_name = 'Client Workout Assignment'
        verbose_name_plural = 'Client Workout Assignments'

    def __str__(self):
        client_name = f"{self.client.first_name} {self.client.last_name}"
        return f"{client_name} - {self.workout_template.name} on {self.assigned_date}"


class ClientProgramAssignment(models.Model):
    """Client Program Assignment - Assign program to client"""

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    )

    # Relationships
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='program_assignments'
    )
    trainer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_program_assignments'
    )
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='assignments'
    )

    # Assignment Info
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    current_week = models.PositiveIntegerField(default=1)
    current_day = models.PositiveIntegerField(default=1)

    # Progress
    completed_workouts = models.PositiveIntegerField(default=0)
    total_workouts = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['trainer', 'start_date']),
            models.Index(fields=['start_date', 'end_date']),
        ]
        verbose_name = 'Client Program Assignment'
        verbose_name_plural = 'Client Program Assignments'

    def __str__(self):
        client_name = f"{self.client.first_name} {self.client.last_name}"
        return f"{client_name} - {self.program.name}"

    def save(self, *args, **kwargs):
        # Calculate end_date based on program duration
        if not self.end_date and self.start_date:
            from datetime import timedelta
            weeks = self.program.total_weeks
            self.end_date = self.start_date + timedelta(weeks=weeks)
        super().save(*args, **kwargs)

    @property
    def progress_percentage(self):
        """Calculate completion percentage"""
        if self.total_workouts == 0:
            return 0
        return int((self.completed_workouts / self.total_workouts) * 100)
