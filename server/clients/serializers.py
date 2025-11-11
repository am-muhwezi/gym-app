from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model - handles validation and data transformation"""

    full_name = serializers.ReadOnlyField()

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
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']

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
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'full_name']


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