#!/usr/bin/env python
"""
Script to automatically send terms email (non-interactive)
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymapp.settings')
django.setup()

from authentication.models import User, TermsAcceptance
from authentication.gmail_utils import send_terms_notification_email
from django.conf import settings

def send_email():
    test_email = 'intricatesyllable@gmail.com'
    test_username = 'intricatesyllable'
    test_phone = '+254700000001'

    print("=" * 60)
    print("TrainrUp Terms Email Test (Auto)")
    print("=" * 60)
    print()

    # Get or create the test user
    user, created = User.objects.get_or_create(
        email=test_email,
        defaults={
            'username': test_username,
            'phone_number': test_phone,
            'user_type': 'trainer'
        }
    )

    if created:
        user.set_password('test123456')
        user.save()
        print(f"✓ Created test user: {user.email}")
    else:
        print(f"✓ Test user exists: {user.email}")

    # Delete previous acceptance if exists
    if hasattr(user, 'terms_acceptance'):
        accepted_at = user.terms_acceptance.accepted_at
        user.terms_acceptance.delete()
        print(f"✓ Deleted previous acceptance (was accepted on {accepted_at})")
    else:
        print("✓ User has not accepted terms yet")

    print()
    print("User Details:")
    print(f"  - Username: {user.username}")
    print(f"  - Email: {user.email}")
    print(f"  - Phone: {user.phone_number}")
    print(f"  - Type: {user.user_type}")
    print()

    # Build terms URL
    terms_url = f"{settings.FRONTEND_URL}/#/terms"
    print(f"Terms URL: {terms_url}")
    print()
    print("Sending email...")
    print()

    # Send the email
    try:
        success = send_terms_notification_email(
            user_email=user.email,
            username=user.username,
            terms_url=terms_url
        )

        if success:
            print("✅ EMAIL SENT SUCCESSFULLY!")
            print()
            print("Next steps:")
            print("1. Check Gmail inbox for 'intricatesyllable@gmail.com'")
            print("2. Open the email with GREEN branding (not blue)")
            print("3. Click 'Review and Accept Terms' button")
            print("4. You'll see the terms page with GREEN theme")
            print("5. Fill in your email and accept the terms")
            print()
            print(f"Direct terms page link: {settings.FRONTEND_URL}/#/terms")
            print(f"Or backend direct: {settings.FRONTEND_URL.replace('3000', '8000')}/api/auth/terms/")
        else:
            print("❌ Failed to send email")
            print()
            print("Check:")
            print("1. Gmail API credentials are valid")
            print("2. token.pkl is not expired")
            print("3. Django logs for specific errors")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

    print()
    print("=" * 60)

if __name__ == '__main__':
    send_email()
