from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid


class Payment(models.Model):
    """Payment Model - Represents a payment made by a client"""

    PAYMENT_METHODS = (
        ('mpesa', 'M-Pesa'),
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
    )

    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    # Relationships
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE, related_name='payments')

    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='mpesa')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')

    # Transaction info
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    mpesa_receipt_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="M-Pesa Receipt Number")
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="Phone number used for M-Pesa payment")

    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    description = models.TextField(blank=True, help_text="Payment description or notes")
    sessions_per_week = models.PositiveIntegerField(null=True, blank=True, help_text="Number of sessions per week for monthly payments")

    # Dates
    payment_date = models.DateTimeField(null=True, blank=True, help_text="Date payment was completed")
    due_date = models.DateField(null=True, blank=True, help_text="Date payment is due")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client', 'payment_status']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['invoice_number']),
            models.Index(fields=['payment_status', 'due_date']),
        ]
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        status_display = self.get_payment_status_display()
        if self.payment_date:
            return f"Payment of KES {self.amount} by {self.client.full_name} - {status_display}"
        return f"Payment of KES {self.amount} by {self.client.full_name} - {status_display} (Due: {self.due_date})"

    def save(self, *args, **kwargs):
        """Generate invoice number if not provided"""
        if not self.invoice_number:
            # Generate unique invoice number: INV-YYYYMMDD-UUID
            date_str = timezone.now().strftime('%Y%m%d')
            unique_id = str(uuid.uuid4())[:8].upper()
            self.invoice_number = f"INV-{date_str}-{unique_id}"

        # Set payment_date when status changes to completed
        if self.payment_status == 'completed' and not self.payment_date:
            self.payment_date = timezone.now()

        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if payment is overdue"""
        if self.payment_status in ['completed', 'refunded']:
            return False
        if self.due_date and timezone.now().date() > self.due_date:
            return True
        return False

    @property
    def days_overdue(self):
        """Calculate days overdue"""
        if not self.is_overdue:
            return 0
        return (timezone.now().date() - self.due_date).days 