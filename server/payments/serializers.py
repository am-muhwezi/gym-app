from rest_framework import serializers

class ClientPaymentSerializer(serializers.Serializer):
    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("mpesa", "M-Pesa"),
        ('bank_transfer', 'Bank Transfer'),
    ]


    client_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    date = serializers.DateField()
    method = serializers.ChoiceField(choices=PAYMENT_METHODS, default='mpesa')