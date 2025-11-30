"""
Gmail API utility functions for sending emails.
Uses the Gmail API with token.pkl for authentication.
"""
import base64
import pickle
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from googleapiclient.discovery import build
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_gmail(to_email, subject, html_body, text_body=None, from_email=None):
    """
    Send an email using Gmail API.

    Args:
        to_email (str): Recipient email address
        subject (str): Email subject
        html_body (str): HTML content of the email
        text_body (str, optional): Plain text fallback. If not provided, a simple version will be created
        from_email (str, optional): Sender email. Defaults to DEFAULT_FROM_EMAIL from settings

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Get token path from settings or use default
        token_path = getattr(settings, 'GMAIL_TOKEN_PATH', os.path.join(settings.BASE_DIR, 'token.pkl'))

        # Check if token file exists
        if not os.path.exists(token_path):
            logger.error(f"Gmail token file not found at: {token_path}")
            return False

        # Load credentials
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)

        # Build Gmail service
        service = build('gmail', 'v1', credentials=creds)

        # Build message
        message = MIMEMultipart('alternative')
        message['To'] = to_email
        message['From'] = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trainrup.fit')
        message['Subject'] = subject

        # Add plain text version
        if text_body:
            message.attach(MIMEText(text_body, 'plain'))

        # Add HTML version
        message.attach(MIMEText(html_body, 'html'))

        # Encode message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

        # Send via Gmail API
        sent = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()

        logger.info(f"Email sent successfully to {to_email}. Message ID: {sent['id']}")
        return True

    except FileNotFoundError as e:
        logger.error(f"Token file not found: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email via Gmail API: {str(e)}")
        return False


def send_password_reset_email(user_email, username, reset_url):
    """
    Send a password reset email using the Gmail API.

    Args:
        user_email (str): User's email address
        username (str): User's username
        reset_url (str): Password reset URL with token

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    from django.template.loader import render_to_string

    try:
        # Render HTML email template
        html_content = render_to_string('authentication/password_reset_email.html', {
            'username': username,
            'reset_url': reset_url,
        })

        # Plain text fallback
        text_content = f'''Hello {username},

You have requested to reset your password for your TrainrUp account.

Click the link below to reset your password:

{reset_url}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
The TrainrUp Team
'''

        # Send email using Gmail API
        return send_gmail(
            to_email=user_email,
            subject='Password Reset - TrainrUp',
            html_body=html_content,
            text_body=text_content
        )

    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        return False
