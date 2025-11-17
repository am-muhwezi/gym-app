"""
Payment Views
Handles payment CRUD operations, M-Pesa integration, and receipt generation
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Payment
from clients.models import Client
from .serializers import (
    PaymentSerializer,
    PaymentListSerializer,
    PaymentCreateSerializer,
    PaymentUpdateSerializer,
    MpesaPaymentSerializer,
    PaymentReceiptSerializer,
)
from .mpesa_service import MpesaService


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment CRUD operations and actions

    Endpoints:
    - GET    /api/payments/              - List all payments for trainer's clients
    - POST   /api/payments/              - Create new payment/invoice
    - GET    /api/payments/{id}/         - Get single payment details
    - PATCH  /api/payments/{id}/         - Update payment
    - DELETE /api/payments/{id}/         - Delete payment
    - POST   /api/payments/{id}/pay_mpesa/  - Initiate M-Pesa payment
    - POST   /api/payments/{id}/mark_paid/  - Mark payment as paid (manual)
    - GET    /api/payments/{id}/receipt/    - Get payment receipt
    - GET    /api/payments/statistics/      - Get payment statistics
    - GET    /api/payments/overdue/         - Get overdue payments
    """

    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        """Get payments for authenticated trainer's clients only"""
        return Payment.objects.filter(
            client__trainer=self.request.user
        ).select_related('client')

    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'list':
            return PaymentListSerializer
        elif self.action == 'create':
            return PaymentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PaymentUpdateSerializer
        elif self.action == 'receipt':
            return PaymentReceiptSerializer
        return PaymentSerializer

    def list(self, request):
        """
        List payments with filtering options and pagination

        Query params:
        - status: Filter by payment status (pending, completed, failed, refunded)
        - client: Filter by client ID
        - overdue: Filter overdue payments (true/false)
        - date_from: Filter payments from this date
        - date_to: Filter payments to this date
        - page: Page number (default: 1)
        - page_size: Items per page (default: 20, max: 100)
        """
        payments = self.get_queryset()

        # Filter by status
        payment_status = request.query_params.get('status')
        if payment_status:
            payments = payments.filter(payment_status=payment_status)

        # Filter by client
        client_id = request.query_params.get('client')
        if client_id:
            payments = payments.filter(client_id=client_id)

        # Filter overdue payments
        if request.query_params.get('overdue') == 'true':
            today = timezone.now().date()
            payments = payments.filter(
                payment_status='pending',
                due_date__lt=today
            )

        # Filter by date range
        date_from = request.query_params.get('date_from')
        if date_from:
            payments = payments.filter(created_at__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            payments = payments.filter(created_at__date__lte=date_to)

        # Order by created date (newest first)
        payments = payments.order_by('-created_at')

        # Use pagination
        page = self.paginate_queryset(payments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Fallback without pagination (shouldn't normally reach here)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create new payment/invoice"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        # Create payment
        payment = Payment.objects.create(
            **serializer.validated_data,
            payment_status='pending'
        )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED
        )

    def retrieve(self, request, pk=None):
        """Get single payment with full details"""
        try:
            payment = self.get_queryset().get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PaymentSerializer(payment)
        return Response(serializer.data)

    def update(self, request, pk=None):
        """Update payment"""
        try:
            payment = self.get_queryset().get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(payment, data=request.data)
        serializer.is_valid(raise_exception=True)

        # Update payment
        for field, value in serializer.validated_data.items():
            setattr(payment, field, value)
        payment.save()

        return Response(PaymentSerializer(payment).data)

    def partial_update(self, request, pk=None):
        """Partial update of payment"""
        try:
            payment = self.get_queryset().get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(payment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Update payment
        for field, value in serializer.validated_data.items():
            setattr(payment, field, value)
        payment.save()

        return Response(PaymentSerializer(payment).data)

    def destroy(self, request, pk=None):
        """Delete payment"""
        try:
            payment = self.get_queryset().get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Don't allow deleting completed payments
        if payment.payment_status == 'completed':
            return Response(
                {'error': 'Cannot delete completed payments. Use refund instead.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def pay_mpesa(self, request, pk=None):
        """
        Initiate M-Pesa STK Push payment

        POST /api/payments/{id}/pay_mpesa/
        Body: {
            "phone_number": "254712345678"
        }
        """
        try:
            payment = self.get_queryset().get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if payment is already completed
        if payment.payment_status == 'completed':
            return Response(
                {'error': 'Payment is already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get phone number from request or payment record
        phone_number = request.data.get('phone_number') or payment.phone_number

        if not phone_number:
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate with serializer
        mpesa_serializer = MpesaPaymentSerializer(
            data={'payment_id': payment.id, 'phone_number': phone_number},
            context={'request': request}
        )

        if not mpesa_serializer.is_valid():
            return Response(
                mpesa_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update payment phone number
        validated_phone = mpesa_serializer.validated_data['phone_number']
        payment.phone_number = validated_phone

        # Initiate M-Pesa STK Push
        mpesa_service = MpesaService()
        result = mpesa_service.initiate_stk_push(
            phone_number=validated_phone,
            amount=payment.amount,
            account_reference=payment.invoice_number,
            transaction_desc=f"Payment for {payment.client.full_name}"
        )

        if result['success']:
            # Update payment with transaction details
            payment.transaction_id = result.get('checkout_request_id')
            payment.save()

            return Response({
                'message': result['message'],
                'payment': PaymentSerializer(payment).data,
                'checkout_request_id': result.get('checkout_request_id'),
            })
        else:
            return Response(
                {
                    'error': result['message'],
                    'details': result
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """
        Mark payment as paid manually (for cash/bank transfers)

        POST /api/payments/{id}/mark_paid/
        Body: {
            "payment_method": "cash",  # optional
            "transaction_id": "MANUAL123",  # optional
            "notes": "Paid in cash at gym"  # optional
        }
        """
        try:
            payment = self.get_queryset().get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.payment_status == 'completed':
            return Response(
                {'error': 'Payment is already marked as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update payment status
        payment.payment_status = 'completed'
        payment.payment_date = timezone.now()

        # Update optional fields if provided
        if 'payment_method' in request.data:
            payment.payment_method = request.data['payment_method']

        if 'transaction_id' in request.data:
            # Handle empty transaction_id - set to None instead of empty string to avoid UNIQUE constraint issues
            transaction_id = request.data['transaction_id']
            payment.transaction_id = transaction_id if transaction_id and transaction_id.strip() else None

        if 'notes' in request.data:
            note = request.data['notes']
            if note and note.strip():
                payment.description = (
                    f"{payment.description}\n\nPayment Note: {note}"
                    if payment.description
                    else f"Payment Note: {note}"
                )

        payment.save()

        return Response({
            'message': 'Payment marked as paid successfully',
            'payment': PaymentSerializer(payment).data
        })

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        """
        Get payment receipt

        GET /api/payments/{id}/receipt/
        """
        try:
            payment = self.get_queryset().get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.payment_status != 'completed':
            return Response(
                {'error': 'Receipt is only available for completed payments'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PaymentReceiptSerializer(payment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get payment statistics for trainer

        GET /api/payments/statistics/
        """
        payments = self.get_queryset()

        # Overall statistics
        stats = {
            'total_payments': payments.count(),
            'completed_payments': payments.filter(payment_status='completed').count(),
            'pending_payments': payments.filter(payment_status='pending').count(),
            'failed_payments': payments.filter(payment_status='failed').count(),
        }

        # Financial statistics
        completed = payments.filter(payment_status='completed')
        pending = payments.filter(payment_status='pending')

        stats['total_revenue'] = completed.aggregate(total=Sum('amount'))['total'] or 0
        stats['pending_amount'] = pending.aggregate(total=Sum('amount'))['total'] or 0

        # Overdue payments
        today = timezone.now().date()
        overdue = payments.filter(payment_status='pending', due_date__lt=today)
        stats['overdue_payments'] = overdue.count()
        stats['overdue_amount'] = overdue.aggregate(total=Sum('amount'))['total'] or 0

        # This month's statistics
        first_day_of_month = today.replace(day=1)
        this_month_payments = payments.filter(created_at__date__gte=first_day_of_month)
        this_month_completed = this_month_payments.filter(payment_status='completed')

        stats['this_month_payments'] = this_month_payments.count()
        stats['this_month_revenue'] = this_month_completed.aggregate(total=Sum('amount'))['total'] or 0

        return Response(stats)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """
        Get all overdue payments with pagination

        GET /api/payments/overdue/
        """
        today = timezone.now().date()
        overdue_payments = self.get_queryset().filter(
            payment_status='pending',
            due_date__lt=today
        ).order_by('due_date')

        # Use pagination
        page = self.paginate_queryset(overdue_payments)
        if page is not None:
            serializer = PaymentListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PaymentListSerializer(overdue_payments, many=True)
        return Response(serializer.data)


@action(detail=False, methods=['post'])
def mpesa_callback(request):
    """
    M-Pesa callback endpoint
    This endpoint will be called by Safaricom when payment is processed

    POST /api/payments/mpesa-callback/
    """
    callback_data = request.data

    # Process callback
    result = MpesaService.handle_callback(callback_data)

    if result['success']:
        # Find payment by checkout_request_id
        checkout_request_id = result.get('checkout_request_id')
        try:
            payment = Payment.objects.get(transaction_id=checkout_request_id)

            # Update payment status
            payment.payment_status = 'completed'
            payment.payment_date = timezone.now()
            payment.mpesa_receipt_number = result.get('mpesa_receipt_number')
            payment.save()

            return Response({'ResultCode': 0, 'ResultDesc': 'Success'})

        except Payment.DoesNotExist:
            return Response({'ResultCode': 1, 'ResultDesc': 'Payment not found'})
    else:
        # Payment failed
        checkout_request_id = result.get('checkout_request_id')
        if checkout_request_id:
            try:
                payment = Payment.objects.get(transaction_id=checkout_request_id)
                payment.payment_status = 'failed'
                payment.save()
            except Payment.DoesNotExist:
                pass

        return Response({'ResultCode': 1, 'ResultDesc': result.get('result_description', 'Failed')})
