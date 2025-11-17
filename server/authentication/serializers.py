from .models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from phonenumber_field.serializerfields import PhoneNumberField


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'user_type']
        read_only_fields = ['id']


class UserCreationSerialzer(serializers.ModelSerializer):
    """Serializer for user signup/registration"""
    username = serializers.CharField(
        max_length=30,
        error_messages={
            'required': 'Username is required',
            'blank': 'Username cannot be blank',
            'max_length': 'Username must be 30 characters or less'
        }
    )
    email = serializers.EmailField(
        max_length=80,
        error_messages={
            'required': 'Email is required',
            'blank': 'Email cannot be blank',
            'invalid': 'Enter a valid email address'
        }
    )
    phone_number = PhoneNumberField(
        allow_null=False,
        allow_blank=False,
        error_messages={
            'required': 'Phone number is required',
            'blank': 'Phone number cannot be blank',
            'invalid': 'Enter a valid phone number'
        }
    )
    password = serializers.CharField(
        min_length=6,
        write_only=True,
        error_messages={
            'required': 'Password is required',
            'blank': 'Password cannot be blank',
            'min_length': 'Password must be at least 6 characters'
        }
    )
    user_type = serializers.ChoiceField(choices=User.USER_TYPES, default='trainer')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'password', 'user_type']
        read_only_fields = ['id']

    def validate(self, attrs):
        username_exists = User.objects.filter(username=attrs['username']).exists()
        if username_exists:
            raise serializers.ValidationError({"username": "Username already exists"})

        email_exists = User.objects.filter(email=attrs['email']).exists()
        if email_exists:
            raise serializers.ValidationError({"email": "Email already exists"})

        phone_number_exists = User.objects.filter(phone_number=attrs['phone_number']).exists()
        if phone_number_exists:
            raise serializers.ValidationError({"phone_number": "Phone number already exists"})

        return super().validate(attrs)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            user_type=validated_data.get('user_type', 'trainer'),
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid username or password")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            data['user'] = user
        else:
            raise serializers.ValidationError("Must provide username and password")

        return data