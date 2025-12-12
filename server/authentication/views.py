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


class TrainerDetailView(generics.RetrieveAPIView):
    """Get specific trainer account details (admin only) - SaaS perspective"""
    serializer_class = serializers.TrainerSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(user_type='trainer')


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