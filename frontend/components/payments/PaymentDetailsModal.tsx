import React, { useState, useEffect } from 'react';
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentMarkPaidPayload,
  PaymentMpesaPayload,
  Client,
} from '../../types';
import { Modal, Button, Input, Select, TextArea, Badge } from '../ui';
import { paymentService, generatePaymentReceipt, printReceipt } from '../../services';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  client: Client | null;
  onUpdate: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'other', label: 'Other' },
];

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  payment,
  client,
  onUpdate,
}) => {
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Unified form for all payment actions
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    due_date: '',
    description: '',
    notes: '',
    payment_method: 'mpesa' as PaymentMethod,
    transaction_id: '',
    phone_number: '',
  });

  const [paymentPeriod, setPaymentPeriod] = useState<string>('custom');
  const [expiryDate, setExpiryDate] = useState<string>('');

  // Calculate expiry date based on payment period
  const calculateExpiryDate = (period: string): string => {
    const today = new Date();
    let expiry = new Date(today);

    switch (period) {
      case 'per_session':
        // For per session, set expiry to today (same day)
        expiry = new Date(today);
        break;
      case 'monthly':
        expiry.setMonth(expiry.getMonth() + 1);
        break;
      case 'quarterly':
        expiry.setMonth(expiry.getMonth() + 3);
        break;
      case 'biannually':
        expiry.setMonth(expiry.getMonth() + 6);
        break;
      case 'annually':
        expiry.setFullYear(expiry.getFullYear() + 1);
        break;
      default:
        return '';
    }

    return expiry.toISOString().split('T')[0];
  };

  // Handle payment period change
  const handlePeriodChange = (period: string) => {
    setPaymentPeriod(period);
    if (period !== 'custom') {
      const calculatedExpiry = calculateExpiryDate(period);
      setExpiryDate(calculatedExpiry);
      setPaymentForm({ ...paymentForm, due_date: calculatedExpiry });
    }
  };

  useEffect(() => {
    if (isOpen && payment && client) {
      loadClientPaymentHistory();
      setIsEditing(false);
      // Initialize form with payment data
      setPaymentForm({
        amount: Number(payment.amount || 0),
        due_date: payment.due_date || '',
        description: payment.description || '',
        notes: payment.notes || '',
        payment_method: payment.payment_method || 'mpesa',
        transaction_id: '',
        phone_number: payment.phone_number || client.phone || '',
      });
    }
  }, [isOpen, payment, client]);

  const loadClientPaymentHistory = async () => {
    if (!client) return;
    try {
      setLoadingHistory(true);
      const payments = await paymentService.getPayments();
      const clientPayments = payments.filter((p) => p.client === client.id);
      setClientPayments(clientPayments);
    } catch (error) {
      console.error('Error loading client payment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!payment) return;

    try {
      // Update payment details
      await paymentService.updatePayment(payment.id, {
        amount: paymentForm.amount,
        due_date: paymentForm.due_date,
        description: paymentForm.description,
        notes: paymentForm.notes,
      });
      onUpdate();
      setIsEditing(false);
    } catch (error: any) {
      alert(`Failed to update payment: ${error.message}`);
    }
  };

  const handleMpesaPayment = async () => {
    if (!payment || !paymentForm.phone_number) {
      alert('Please enter phone number');
      return;
    }

    try {
      // First update payment details if changed
      await paymentService.updatePayment(payment.id, {
        amount: paymentForm.amount,
        due_date: paymentForm.due_date,
        description: paymentForm.description,
        notes: paymentForm.notes,
      });

      // Then initiate M-Pesa payment
      const result = await paymentService.payWithMpesa(payment.id, {
        phone_number: paymentForm.phone_number,
      });
      alert(result.message || 'M-Pesa payment prompt sent successfully!');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(`Failed to initiate M-Pesa payment: ${error.message}`);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!payment) return;

    try {
      // First update payment details
      await paymentService.updatePayment(payment.id, {
        amount: paymentForm.amount,
        due_date: paymentForm.due_date,
        description: paymentForm.description,
        notes: paymentForm.notes,
      });

      // Then mark as paid
      await paymentService.markAsPaid(payment.id, {
        payment_method: paymentForm.payment_method,
        transaction_id: paymentForm.transaction_id,
        notes: paymentForm.notes,
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(`Failed to mark payment as paid: ${error.message}`);
    }
  };

  const handleDeletePayment = async () => {
    if (!payment) return;
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        await paymentService.deletePayment(payment.id);
        onUpdate();
        onClose();
      } catch (error: any) {
        alert(`Failed to delete payment: ${error.message}`);
      }
    }
  };

  const handlePrintReceipt = () => {
    if (!payment || !client) return;
    try {
      const receiptHTML = generatePaymentReceipt(payment, client);
      printReceipt(receiptHTML);
    } catch (error: any) {
      alert(`Failed to print receipt: ${error.message}`);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      refunded: 'info',
    } as const;

    return (
      <Badge variant={variants[status] || 'default'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isPaymentOverdue = (p: Payment) => {
    const status = p.payment_status || p.status;
    if (status !== 'pending' || !p.due_date) return false;
    const dueDate = new Date(p.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  if (!payment || !client) return null;

  const status = payment.payment_status || payment.status;
  const isOverdue = isPaymentOverdue(payment);
  const isPending = status === 'pending';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment - ${client.first_name} ${client.last_name}`}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Form - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Header */}
          <div className="bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-6 rounded-lg border border-brand-primary/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <div className="flex gap-2">
                  {getStatusBadge(status as PaymentStatus)}
                  {isOverdue && (
                    <Badge variant="danger" size="sm">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              {payment.invoice_number && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Invoice</p>
                  <p className="text-white font-mono text-sm">{payment.invoice_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <Input
              label="Amount (KES) *"
              type="number"
              step="0.01"
              required
              disabled={!isPending}
              value={paymentForm.amount || ''}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
            />

            {isPending && (
              <>
                <Select
                  label="Payment Period *"
                  required
                  value={paymentPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  options={[
                    { value: 'per_session', label: 'Per Session' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly (3 months)' },
                    { value: 'biannually', label: 'Biannually (6 months)' },
                    { value: 'annually', label: 'Annually (12 months)' },
                    { value: 'custom', label: 'Custom Date' },
                  ]}
                />

                {paymentPeriod === 'custom' ? (
                  <Input
                    label="Expiry Date *"
                    type="date"
                    required
                    value={paymentForm.due_date}
                    onChange={(e) => {
                      setPaymentForm({ ...paymentForm, due_date: e.target.value });
                      setExpiryDate(e.target.value);
                    }}
                  />
                ) : (
                  <div className="p-4 bg-dark-800 rounded-lg border border-dark-700">
                    <p className="text-sm text-gray-400 mb-1">Expiry Date</p>
                    <p className="text-white font-semibold">
                      {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Select a period'}
                    </p>
                  </div>
                )}
              </>
            )}

            {!isPending && (
              <div className="p-4 bg-dark-800 rounded-lg border border-dark-700">
                <p className="text-sm text-gray-400 mb-1">Expiry Date</p>
                <p className="text-white font-semibold">
                  {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            )}

            <Input
              label="Description"
              disabled={!isPending}
              value={paymentForm.description}
              onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
              placeholder="e.g., Monthly membership"
            />

            {isPending && (
              <>
                <div className="border-t border-dark-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>
                </div>

                <Select
                  label="Payment Method *"
                  required
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as PaymentMethod })}
                  options={PAYMENT_METHODS}
                />

                {paymentForm.payment_method === 'mpesa' && (
                  <Input
                    label="Phone Number (254...) *"
                    required
                    value={paymentForm.phone_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phone_number: e.target.value })}
                    placeholder="254712345678"
                  />
                )}

                <Input
                  label="Transaction ID (optional)"
                  value={paymentForm.transaction_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                  placeholder="e.g., CASH-001 or M-Pesa receipt number"
                />
              </>
            )}

            <TextArea
              label="Notes"
              disabled={!isPending}
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="Additional notes..."
            />

            {!isPending && payment.payment_date && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-gray-400">Paid On</p>
                <p className="text-white font-semibold">{new Date(payment.payment_date).toLocaleDateString()}</p>
                {payment.mpesa_receipt_number && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">M-Pesa Receipt</p>
                    <p className="text-white font-mono text-sm">{payment.mpesa_receipt_number}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-700">
            {isPending && (
              <>
                {paymentForm.payment_method === 'mpesa' && (
                  <Button onClick={handleMpesaPayment}>
                    Pay with M-Pesa
                  </Button>
                )}
                <Button onClick={handleMarkAsPaid} variant="secondary">
                  Mark as Paid
                </Button>
                {paymentForm.amount !== Number(payment.amount) ||
                 paymentForm.due_date !== payment.due_date ||
                 paymentForm.description !== payment.description ? (
                  <Button onClick={handleUpdatePayment} variant="outline">
                    Save Changes
                  </Button>
                ) : null}
                <Button onClick={handleDeletePayment} variant="danger">
                  Delete
                </Button>
              </>
            )}
            {!isPending && (
              <Button onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
            )}
          </div>
        </div>

        {/* Payment History Sidebar - Takes 1/3 width */}
        <div className="lg:col-span-1">
          <div className="sticky top-0">
            <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {loadingHistory ? (
                <p className="text-center text-gray-400 py-8">Loading...</p>
              ) : clientPayments.length > 0 ? (
                <>
                  {clientPayments.map((p) => {
                    const pStatus = p.payment_status || p.status;
                    const pMethod = p.payment_method || p.method;
                    const pOverdue = isPaymentOverdue(p);

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-lg border ${
                          p.id === payment.id
                            ? 'bg-brand-primary/10 border-brand-primary'
                            : pOverdue
                            ? 'bg-red-500/5 border-dark-700'
                            : 'bg-dark-800 border-dark-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-white">
                              KES {Number(p.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-gray-400">{p.description || 'Payment'}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(pStatus as PaymentStatus)}
                            {pOverdue && (
                              <Badge variant="danger" size="sm">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Method:</span>
                            <span className="text-white capitalize">{pMethod}</span>
                          </div>
                          {p.due_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Due:</span>
                              <span className={pOverdue ? 'text-red-400' : 'text-white'}>
                                {new Date(p.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {p.payment_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Paid:</span>
                              <span className="text-green-400">
                                {new Date(p.payment_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="text-center text-gray-400 py-8 text-sm">No payment history</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
