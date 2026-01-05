from rest_framework import serializers
from .models import Client, Goal, WorkoutPlan, Exercise, ActivityLog, ProgressMeasurement


class GoalSerializer(serializers.ModelSerializer):
    """Serializer for Goal model"""

    goal_type_display = serializers.CharField(source='get_goal_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id',
            'client',
            'goal_type',
            'goal_type_display',
            'title',
            'description',
            'target_value',
            'current_value',
            'starting_value',
            'target_date',
            'status',
            'status_display',
            'achieved',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'client', 'created_at', 'updated_at', 'completed_at']


class GoalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating goals"""

    class Meta:
        model = Goal
        fields = [
            'goal_type',
            'title',
            'description',
            'target_value',
            'current_value',
            'starting_value',
            'target_date',
            'status',
            'achieved'
        ]


class ExerciseSerializer(serializers.ModelSerializer):
    """Serializer for Exercise model"""

    class Meta:
        model = Exercise
        fields = [
            'id',
            'workout_plan',
            'name',
            'description',
            'sets',
            'reps',
            'weight',
            'rpe',
            'rest_period_seconds',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'workout_plan', 'created_at', 'updated_at']


class ExerciseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating exercises"""

    class Meta:
        model = Exercise
        fields = [
            'name',
            'description',
            'sets',
            'reps',
            'weight',
            'rpe',
            'rest_period_seconds',
        ]

    def validate_rpe(self, value):
        """Validate RPE is between 1 and 10"""
        if value is not None and (value < 1 or value > 10):
            raise serializers.ValidationError("RPE must be between 1 and 10")
        return value


class WorkoutPlanSerializer(serializers.ModelSerializer):
    """Serializer for WorkoutPlan model with exercises"""

    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutPlan
        fields = [
            'id',
            'client',
            'name',
            'description',
            'exercises',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'client', 'created_at', 'updated_at']


class WorkoutPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating workout plans"""

    class Meta:
        model = WorkoutPlan
        fields = ['name', 'description']


class PaymentSummarySerializer(serializers.Serializer):
    """Lightweight payment info for client overview"""

    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    overdue_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    last_payment_date = serializers.DateTimeField(allow_null=True)
    payment_status = serializers.CharField()  # 'up_to_date', 'has_pending', 'overdue'


class ClientSerializer(serializers.ModelSerializer):
    """Full serializer for Client model with related data"""

    full_name = serializers.ReadOnlyField()
    goals = GoalSerializer(many=True, read_only=True)
    active_goals_count = serializers.SerializerMethodField()
    payment_summary = serializers.SerializerMethodField()
    membership_expiry_status = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'dob',
            'gender',
            'notes',
            'status',
            'membership_start_date',
            'membership_end_date',
            'membership_expiry_status',
            'created_at',
            'updated_at',
            'goals',
            'active_goals_count',
            'payment_summary',
            'is_removed',
            'removed_at',
            'removed_by',
            'removal_reason',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name', 'is_removed', 'removed_at', 'removed_by', 'removal_reason']

    def get_active_goals_count(self, obj):
        """Count of active (not achieved) goals"""
        return obj.goals.filter(status='active').count()

    def get_payment_summary(self, obj):
        """Get payment summary for client"""
        from payments.models import Payment
        from django.db.models import Sum
        from django.utils import timezone

        payments = obj.payments.all()

        # Calculate totals
        total_paid = payments.filter(payment_status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0

        pending_payments = payments.filter(payment_status='pending')
        pending_amount = pending_payments.aggregate(total=Sum('amount'))['total'] or 0

        # Calculate overdue
        today = timezone.now().date()
        overdue_payments = pending_payments.filter(due_date__lt=today)
        overdue_amount = overdue_payments.aggregate(total=Sum('amount'))['total'] or 0

        # Last payment
        last_payment = payments.filter(payment_status='completed').order_by('-payment_date').first()
        last_payment_date = last_payment.payment_date if last_payment else None

        # Determine status
        if overdue_amount > 0:
            payment_status = 'overdue'
        elif pending_amount > 0:
            payment_status = 'has_pending'
        else:
            payment_status = 'up_to_date'

        return {
            'total_paid': total_paid,
            'pending_amount': pending_amount,
            'overdue_amount': overdue_amount,
            'last_payment_date': last_payment_date,
            'payment_status': payment_status,
        }

    def get_membership_expiry_status(self, obj):
        """Get membership expiry information"""
        from clients.services import ClientService
        return ClientService.check_membership_expiry(obj)

    def validate_email(self, value):
        """Validate email is unique per trainer (excluding current instance on update)"""
        # Allow empty email
        if not value:
            return value

        instance = self.instance
        request = self.context.get('request')
        trainer = request.user if request else None

        queryset = Client.objects.filter(email=value, trainer=trainer)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("You already have a client with this email.")
        return value

    def validate_phone(self, value):
        """Validate phone is unique per trainer (excluding current instance on update)"""
        instance = self.instance
        request = self.context.get('request')
        trainer = request.user if request else None

        queryset = Client.objects.filter(phone=value, trainer=trainer)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("You already have a client with this phone number.")
        return value


class ClientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for client list views"""

    full_name = serializers.ReadOnlyField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'status',
            'payment_status',
            'created_at',
            'is_removed',
            'removed_at',
            'removed_by',
            'removal_reason',
        ]
        read_only_fields = ['id', 'created_at', 'full_name', 'is_removed', 'removed_at', 'removed_by', 'removal_reason']

    def get_payment_status(self, obj):
        """Quick payment status check"""
        from payments.models import Payment
        from django.utils import timezone

        today = timezone.now().date()
        overdue = obj.payments.filter(
            payment_status='pending',
            due_date__lt=today
        ).exists()

        if overdue:
            return 'overdue'

        has_pending = obj.payments.filter(payment_status='pending').exists()
        return 'has_pending' if has_pending else 'up_to_date'


class ClientCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating clients"""

    class Meta:
        model = Client
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'dob',
            'gender',
            'notes',
            'membership_start_date',
            'membership_end_date',
        ]

    def validate_email(self, value):
        """Validate email is unique per trainer"""
        # Allow empty email
        if not value:
            return value

        instance = self.instance
        request = self.context.get('request')
        trainer = request.user if request else None

        queryset = Client.objects.filter(email=value, trainer=trainer)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("You already have a client with this email.")
        return value

    def validate_phone(self, value):
        """Validate phone is unique per trainer"""
        instance = self.instance
        request = self.context.get('request')
        trainer = request.user if request else None

        queryset = Client.objects.filter(phone=value, trainer=trainer)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("You already have a client with this phone number.")
        return value


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for ActivityLog model"""

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'client',
            'date',
            'notes',
            'performance_rating',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'client', 'created_at', 'updated_at']


class ActivityLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating activity logs"""

    class Meta:
        model = ActivityLog
        fields = [
            'date',
            'notes',
            'performance_rating',
        ]

    def validate_performance_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Performance rating must be between 1 and 5")
        return value


class ProgressMeasurementSerializer(serializers.ModelSerializer):
    """Serializer for ProgressMeasurement model"""

    measurement_type_display = serializers.CharField(source='get_measurement_type_display', read_only=True)

    class Meta:
        model = ProgressMeasurement
        fields = [
            'id',
            'client',
            'measurement_type',
            'measurement_type_display',
            'value',
            'unit',
            'notes',
            'measured_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'client', 'created_at', 'updated_at']


class ProgressMeasurementCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating progress measurements"""

    class Meta:
        model = ProgressMeasurement
        fields = [
            'measurement_type',
            'value',
            'unit',
            'notes',
            'measured_at',
        ]