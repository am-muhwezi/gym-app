from rest_framework import serializers
from .models import Client, Goal


class GoalSerializer(serializers.ModelSerializer):
    """Serializer for Goal model"""

    goal_type_display = serializers.CharField(source='get_goal_type_display', read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id',
            'goal_type',
            'goal_type_display',
            'description',
            'target_date',
            'achieved',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GoalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating goals"""

    class Meta:
        model = Goal
        fields = ['goal_type', 'description', 'target_date', 'achieved']


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
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']

    def get_active_goals_count(self, obj):
        """Count of active (not achieved) goals"""
        return obj.goals.filter(achieved=False).count()

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
        """Validate email is unique (excluding current instance on update)"""
        instance = self.instance
        if Client.objects.filter(email=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("A client with this email already exists.")
        return value

    def validate_phone(self, value):
        """Validate phone is unique (excluding current instance on update)"""
        instance = self.instance
        if Client.objects.filter(phone=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("A client with this phone number already exists.")
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
        ]
        read_only_fields = ['id', 'created_at', 'full_name']

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
        """Validate email is unique"""
        instance = self.instance
        if Client.objects.filter(email=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("A client with this email already exists.")
        return value

    def validate_phone(self, value):
        """Validate phone is unique"""
        instance = self.instance
        if Client.objects.filter(phone=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("A client with this phone number already exists.")
        return value