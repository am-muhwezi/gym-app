import React, { useState, useEffect } from 'react';
import { Payment, PaymentMethod, PaymentCreatePayload, PaymentMarkPaidPayload, Client } from '../../types';
import { Card, Button, Modal, Input, Select, TextArea, Badge } from '../ui';
import { paymentService, clientService, pdfService } from '../../services';
import { generatePaymentReceipt, printReceipt } from '../../services/receiptService';
import { PaymentDetailsModal } from '../payments';
import { useToast } from '../../context/ToastContext';

interface PaymentManagerProps {
  clientId: string;
  client?: Client | null;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'other', label: 'Other' },
];

const PaymentManager: React.FC<PaymentManagerProps> = ({ clientId, client }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [formData, setFormData] = useState<PaymentCreatePayload>({
    client: clientId,
    amount: 0,
    payment_method: 'cash',
    phone_number: '',
    due_date: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    loadPayments();
  }, [clientId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentList = await paymentService.getClientPayments(clientId);
      setPayments(paymentList);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      showWarning('Please enter a valid amount');
      return;
    }

    try {
      await paymentService.createPayment(formData);
      showSuccess('Payment created successfully');
      setShowAddModal(false);
      resetForm();
      loadPayments();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      showError(`Failed to create payment: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      client: clientId,
      amount: 0,
      payment_method: 'cash',
      phone_number: '',
      due_date: '',
      description: '',
      notes: '',
    });
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      refunded: 'info',
    };

    return (
      <Badge variant={variants[status] || 'default'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isPaymentOverdue = (payment: Payment) => {
    const status = payment.payment_status || payment.status;
    if (status !== 'pending' || !payment.due_date) return false;
    const dueDate = new Date(payment.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const calculateMembershipExpiry = (payment: Payment) => {
    if (!payment.payment_date) return null;

    const paymentDate = new Date(payment.payment_date);
    const description = payment.description?.toLowerCase() || '';

    if (description.includes('monthly') || description.includes('month')) {
      paymentDate.setMonth(paymentDate.getMonth() + 1);
    } else if (description.includes('quarterly') || description.includes('quarter')) {
      paymentDate.setMonth(paymentDate.getMonth() + 3);
    } else if (description.includes('annual') || description.includes('year')) {
      paymentDate.setFullYear(paymentDate.getFullYear() + 1);
    } else if (description.includes('session')) {
      return null; // Single session doesn't have expiry
    } else {
      paymentDate.setMonth(paymentDate.getMonth() + 1); // Default to 1 month
    }

    return paymentDate;
  };

  const handlePrintReceipt = async (payment: Payment) => {
    try {
      // Get client data
      const client = await clientService.getClient(clientId);

      // Generate and print receipt
      const receiptHTML = generatePaymentReceipt(payment, client);
      printReceipt(receiptHTML);
      showInfo('Receipt generated successfully');
    } catch (error) {
      console.error('Error generating receipt:', error);
      showError('Failed to generate receipt');
    }
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    try {
      const clientData = client || await clientService.getClient(clientId);
      pdfService.generateInvoice(clientData, payment);
      showSuccess('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      showError('Failed to generate invoice PDF');
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      const clientData = client || await clientService.getClient(clientId);
      pdfService.generateReceipt(clientData, payment);
      showSuccess('Receipt PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      showError('Failed to generate receipt PDF');
    }
  };


  const totalPaid = payments
    .filter((p) => (p.payment_status || p.status) === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => (p.payment_status || p.status) === 'pending')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const completedPaymentsCount = payments.filter((p) => (p.payment_status || p.status) === 'completed').length;
  const avgPayment = completedPaymentsCount > 0 ? totalPaid / completedPaymentsCount : 0;

  if (loading) {
    return <p className="text-gray-400">Loading payments...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Membership Payments</h2>
        <Button onClick={() => setShowAddModal(true)}>Add Payment</Button>
      </div>

      {/* Compact Stats Bar */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Total Paid:</span>
            <span className="text-lg font-bold text-green-400">KES {totalPaid.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Pending:</span>
            <span className="text-lg font-bold text-yellow-400">KES {totalPending.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Avg Payment:</span>
            <span className="text-lg font-bold text-brand-primary">
              KES {avgPayment.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </Card>

      {/* Payment History - Table/List View */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Description</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Amount</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Method</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Due Date</th>
                  <th className="text-right p-3 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const status = payment.payment_status || payment.status;
                  const method = payment.payment_method || payment.method;
                  const isOverdue = isPaymentOverdue(payment);

                  return (
                    <tr
                      key={payment.id}
                      className={`border-b border-dark-700 hover:bg-dark-800 transition-colors ${
                        isOverdue ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="p-3 cursor-pointer" onClick={() => handlePaymentClick(payment)}>
                        <p className="text-sm text-white">
                          {payment.description || 'Payment'}
                        </p>
                      </td>
                      <td className="p-3 cursor-pointer" onClick={() => handlePaymentClick(payment)}>
                        <p className="font-bold text-white">KES {Number(payment.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </td>
                      <td className="p-3 cursor-pointer" onClick={() => handlePaymentClick(payment)}>
                        <p className="text-sm text-gray-400 capitalize">{method}</p>
                      </td>
                      <td className="p-3 cursor-pointer" onClick={() => handlePaymentClick(payment)}>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status as string)}
                          {isOverdue && (
                            <Badge variant="danger" size="sm">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 cursor-pointer" onClick={() => handlePaymentClick(payment)}>
                        {payment.due_date ? (
                          <p className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                            {new Date(payment.due_date).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">-</p>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(payment);
                            }}
                            className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="Download Invoice PDF"
                          >
                            📄 Invoice
                          </button>
                          {status === 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReceipt(payment);
                              }}
                              className="px-2 py-1 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                              title="Download Receipt PDF"
                            >
                              🧾 Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No payment history yet</p>
          </div>
        )}
      </Card>

      {/* Add Payment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Membership Payment"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Payment</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Membership Plan Templates */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Membership Plan (Quick Select)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setFormData({
                    ...formData,
                    amount: 2000,
                    description: 'Per Session',
                    due_date: today.toISOString().split('T')[0]
                  });
                }}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white text-sm">Per Session</p>
                <p className="text-sm text-brand-primary">KES 2,000</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setFormData({
                    ...formData,
                    amount: 5000,
                    description: 'Monthly Membership',
                    due_date: nextMonth.toISOString().split('T')[0]
                  });
                }}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white text-sm">Monthly</p>
                <p className="text-sm text-brand-primary">KES 5,000</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextQuarter = new Date();
                  nextQuarter.setMonth(nextQuarter.getMonth() + 3);
                  setFormData({
                    ...formData,
                    amount: 13500,
                    description: 'Quarterly Membership (3 months)',
                    due_date: nextQuarter.toISOString().split('T')[0]
                  });
                }}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white text-sm">Quarterly</p>
                <p className="text-sm text-brand-primary">KES 13,500</p>
                <p className="text-xs text-gray-500">Save 10%</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextYear = new Date();
                  nextYear.setFullYear(nextYear.getFullYear() + 1);
                  setFormData({
                    ...formData,
                    amount: 48000,
                    description: 'Annual Membership (12 months)',
                    due_date: nextYear.toISOString().split('T')[0]
                  });
                }}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white text-sm">Annual</p>
                <p className="text-sm text-brand-primary">KES 48,000</p>
                <p className="text-xs text-gray-500">Save 20%</p>
              </button>
            </div>
          </div>

          <Input
            label="Amount (KES) *"
            type="number"
            step="0.01"
            required
            value={formData.amount || ''}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
            }
            placeholder="5000"
          />

          <Select
            label="Payment Method *"
            required
            value={formData.payment_method}
            onChange={(e) =>
              setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })
            }
            options={PAYMENT_METHODS}
          />

          {formData.payment_method === 'mpesa' && (
            <Input
              label="Phone Number (254...)"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="254712345678"
            />
          )}

          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Monthly Membership"
          />

          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={2}
          />
        </form>
      </Modal>


      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        client={client}
        onUpdate={loadPayments}
      />
    </div>
  );
};

export default PaymentManager;
