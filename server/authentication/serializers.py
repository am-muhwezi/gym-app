from .models import User, TermsAcceptance
from rest_framework import serializers
from django.contrib.auth import authenticate
from phonenumber_field.serializerfields import PhoneNumberField


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'user_type', 'is_superuser']
        read_only_fields = ['id', 'is_superuser']


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


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(
        error_messages={
            'required': 'Email is required',
            'invalid': 'Enter a valid email address'
        }
    )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.UUIDField(
        error_messages={
            'required': 'Token is required',
            'invalid': 'Invalid token format'
        }
    )
    new_password = serializers.CharField(
        min_length=6,
        write_only=True,
        error_messages={
            'required': 'New password is required',
            'min_length': 'Password must be at least 6 characters'
        }
    )


class TrainerSerializer(serializers.ModelSerializer):
    """Serializer for trainer account management (SaaS Admin perspective)"""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'user_type',
            'is_active', 'is_staff', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'user_type', 'is_staff']


class TrainerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating trainers by admin"""
    password = serializers.CharField(
        min_length=6,
        write_only=True,
        required=False,
        allow_blank=True,
        error_messages={
            'min_length': 'Password must be at least 6 characters'
        }
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password']

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
        password = validated_data.pop('password', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            user_type='trainer',
            password=password
        )
        return user


class TrainerUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating trainer details by admin"""

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'is_active']

    def validate_username(self, value):
        if User.objects.filter(username=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value


class TermsAcceptanceSerializer(serializers.ModelSerializer):
    """Serializer for Terms Acceptance"""
    user_email = serializers.EmailField(write_only=True)
    user_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = TermsAcceptance
        fields = ['id', 'user_email', 'user_name', 'accepted_at', 'version']
        read_only_fields = ['id', 'accepted_at']

    def create(self, validated_data):
        user_email = validated_data.pop('user_email')
        validated_data.pop('user_name', None)  # Remove user_name as it's not in the model

        # Get user by email
        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"user_email": "User with this email does not exist"})

        # Check if user has already accepted terms
        if hasattr(user, 'terms_acceptance'):
            raise serializers.ValidationError({"user_email": "User has already accepted the terms"})

        # Get IP and user agent from context
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')

        validated_data['user'] = user
        return super().create(validated_data)

    def get_client_ip(self, request):
        """Get client's real IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip