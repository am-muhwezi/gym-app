"""
M-Pesa Integration Service
Handles M-Pesa STK Push (Lipa Na M-Pesa Online) integration
"""

import requests
import base64
from datetime import datetime
from decouple import config
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class MpesaService:
    """Service for M-Pesa Daraja API integration"""

    def __init__(self):
        """Initialize M-Pesa service with credentials from environment"""
        # M-Pesa Credentials - should be in .env file
        self.consumer_key = config('MPESA_CONSUMER_KEY', default='')
        self.consumer_secret = config('MPESA_CONSUMER_SECRET', default='')
        self.business_shortcode = config('MPESA_SHORTCODE', default='')
        self.passkey = config('MPESA_PASSKEY', default='')
        self.callback_url = config('MPESA_CALLBACK_URL', default='')

        # API URLs
        self.environment = config('MPESA_ENVIRONMENT', default='sandbox')  # 'sandbox' or 'production'

        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'

        self.auth_url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        self.stk_push_url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'

    def get_access_token(self):
        """
        Generate access token for M-Pesa API

        Returns:
            str: Access token or None if failed
        """
        try:
            # Create authentication string
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            auth_bytes = auth_string.encode('ascii')
            auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

            headers = {
                'Authorization': f'Basic {auth_base64}',
            }

            response = requests.get(self.auth_url, headers=headers, timeout=30)

            if response.status_code == 200:
                json_response = response.json()
                return json_response.get('access_token')
            else:
                logger.error(f"M-Pesa auth failed: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Error getting M-Pesa access token: {str(e)}")
            return None

    def generate_password(self, timestamp):
        """
        Generate password for STK push

        Args:
            timestamp: Timestamp string in format YYYYMMDDHHmmss

        Returns:
            str: Base64 encoded password
        """
        password_string = f"{self.business_shortcode}{self.passkey}{timestamp}"
        password_bytes = password_string.encode('ascii')
        return base64.b64encode(password_bytes).decode('ascii')

    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push (Lipa Na M-Pesa Online)

        Args:
            phone_number: Phone number to send STK push (254XXXXXXXXX format)
            amount: Amount to charge
            account_reference: Reference for the transaction (e.g., invoice number)
            transaction_desc: Description of the transaction

        Returns:
            dict: Response from M-Pesa API with status and details
        """
        # Check if credentials are configured
        if not all([self.consumer_key, self.consumer_secret, self.business_shortcode, self.passkey]):
            return {
                'success': False,
                'message': 'M-Pesa credentials not configured. Please contact support.',
                'error': 'CREDENTIALS_NOT_CONFIGURED'
            }

        try:
            # Get access token
            access_token = self.get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'message': 'Failed to authenticate with M-Pesa. Please try again later.',
                    'error': 'AUTH_FAILED'
                }

            # Generate timestamp and password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)

            # Prepare request headers
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
            }

            # Prepare request payload
            payload = {
                'BusinessShortCode': self.business_shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),  # M-Pesa expects integer
                'PartyA': phone_number,  # Phone number sending money
                'PartyB': self.business_shortcode,  # Organization receiving funds
                'PhoneNumber': phone_number,  # Phone number to receive STK push
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc,
            }

            # Make API request
            response = requests.post(
                self.stk_push_url,
                json=payload,
                headers=headers,
                timeout=30
            )

            # Parse response
            response_data = response.json()

            if response.status_code == 200 and response_data.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'message': 'STK push sent successfully. Please check your phone.',
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'merchant_request_id': response_data.get('MerchantRequestID'),
                    'response_code': response_data.get('ResponseCode'),
                    'response_description': response_data.get('ResponseDescription'),
                }
            else:
                logger.error(f"M-Pesa STK Push failed: {response.status_code} - {response_data}")
                return {
                    'success': False,
                    'message': response_data.get('errorMessage', 'Failed to initiate payment. Please try again.'),
                    'error': 'STK_PUSH_FAILED',
                    'response_code': response_data.get('ResponseCode', response_data.get('errorCode')),
                }

        except requests.exceptions.Timeout:
            logger.error("M-Pesa API request timeout")
            return {
                'success': False,
                'message': 'Request timeout. Please try again.',
                'error': 'TIMEOUT'
            }
        except Exception as e:
            logger.error(f"Error initiating STK push: {str(e)}")
            return {
                'success': False,
                'message': 'An error occurred while processing payment. Please try again.',
                'error': str(e)
            }

    def query_stk_status(self, checkout_request_id):
        """
        Query the status of an STK push transaction

        Args:
            checkout_request_id: CheckoutRequestID from STK push response

        Returns:
            dict: Transaction status details
        """
        # This would be implemented to check transaction status
        # For MVP, we'll rely on callback
        pass

    @staticmethod
    def handle_callback(callback_data):
        """
        Handle M-Pesa callback data

        Args:
            callback_data: JSON data from M-Pesa callback

        Returns:
            dict: Processed callback information
        """
        try:
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})

            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            checkout_request_id = stk_callback.get('CheckoutRequestID')

            # Extract callback metadata
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])

            # Parse metadata items
            metadata = {}
            for item in items:
                name = item.get('Name')
                value = item.get('Value')
                metadata[name] = value

            return {
                'success': result_code == 0,
                'result_code': result_code,
                'result_description': result_desc,
                'checkout_request_id': checkout_request_id,
                'amount': metadata.get('Amount'),
                'mpesa_receipt_number': metadata.get('MpesaReceiptNumber'),
                'transaction_date': metadata.get('TransactionDate'),
                'phone_number': metadata.get('PhoneNumber'),
            }

        except Exception as e:
            logger.error(f"Error handling M-Pesa callback: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
