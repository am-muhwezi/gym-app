from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.conf import settings
from .models import User, PasswordResetToken
from . import serializers
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