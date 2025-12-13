from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.conf import settings
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from .models import User, PasswordResetToken, TermsAcceptance
from . import serializers
from .permissions import IsAdmin
from .gmail_utils import send_password_reset_email
import logging

logger = logging.getLogger(__name__)


class HelloAuthView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "Hello Auth"}, status=status.HTTP_200_OK)


class SignupView(generics.GenericAPIView):
    """User registration/signup"""
    serializer_class = serializers.UserCreationSerialzer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Initialize 14-day trial for trainers
            if user.user_type == 'trainer':
                user.trial_start_date = timezone.now().date()
                user.trial_end_date = timezone.now().date() + timedelta(days=14)
                user.subscription_status = 'trial'
                user.plan_type = 'trial'
                user.client_limit = 5  # Trial users can have up to 5 clients
                user.save()

            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)

            # Return user data with token
            user_serializer = serializers.UserSerializer(user)
            return Response({
                'token': token.key,
                'user': user_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.GenericAPIView):
    """User login"""
    serializer_class = serializers.LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']

            # Auto-block if trial has expired for trainers
            if user.user_type == 'trainer' and hasattr(user, 'should_be_auto_blocked'):
                if user.should_be_auto_blocked and not user.account_blocked:
                    user.account_blocked = True
                    user.block_reason = 'Your 14-day trial period has expired. Please contact support to upgrade your subscription.'
                    user.blocked_at = timezone.now()
                    user.save(update_fields=['account_blocked', 'block_reason', 'blocked_at'])
                    logger.info(f"Auto-blocked trainer {user.username} during login due to expired trial")

            # Check if account is blocked (for trainers only)
            if user.user_type == 'trainer' and hasattr(user, 'account_blocked') and user.account_blocked:
                return Response({
                    'error': 'Account blocked',
                    'message': user.block_reason or 'Your account has been blocked. Please contact support for assistance.',
                    'account_blocked': True,
                    'blocked_at': str(user.blocked_at) if user.blocked_at else None,
                }, status=status.HTTP_403_FORBIDDEN)

            # Update last_login timestamp
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            # Get or create token
            token, created = Token.objects.get_or_create(user=user)

            # Return user data with token
            user_serializer = serializers.UserSerializer(user)
            return Response({
                'token': token.key,
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User logout - deletes the token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """Get current authenticated user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = serializers.UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordResetRequestView(generics.GenericAPIView):
    """Request a password reset token"""
    serializer_class = serializers.PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)

                # Invalidate any existing tokens for this user
                PasswordResetToken.objects.filter(user=user, used=False).update(used=True)

                # Create new reset token
                reset_token = PasswordResetToken.objects.create(user=user)

                # Build password reset URL
                reset_url = f"{settings.FRONTEND_URL}/#/reset-password?token={reset_token.token}"

                # Send password reset email using Gmail API
                try:
                    email_sent = send_password_reset_email(
                        user_email=user.email,
                        username=user.username,
                        reset_url=reset_url
                    )

                    if email_sent:
                        logger.info(f"Password reset email sent to {user.email}")
                    else:
                        logger.error(f"Failed to send password reset email to {user.email}")
                        # Only return reset_url in development mode for debugging
                        if settings.DEBUG:
                            return Response({
                                "message": "Password reset token created. Email sending failed.",
                                "reset_url": reset_url
                            }, status=status.HTTP_200_OK)
                        else:
                            # In production, don't expose the URL for security
                            return Response({
                                "message": "If an account exists with this email, a password reset link has been sent."
                            }, status=status.HTTP_200_OK)

                except Exception as e:
                    logger.error(f"Error sending password reset email: {str(e)}")
                    # Only return reset_url in development mode for debugging
                    if settings.DEBUG:
                        return Response({
                            "message": "Password reset token created. Email sending failed.",
                            "reset_url": reset_url
                        }, status=status.HTTP_200_OK)
                    else:
                        # In production, don't expose the URL for security
                        return Response({
                            "message": "If an account exists with this email, a password reset link has been sent."
                        }, status=status.HTTP_200_OK)

                return Response({
                    "message": "If an account exists with this email, a password reset link has been sent."
                }, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                # Don't reveal whether the user exists or not for security
                pass

            return Response({
                "message": "If an account exists with this email, a password reset link has been sent."
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirm password reset with token"""
    serializer_class = serializers.PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                reset_token = PasswordResetToken.objects.get(token=token)

                if not reset_token.is_valid():
                    return Response({
                        "error": "This password reset link has expired or has already been used."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Reset the password
                user = reset_token.user
                user.set_password(new_password)
                user.save()

                # Mark token as used
                reset_token.used = True
                reset_token.save()

                logger.info(f"Password reset successful for user {user.email}")

                return Response({
                    "message": "Password has been reset successfully. You can now login with your new password."
                }, status=status.HTTP_200_OK)

            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid password reset token."
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin Trainer Management Views

class TrainerListView(generics.ListAPIView):
    """List all trainer accounts (admin only) - SaaS perspective"""
    serializer_class = serializers.TrainerSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.filter(user_type='trainer').order_by('-date_joined')


class TrainerDetailView(APIView):
    """Get specific trainer account details with operations (admin only) - SaaS perspective"""
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        try:
            trainer = User.objects.get(pk=pk, user_type='trainer')
        except User.DoesNotExist:
            return Response({
                'error': 'Trainer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        from clients.models import Client
        from payments.models import Payment
        from bookings.models import Booking

        # Get trainer's basic info
        trainer_serializer = serializers.TrainerSerializer(trainer)

        # Get trainer's statistics
        total_clients = Client.objects.filter(trainer=trainer, is_removed=False).count()
        removed_clients = Client.objects.filter(trainer=trainer, is_removed=True).count()

        total_bookings = Booking.objects.filter(trainer=trainer).count()
        completed_bookings = Booking.objects.filter(trainer=trainer, status='completed').count()
        upcoming_bookings = Booking.objects.filter(
            trainer=trainer,
            status__in=['scheduled', 'confirmed'],
            session_date__gte=timezone.now().date()
        ).count()

        # Get payments through clients (Payment -> Client -> Trainer)
        total_payments = Payment.objects.filter(client__trainer=trainer).count()
        completed_payments = Payment.objects.filter(client__trainer=trainer, payment_status='completed').count()
        total_revenue = Payment.objects.filter(
            client__trainer=trainer,
            payment_status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        # Recent activity
        recent_clients = Client.objects.filter(
            trainer=trainer,
            is_removed=False
        ).order_by('-created_at')[:5].values(
            'id', 'first_name', 'last_name', 'email', 'created_at', 'status'
        )

        recent_bookings = Booking.objects.filter(
            trainer=trainer
        ).order_by('-session_date', '-start_time')[:5].values(
            'id', 'title', 'session_date', 'start_time', 'status', 'client'
        )

        return Response({
            'trainer': trainer_serializer.data,
            'statistics': {
                'clients': {
                    'total': total_clients,
                    'removed': removed_clients,
                },
                'bookings': {
                    'total': total_bookings,
                    'completed': completed_bookings,
                    'upcoming': upcoming_bookings,
                },
                'payments': {
                    'total': total_payments,
                    'completed': completed_payments,
                    'total_revenue': float(total_revenue),
                },
            },
            'subscription': {
                'status': trainer.subscription_status,
                'plan_type': trainer.plan_type,
                'trial_start_date': trainer.trial_start_date,
                'trial_end_date': trainer.trial_end_date,
                'is_trial_active': trainer.is_trial_active,
                'days_until_trial_end': trainer.days_until_trial_end,
                'client_limit': trainer.get_client_limit(),
            },
            'blocking': {
                'account_blocked': trainer.account_blocked,
                'block_reason': trainer.block_reason,
                'blocked_at': trainer.blocked_at,
            },
            'recent_activity': {
                'clients': list(recent_clients),
                'bookings': list(recent_bookings),
            },
        }, status=status.HTTP_200_OK)


class TrainerCreateView(generics.CreateAPIView):
    """Create a new trainer (admin only)"""
    serializer_class = serializers.TrainerCreateSerializer
    permission_classes = [IsAdmin]


class TrainerUpdateView(generics.UpdateAPIView):
    """Update trainer details (admin only)"""
    serializer_class = serializers.TrainerUpdateSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(user_type='trainer')


class TrainerDeleteView(generics.DestroyAPIView):
    """Delete a trainer (admin only)"""
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(user_type='trainer')


class TrainerToggleActiveView(APIView):
    """Toggle trainer active status (admin only)"""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            trainer = User.objects.get(pk=pk, user_type='trainer')
            trainer.is_active = not trainer.is_active
            trainer.save()

            return Response({
                'message': f'Trainer {"activated" if trainer.is_active else "suspended"} successfully',
                'is_active': trainer.is_active
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'error': 'Trainer not found'
            }, status=status.HTTP_404_NOT_FOUND)


class TrainerResetPasswordView(APIView):
    """Reset trainer password (admin only)"""
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            trainer = User.objects.get(pk=pk, user_type='trainer')
            new_password = request.data.get('new_password')

            if not new_password:
                return Response({
                    'error': 'New password is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if len(new_password) < 6:
                return Response({
                    'error': 'Password must be at least 6 characters'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Reset the password
            trainer.set_password(new_password)
            trainer.save()

            logger.info(f"Admin {request.user.username} reset password for trainer {trainer.username}")

            return Response({
                'message': f'Password reset successfully for trainer {trainer.username}'
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'error': 'Trainer not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AdminAnalyticsView(APIView):
    """Platform-level analytics for admin (SaaS perspective)"""
    permission_classes = [IsAdmin]

    def get(self, request):
        from clients.models import Client
        from payments.models import Payment
        from bookings.models import Booking

        # Count trainers
        total_trainers = User.objects.filter(user_type='trainer').count()
        active_trainers = User.objects.filter(user_type='trainer', is_active=True).count()
        suspended_trainers = User.objects.filter(user_type='trainer', is_active=False).count()

        # Count trainers with expired trials (pending auto-block)
        # Include both 'trial' and 'expired' status
        expired_trial_trainers = User.objects.filter(
            user_type='trainer',
            subscription_status__in=['trial', 'expired'],
            trial_end_date__lt=timezone.now().date(),
            account_blocked=False
        ).count()

        # Count blocked trainers
        blocked_trainers = User.objects.filter(
            user_type='trainer',
            account_blocked=True
        ).count()

        # Recent registrations (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_trainers_this_month = User.objects.filter(
            user_type='trainer',
            date_joined__gte=thirty_days_ago
        ).count()

        # Trainer activity (who logged in recently)
        seven_days_ago = timezone.now() - timedelta(days=7)
        active_last_7_days = User.objects.filter(
            user_type='trainer',
            last_login__gte=seven_days_ago
        ).count()

        # Platform-wide stats (total ecosystem size)
        total_clients_on_platform = Client.objects.count()
        total_bookings_on_platform = Booking.objects.count()
        total_payments_on_platform = Payment.objects.filter(payment_status='completed').count()

        # Revenue if you charge trainers subscription fees (placeholder)
        # In a real SaaS, you'd have a Subscription model tracking trainer payments to you

        return Response({
            'trainers': {
                'total': total_trainers,
                'active': active_trainers,
                'suspended': suspended_trainers,
                'blocked': blocked_trainers,
                'expired_trials': expired_trial_trainers,
                'new_this_month': new_trainers_this_month,
                'active_last_7_days': active_last_7_days,
            },
            'platform': {
                'total_clients': total_clients_on_platform,
                'total_bookings': total_bookings_on_platform,
                'total_completed_payments': total_payments_on_platform,
            },
            'note': 'These are platform-wide statistics showing the size of your trainer ecosystem'
        }, status=status.HTTP_200_OK)


# Terms and Conditions Views

class TermsPageView(APIView):
    """Serve the terms and conditions HTML page"""
    permission_classes = [AllowAny]

    def get(self, request):
        return render(request, 'authentication/terms-and-conditions.html')


class TermsAcceptanceView(generics.CreateAPIView):
    """Accept terms and conditions"""
    serializer_class = serializers.TermsAcceptanceSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Terms and conditions accepted successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TermsAcceptanceStatusView(APIView):
    """Check if a user has accepted terms"""
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get('email')

        if not email:
            return Response({
                'error': 'Email parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            has_accepted = hasattr(user, 'terms_acceptance')

            if has_accepted:
                acceptance = user.terms_acceptance
                return Response({
                    'has_accepted': True,
                    'accepted_at': acceptance.accepted_at,
                    'version': acceptance.version
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'has_accepted': False
                }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


# Subscription Management Views

class SubscriptionStatusView(APIView):
    """Get current user's subscription status"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from clients.models import Client

        return Response({
            'subscription_status': user.subscription_status,
            'plan_type': user.plan_type,
            'trial_start_date': user.trial_start_date,
            'trial_end_date': user.trial_end_date,
            'is_trial_active': user.is_trial_active,
            'is_subscription_active': user.is_subscription_active,
            'days_until_trial_end': user.days_until_trial_end,
            'client_limit': user.get_client_limit(),
            'current_client_count': Client.objects.filter(
                trainer=user,
                is_removed=False
            ).count() if user.user_type == 'trainer' else 0
        }, status=status.HTTP_200_OK)


class SubscriptionUpgradeView(APIView):
    """Upgrade from trial to paid subscription"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        plan_type = request.data.get('plan_type')
        payment_method = request.data.get('payment_method')

        # Validate plan
        valid_plans = ['starter', 'professional', 'enterprise']
        if plan_type not in valid_plans:
            return Response({
                'error': 'Invalid plan type',
                'valid_plans': valid_plans
            }, status=status.HTTP_400_BAD_REQUEST)

        # In full implementation: Process payment here via M-Pesa or other gateway
        # For now, just update status

        user.subscription_status = 'active'
        user.plan_type = plan_type
        user.client_limit = {
            'starter': 10,
            'professional': 50,
            'enterprise': -1  # unlimited
        }[plan_type]
        user.save()

        logger.info(f"User {user.email} upgraded to {plan_type} plan")

        return Response({
            'status': 'upgraded',
            'plan_type': plan_type,
            'client_limit': user.client_limit,
            'message': f'Successfully upgraded to {plan_type} plan'
        }, status=status.HTTP_200_OK)


# Admin Subscription Management Views

class TrainerBlockView(APIView):
    """Block a trainer account (admin only)"""
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            trainer = User.objects.get(pk=pk, user_type='trainer')
        except User.DoesNotExist:
            return Response({
                'error': 'Trainer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        block_reason = request.data.get('block_reason', 'Account blocked by administrator')

        # Block the account
        trainer.account_blocked = True
        trainer.block_reason = block_reason
        trainer.blocked_at = timezone.now()
        trainer.save()

        logger.info(f"Admin {request.user.username} blocked trainer {trainer.username}")

        return Response({
            'message': f'Trainer {trainer.username} has been blocked',
            'account_blocked': True,
            'block_reason': block_reason,
            'blocked_at': trainer.blocked_at
        }, status=status.HTTP_200_OK)


class TrainerUnblockView(APIView):
    """Unblock a trainer account (admin only)"""
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            trainer = User.objects.get(pk=pk, user_type='trainer')
        except User.DoesNotExist:
            return Response({
                'error': 'Trainer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Unblock the account
        trainer.account_blocked = False
        trainer.block_reason = None
        trainer.blocked_at = None
        trainer.save()

        logger.info(f"Admin {request.user.username} unblocked trainer {trainer.username}")

        return Response({
            'message': f'Trainer {trainer.username} has been unblocked',
            'account_blocked': False
        }, status=status.HTTP_200_OK)


class AdminTrainerSubscriptionUpdateView(APIView):
    """Update trainer subscription (admin only)"""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            trainer = User.objects.get(pk=pk, user_type='trainer')
        except User.DoesNotExist:
            return Response({
                'error': 'Trainer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        subscription_status = request.data.get('subscription_status')
        plan_type = request.data.get('plan_type')
        client_limit = request.data.get('client_limit')
        extend_trial_days = request.data.get('extend_trial_days')

        # Update subscription status
        if subscription_status:
            valid_statuses = ['trial', 'active', 'expired', 'cancelled', 'suspended']
            if subscription_status not in valid_statuses:
                return Response({
                    'error': 'Invalid subscription status',
                    'valid_statuses': valid_statuses
                }, status=status.HTTP_400_BAD_REQUEST)
            trainer.subscription_status = subscription_status

        # Update plan type
        if plan_type:
            valid_plans = ['trial', 'starter', 'professional', 'enterprise']
            if plan_type not in valid_plans:
                return Response({
                    'error': 'Invalid plan type',
                    'valid_plans': valid_plans
                }, status=status.HTTP_400_BAD_REQUEST)
            trainer.plan_type = plan_type

        # Update client limit
        if client_limit is not None:
            trainer.client_limit = client_limit

        # Extend trial
        if extend_trial_days:
            if trainer.trial_end_date:
                trainer.trial_end_date = trainer.trial_end_date + timedelta(days=extend_trial_days)
            else:
                trainer.trial_start_date = timezone.now().date()
                trainer.trial_end_date = timezone.now().date() + timedelta(days=extend_trial_days)
                trainer.subscription_status = 'trial'
                trainer.plan_type = 'trial'

        trainer.save()

        # Auto-unblock if admin intervention makes account valid again
        # This includes: changing status to 'active', extending trial, or changing plan type
        if trainer.account_blocked:
            # Check if account should no longer be blocked based on new subscription settings
            should_unblock = False

            # Unblock if subscription status changed to 'active'
            if subscription_status == 'active':
                should_unblock = True
                logger.info(f"Auto-unblocking {trainer.username} - subscription set to active")

            # Unblock if trial was extended and is now in the future
            elif extend_trial_days and trainer.trial_end_date and timezone.now().date() <= trainer.trial_end_date:
                should_unblock = True
                logger.info(f"Auto-unblocking {trainer.username} - trial extended to {trainer.trial_end_date}")

            # Unblock if subscription status changed away from 'trial'/'expired'
            elif subscription_status and subscription_status not in ['trial', 'expired']:
                should_unblock = True
                logger.info(f"Auto-unblocking {trainer.username} - subscription status changed to {subscription_status}")

            # Unblock if account should no longer be auto-blocked based on current settings
            elif not trainer.should_be_auto_blocked:
                should_unblock = True
                logger.info(f"Auto-unblocking {trainer.username} - trial no longer expired")

            if should_unblock:
                trainer.account_blocked = False
                trainer.block_reason = None
                trainer.blocked_at = None
                trainer.save(update_fields=['account_blocked', 'block_reason', 'blocked_at'])
                logger.info(f"Admin {request.user.username} auto-unblocked trainer {trainer.username}")

        logger.info(f"Admin {request.user.username} updated subscription for trainer {trainer.username}")

        return Response({
            'message': 'Subscription updated successfully',
            'subscription': {
                'status': trainer.subscription_status,
                'plan_type': trainer.plan_type,
                'trial_start_date': trainer.trial_start_date,
                'trial_end_date': trainer.trial_end_date,
                'is_trial_active': trainer.is_trial_active,
                'days_until_trial_end': trainer.days_until_trial_end,
                'client_limit': trainer.get_client_limit(),
            },
            'blocking': {
                'account_blocked': trainer.account_blocked,
                'block_reason': trainer.block_reason,
                'blocked_at': trainer.blocked_at,
            }
        }, status=status.HTTP_200_OK)