"""
Trial Enforcement Middleware
Checks trial status and enforces subscription limits
"""

from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class TrialEnforcementMiddleware(MiddlewareMixin):
    """
    Middleware to enforce trial limits and subscription status
    """

    # Paths that don't require active subscription
    EXEMPT_PATHS = [
        '/api/auth/login/',
        '/api/auth/signup/',
        '/api/auth/logout/',
        '/api/auth/password-reset/',
        '/api/auth/subscription/status/',
        '/api/auth/subscription/upgrade/',
        '/api/auth/me/',
        '/api/auth/terms/',
        '/admin/',
        '/static/',
        '/media/',
    ]

    def process_request(self, request):
        """Check trial/subscription status before processing request"""

        # Skip if path is exempt
        if any(request.path.startswith(path) for path in self.EXEMPT_PATHS):
            return None

        # Skip if not authenticated
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None

        # Skip for admin/superuser
        if request.user.is_superuser or request.user.user_type == 'admin':
            return None

        # Skip for non-trainer users
        if request.user.user_type != 'trainer':
            return None

        # Auto-block if trial has expired and admin hasn't intervened
        if hasattr(request.user, 'should_be_auto_blocked') and request.user.should_be_auto_blocked:
            if not request.user.account_blocked:
                # Auto-block the account
                request.user.account_blocked = True
                request.user.block_reason = 'Your 14-day trial period has expired. Please contact support to upgrade your subscription.'
                request.user.blocked_at = timezone.now()
                request.user.save(update_fields=['account_blocked', 'block_reason', 'blocked_at'])

                logger.info(f"Auto-blocked trainer {request.user.username} due to expired trial")

        # Check if account is blocked (manual or auto)
        if hasattr(request.user, 'account_blocked') and request.user.account_blocked:
            return JsonResponse({
                'error': 'Account blocked',
                'message': request.user.block_reason or 'Your account has been blocked. Please contact support for assistance.',
                'account_blocked': True,
                'blocked_at': str(request.user.blocked_at) if request.user.blocked_at else None,
            }, status=403)  # 403 Forbidden

        # Check if user has subscription fields (for backward compatibility)
        if not hasattr(request.user, 'subscription_status') or request.user.subscription_status is None:
            # User doesn't have trial setup yet - allow access
            return None

        # Check subscription status
        if not request.user.is_subscription_active:
            return JsonResponse({
                'error': 'Subscription expired',
                'message': 'Your trial has ended. Please upgrade to continue using TrainrUp.',
                'subscription_status': request.user.subscription_status,
                'trial_end_date': str(request.user.trial_end_date) if request.user.trial_end_date else None,
                'upgrade_required': True
            }, status=402)  # 402 Payment Required

        # Check trial expiration approaching (warn at 3 days)
        if request.user.subscription_status == 'trial':
            days_left = request.user.days_until_trial_end
            if days_left is not None and days_left <= 3:
                # Add warning header (frontend can display banner)
                response = self.get_response(request)
                response['X-Trial-Warning'] = f"Your trial ends in {days_left} day{'s' if days_left != 1 else ''}"
                response['X-Trial-Days-Left'] = str(days_left)
                return response

        return None
