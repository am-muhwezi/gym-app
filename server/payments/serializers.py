from rest_framework import serializers
from .models import Payment
from clients.models import Client


class PaymentSerializer(serializers.ModelSerializer):
    """Full Payment serializer with all details"""

    client_name = serializers.CharField(source='client.full_name', read_only=True)
    client_email = serializers.EmailField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'client',
            'client_name',
            'client_email',
            'client_phone',
            'amount',
            'payment_method',
            'payment_method_display',
            'payment_status',
            'payment_status_display',
            'transaction_id',
            'mpesa_receipt_number',
            'phone_number',
            'invoice_number',
            'description',
            'sessions_per_week',
            'payment_date',
            'due_date',
            'is_overdue',
            'days_overdue',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'invoice_number',
            'created_at',
            'updated_at',
            'transaction_id',
        ]


class PaymentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for payment list views"""

    client_name = serializers.CharField(source='client.full_name', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'client',
            'client_name',
            'amount',
            'payment_method',
            'payment_status',
            'payment_status_display',
            'invoice_number',
            'due_date',
            'payment_date',
            'is_overdue',
            'created_at',
        ]


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments (invoices)"""

    class Meta:
        model = Payment
        fields = [
            'client',
            'amount',
            'payment_method',
            'description',
            'sessions_per_week',
            'due_date',
            'phone_number',
        ]

    def validate_client(self, value):
        """Ensure client belongs to the requesting trainer"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if not Client.objects.filter(id=value.id, trainer=request.user).exists():
                raise serializers.ValidationError("Client not found or does not belong to you.")
        return value

    def validate_amount(self, value):
        """Validate amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating payments"""

    class Meta:
        model = Payment
        fields = [
            'amount',
            'payment_method',
            'payment_status',
            'description',
            'sessions_per_week',
            'due_date',
            'mpesa_receipt_number',
            'phone_number',
        ]

    def validate_payment_status(self, value):
        """Prevent changing completed payments back to pending"""
        if self.instance and self.instance.payment_status == 'completed':
            if value == 'pending':
                raise serializers.ValidationError(
                    "Cannot change a completed payment back to pending. Use 'refunded' if necessary."
                )
        return value


class MpesaPaymentSerializer(serializers.Serializer):
    """Serializer for initiating M-Pesa STK Push"""

    payment_id = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=15)

    def validate_phone_number(self, value):
        """Validate Kenyan phone number format"""
        # Remove spaces and special characters
        phone = value.replace(' ', '').replace('-', '').replace('+', '')

        # Kenyan numbers start with 254 or 0
        if phone.startswith('254'):
            if len(phone) != 12:
                raise serializers.ValidationError("Invalid phone number format. Should be 254XXXXXXXXX")
        elif phone.startswith('0'):
            if len(phone) != 10:
                raise serializers.ValidationError("Invalid phone number format. Should be 0XXXXXXXXX")
            # Convert to 254 format
            phone = '254' + phone[1:]
        else:
            raise serializers.ValidationError(
                "Invalid phone number. Must start with 254 or 0."
            )

        return phone

    def validate_payment_id(self, value):
        """Ensure payment exists and is pending"""
        request = self.context.get('request')
        try:
            payment = Payment.objects.get(id=value)
            # Ensure payment belongs to trainer's client
            if request and hasattr(request, 'user'):
                if payment.client.trainer != request.user:
                    raise serializers.ValidationError("Payment not found.")
            if payment.payment_status == 'completed':
                raise serializers.ValidationError("Payment is already completed.")
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment not found.")

        return value


class PaymentReceiptSerializer(serializers.ModelSerializer):
    """Serializer for generating payment receipts"""

    client_name = serializers.CharField(source='client.full_name', read_only=True)
    client_email = serializers.EmailField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    trainer_name = serializers.SerializerMethodField()
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'invoice_number',
            'client_name',
            'client_email',
            'client_phone',
            'trainer_name',
            'amount',
            'payment_method',
            'payment_method_display',
            'mpesa_receipt_number',
            'description',
            'sessions_per_week',
            'payment_date',
            'created_at',
        ]

    def get_trainer_name(self, obj):
        """Get trainer's full name"""
        user = obj.client.trainer
        return f"{user.first_name} {user.last_name}" if user.first_name else user.email
