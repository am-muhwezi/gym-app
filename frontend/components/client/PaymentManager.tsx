import React, { useState, useEffect } from 'react';
import { Payment, PaymentMethod, PaymentCreatePayload, PaymentMarkPaidPayload } from '../../types';
import { Card, Button, Modal, Input, Select, TextArea, Badge } from '../ui';
import { paymentService } from '../../services';

interface PaymentManagerProps {
  clientId: string;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'other', label: 'Other' },
];

const PaymentManager: React.FC<PaymentManagerProps> = ({ clientId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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

  const [confirmData, setConfirmData] = useState<PaymentMarkPaidPayload>({
    payment_method: 'cash',
    transaction_id: '',
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
      alert('Please enter a valid amount');
      return;
    }

    try {
      await paymentService.createPayment(formData);
      setShowAddModal(false);
      resetForm();
      loadPayments();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      alert(`Failed to create payment: ${error.message}`);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;

    try {
      await paymentService.markAsPaid(selectedPayment.id, confirmData);
      setShowConfirmModal(false);
      setSelectedPayment(null);
      resetConfirmForm();
      loadPayments();
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      alert(`Failed to confirm payment: ${error.message}`);
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

  const resetConfirmForm = () => {
    setConfirmData({
      payment_method: 'cash',
      transaction_id: '',
      notes: '',
    });
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

  const totalPaid = payments
    .filter((p) => (p.payment_status || p.status) === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => (p.payment_status || p.status) === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

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

      {/* Summary Stats - Compact */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-sm text-yellow-400">Pending Payments</p>
          <p className="text-3xl font-bold text-white mt-1">KES {totalPending.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {payments.filter((p) => (p.payment_status || p.status) === 'pending').length} payment(s)
          </p>
        </Card>
        <Card className="bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-400">Total Paid</p>
          <p className="text-3xl font-bold text-white mt-1">KES {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {payments.filter((p) => (p.payment_status || p.status) === 'completed').length} payment(s)
          </p>
        </Card>
      </div>

      {/* Payment History - Table/List View */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Invoice</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Description</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Amount</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Method</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 text-gray-400 font-semibold text-sm">Date</th>
                  <th className="text-right p-3 text-gray-400 font-semibold text-sm">Action</th>
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
                      <td className="p-3">
                        <p className="font-mono text-sm text-white">
                          {payment.invoice_number || `#${payment.id.slice(0, 8)}`}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-white">
                          {payment.description || 'Payment'}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-white">KES {payment.amount.toLocaleString()}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-gray-400 capitalize">{method}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status as string)}
                          {isOverdue && (
                            <Badge variant="danger" size="sm">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {payment.due_date ? (
                          <p className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                            {new Date(payment.due_date).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">-</p>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setConfirmData({
                                payment_method: method || 'cash',
                                transaction_id: '',
                                notes: '',
                              });
                              setShowConfirmModal(true);
                            }}
                          >
                            Confirm Payment
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowViewModal(true);
                            }}
                          >
                            View
                          </Button>
                        )}
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormData({ ...formData, amount: 5000 })}
              className="w-full"
            >
              Monthly (KES 5,000)
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormData({ ...formData, amount: 3000 })}
              className="w-full"
            >
              Per Session (KES 3,000)
            </Button>
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

      {/* Confirm Payment Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedPayment(null);
          resetConfirmForm();
        }}
        title="Confirm Payment"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowConfirmModal(false);
                setSelectedPayment(null);
                resetConfirmForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment}>Confirm Payment</Button>
          </>
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="p-4 bg-dark-800 rounded-lg">
              <p className="text-sm text-gray-400">Amount</p>
              <p className="text-2xl font-bold text-white">
                KES {selectedPayment.amount.toLocaleString()}
              </p>
              {selectedPayment.description && (
                <p className="text-sm text-gray-500 mt-1">{selectedPayment.description}</p>
              )}
            </div>

            <Select
              label="Payment Method *"
              required
              value={confirmData.payment_method || 'cash'}
              onChange={(e) =>
                setConfirmData({
                  ...confirmData,
                  payment_method: e.target.value as PaymentMethod,
                })
              }
              options={PAYMENT_METHODS}
            />

            <Input
              label="Transaction ID (optional)"
              value={confirmData.transaction_id}
              onChange={(e) => setConfirmData({ ...confirmData, transaction_id: e.target.value })}
              placeholder="e.g., CASH-001 or M-Pesa code"
            />

            <TextArea
              label="Notes (optional)"
              value={confirmData.notes}
              onChange={(e) => setConfirmData({ ...confirmData, notes: e.target.value })}
              placeholder="e.g., Paid in cash at reception"
              rows={2}
            />
          </div>
        )}
      </Modal>

      {/* View Payment Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPayment(null);
        }}
        title="Payment Details"
        footer={
          <Button onClick={() => setShowViewModal(false)}>Close</Button>
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Invoice Number</p>
                <p className="font-mono text-white">
                  {selectedPayment.invoice_number || `#${selectedPayment.id.slice(0, 8)}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                {getStatusBadge((selectedPayment.payment_status || selectedPayment.status) as string)}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Amount</p>
              <p className="text-2xl font-bold text-white">
                KES {selectedPayment.amount.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Payment Method</p>
                <p className="text-white capitalize">
                  {selectedPayment.payment_method || selectedPayment.method}
                </p>
              </div>
              {selectedPayment.payment_date && (
                <div>
                  <p className="text-sm text-gray-400">Payment Date</p>
                  <p className="text-white">
                    {new Date(selectedPayment.payment_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {selectedPayment.description && (
              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-white">{selectedPayment.description}</p>
              </div>
            )}

            {selectedPayment.transaction_id && (
              <div>
                <p className="text-sm text-gray-400">Transaction ID</p>
                <p className="font-mono text-white">{selectedPayment.transaction_id}</p>
              </div>
            )}

            {selectedPayment.mpesa_receipt_number && (
              <div>
                <p className="text-sm text-gray-400">M-Pesa Receipt</p>
                <p className="font-mono text-white">{selectedPayment.mpesa_receipt_number}</p>
              </div>
            )}

            {selectedPayment.notes && (
              <div>
                <p className="text-sm text-gray-400">Notes</p>
                <p className="text-white">{selectedPayment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentManager;
