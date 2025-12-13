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

    SUBSCRIPTION_STATUS_CHOICES = (
        ('trial', 'Trial'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('suspended', 'Suspended'),
    )

    PLAN_TYPE_CHOICES = (
        ('trial', 'Trial'),
        ('starter', 'Starter'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    )

    username=models.CharField(max_length=30, unique=True)
    email=models.EmailField(max_length=80, unique=True)
    phone_number=PhoneNumberField(null=False, unique=True)
    user_type=models.CharField(max_length=10, choices=USER_TYPES, default='trainer')

    # Trial/Subscription fields
    trial_start_date = models.DateField(null=True, blank=True, help_text='When trial started')
    trial_end_date = models.DateField(null=True, blank=True, help_text='When trial expires')
    subscription_status = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_STATUS_CHOICES,
        null=True,
        blank=True,
        help_text='Current subscription status'
    )
    plan_type = models.CharField(
        max_length=20,
        choices=PLAN_TYPE_CHOICES,
        null=True,
        blank=True,
        help_text='Current plan type'
    )
    client_limit = models.IntegerField(
        null=True,
        blank=True,
        help_text='Max clients allowed (-1 for unlimited)'
    )

    # Account blocking fields
    account_blocked = models.BooleanField(
        default=False,
        help_text='Whether the account is blocked from access'
    )
    block_reason = models.TextField(
        blank=True,
        null=True,
        help_text='Reason for blocking the account'
    )
    blocked_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the account was blocked'
    )

    USERNAME_FIELD='username'
    REQUIRED_FIELDS=['email', 'phone_number']

    objects = CustomUserManager()

    @property
    def is_trial_active(self):
        """Check if user is in active trial period"""
        if self.subscription_status != 'trial':
            return False
        if not self.trial_end_date:
            return False
        return timezone.now().date() <= self.trial_end_date

    @property
    def is_subscription_active(self):
        """Check if user has active access (trial or paid)"""
        return self.subscription_status in ['trial', 'active'] and (
            self.is_trial_active or self.subscription_status == 'active'
        )

    @property
    def days_until_trial_end(self):
        """Days remaining in trial"""
        if not self.trial_end_date:
            return None
        delta = self.trial_end_date - timezone.now().date()
        return max(0, delta.days)

    @property
    def should_be_auto_blocked(self):
        """Check if account should be auto-blocked due to expired trial"""
        # Only auto-block if:
        # 1. User is a trainer
        # 2. Subscription status is 'trial' or 'expired' (admin hasn't upgraded to 'active')
        # 3. Trial has expired
        if self.user_type != 'trainer':
            return False
        # Admin can prevent auto-block by setting status to 'active', 'cancelled', or 'suspended'
        if self.subscription_status not in ['trial', 'expired']:
            return False
        if not self.trial_end_date:
            return False
        return timezone.now().date() > self.trial_end_date

    def get_client_limit(self):
        """Get maximum allowed clients for this user"""
        if self.client_limit:
            return self.client_limit
        # Default limits by plan
        defaults = {
            'trial': 5,
            'starter': 10,
            'professional': 50,
            'enterprise': -1  # unlimited
        }
        return defaults.get(self.plan_type, 5)

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


class TermsAcceptance(models.Model):
    """Model to track when users accept Terms and Conditions"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='terms_acceptance')
    accepted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    version = models.CharField(max_length=50, default='1.0')  # Track version of terms accepted

    def __str__(self):
        return f"Terms accepted by {self.user.email} on {self.accepted_at}"

    class Meta:
        ordering = ['-accepted_at']
        verbose_name_plural = "Terms Acceptances"