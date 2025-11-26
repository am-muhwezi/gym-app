from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
import uuid
from django.utils import timezone
from datetime import timedelta  


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        if not email:
            raise ValueError(_('Email must be provided'))
        email = self.normalize_email(email)

        new_user=self.model(username=username,email=email, **extra_fields)
    

        if password:
            new_user.set_password(password)
        else:
            new_user.set_unusable_password()

        new_user.save(using=self._db)
        return new_user

    def create_superuser(self,username, phone_number,email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_("Superuser should have is_staff as True"))

        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_("Superuser should have is_superuser as True"))

        if extra_fields.get('is_active') is not True:
            raise ValueError(_("Superuser should have is_active as True"))

        return self.create_user(username=username, email=email, phone_number=phone_number, password=password, **extra_fields)



class User(AbstractUser):
    """Trainer User Model"""
    USER_TYPES=(
        ('trainer', 'Trainer'),
        ('client', 'Client'),
        ('admin', 'Admin'),
    )
    username=models.CharField(max_length=30, unique=True)
    email=models.EmailField(max_length=80, unique=True)
    phone_number=PhoneNumberField(null=False, unique=True)
    user_type=models.CharField(max_length=10, choices=USER_TYPES, default='trainer')

    USERNAME_FIELD='username'
    REQUIRED_FIELDS=['email', 'phone_number']

    objects = CustomUserManager()


    def __str__(self):
        return f"<User {self.email}>"


class PasswordResetToken(models.Model):
    """Model to store password reset tokens"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Token expires in 1 hour
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    def is_valid(self):
        """Check if token is still valid"""
        return not self.used and timezone.now() < self.expires_at

    def __str__(self):
        return f"Password reset token for {self.user.email}"

    class Meta:
        ordering = ['-created_at']