import React, { useState, useEffect } from 'react';
import { Payment, PaymentMethod, PaymentCreatePayload } from '../../types';
import { Card, Button, Modal, Input, Select, TextArea, Badge, StatCard } from '../ui';
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
  const [paymentStatus, setPaymentStatus] = useState<{
    nextPayment: Payment | null;
    overduePayments: Payment[];
    totalOverdue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaTransactionId, setMpesaTransactionId] = useState('');
  const [formData, setFormData] = useState<PaymentCreatePayload>({
    client: clientId,
    amount: 0,
    method: 'cash',
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
      const [paymentList, status] = await Promise.all([
        paymentService.getClientPayments(clientId),
        paymentService.getClientPaymentStatus(clientId),
      ]);
      setPayments(paymentList);
      setPaymentStatus(status);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.createPayment(formData);
      setShowAddModal(false);
      resetForm();
      loadPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  };

  const handleQuickCash = async () => {
    const amount = prompt('Enter cash payment amount:');
    if (amount && parseFloat(amount) > 0) {
      try {
        await paymentService.recordCashPayment(
          clientId,
          parseFloat(amount),
          'Cash payment received'
        );
        loadPayments();
      } catch (error) {
        console.error('Error recording cash payment:', error);
        alert('Failed to record payment.');
      }
    }
  };

  const handleMpesaPayment = async () => {
    if (!mpesaTransactionId.trim()) {
      alert('Please enter M-Pesa transaction ID');
      return;
    }

    const amount = prompt('Enter M-Pesa payment amount:');
    if (amount && parseFloat(amount) > 0) {
      try {
        await paymentService.recordMpesaPayment(
          clientId,
          parseFloat(amount),
          mpesaTransactionId,
          'M-Pesa payment received'
        );
        setShowMpesaModal(false);
        setMpesaTransactionId('');
        loadPayments();
      } catch (error) {
        console.error('Error recording M-Pesa payment:', error);
        alert('Failed to record payment.');
      }
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await paymentService.markPaymentCompleted(paymentId);
      loadPayments();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('Failed to update payment status.');
    }
  };

  const resetForm = () => {
    setFormData({
      client: clientId,
      amount: 0,
      method: 'cash',
      due_date: '',
      description: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: Payment['status']) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      cancelled: 'default',
      refunded: 'info',
    } as const;

    return (
      <Badge variant={variants[status] || 'default'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return <p className="text-gray-400">Loading payments...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleQuickCash}>
            💵 Quick Cash
          </Button>
          <Button variant="secondary" onClick={() => setShowMpesaModal(true)}>
            📱 M-Pesa
          </Button>
          <Button onClick={() => setShowAddModal(true)}>Schedule Payment</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Paid" value={`$${totalPaid.toFixed(2)}`} icon="✅" />
        <StatCard
          title="Pending"
          value={`$${totalPending.toFixed(2)}`}
          subtitle={`${payments.filter((p) => p.status === 'pending').length} payment(s)`}
          icon="⏳"
        />
        <StatCard
          title="Overdue"
          value={`$${paymentStatus?.totalOverdue.toFixed(2) || '0.00'}`}
          subtitle={`${paymentStatus?.overduePayments.length || 0} payment(s)`}
          icon="⚠️"
        />
        <StatCard
          title="Total Payments"
          value={payments.length}
          subtitle={`All time`}
          icon="📊"
        />
      </div>

      {/* Overdue Alert */}
      {paymentStatus && paymentStatus.overduePayments.length > 0 && (
        <Card className="border-2 border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-red-400">Overdue Payments</h3>
              <p className="text-sm text-gray-400">
                {paymentStatus.overduePayments.length} payment(s) overdue - Total: $
                {paymentStatus.totalOverdue.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pending Payments */}
      {payments.filter((p) => p.status === 'pending').length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Pending Payments</h3>
          <div className="space-y-3">
            {payments
              .filter((p) => p.status === 'pending')
              .map((payment) => {
                const isOverdue =
                  payment.due_date && new Date(payment.due_date) < new Date();
                return (
                  <Card
                    key={payment.id}
                    className={isOverdue ? 'border-2 border-red-500/30' : ''}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">${payment.amount}</h4>
                          {getStatusBadge(payment.status)}
                          {isOverdue && (
                            <Badge variant="danger" size="sm">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        {payment.description && (
                          <p className="text-gray-400 text-sm">{payment.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>Method: {payment.method}</span>
                          {payment.due_date && (
                            <span>Due: {new Date(payment.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarkAsPaid(payment.id)}
                      >
                        Mark as Paid
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        {payments.filter((p) => p.status !== 'pending').length > 0 ? (
          <div className="space-y-3">
            {payments
              .filter((p) => p.status !== 'pending')
              .map((payment) => (
                <Card key={payment.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">${payment.amount}</h4>
                        {getStatusBadge(payment.status)}
                        <span className="text-sm text-gray-500 capitalize">
                          {payment.method}
                        </span>
                      </div>
                      {payment.description && (
                        <p className="text-gray-400 text-sm">{payment.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Date: {new Date(payment.payment_date).toLocaleDateString()}</span>
                        {payment.transaction_id && (
                          <span className="font-mono">TXN: {payment.transaction_id}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <p className="text-gray-400 text-center py-4">No payment history yet</p>
          </Card>
        )}
      </div>

      {/* Schedule Payment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Schedule Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Schedule</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            required
            value={formData.amount || ''}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0.00"
          />

          <Select
            label="Payment Method"
            required
            value={formData.method}
            onChange={(e) =>
              setFormData({ ...formData, method: e.target.value as PaymentMethod })
            }
            options={PAYMENT_METHODS}
          />

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
            placeholder="e.g., Monthly training fee"
          />

          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
          />
        </form>
      </Modal>

      {/* M-Pesa Modal */}
      <Modal
        isOpen={showMpesaModal}
        onClose={() => {
          setShowMpesaModal(false);
          setMpesaTransactionId('');
        }}
        title="M-Pesa Payment"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowMpesaModal(false);
                setMpesaTransactionId('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleMpesaPayment}>Record Payment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            Enter the M-Pesa transaction ID to record the payment.
          </p>
          <Input
            label="M-Pesa Transaction ID"
            required
            value={mpesaTransactionId}
            onChange={(e) => setMpesaTransactionId(e.target.value)}
            placeholder="e.g., QAR7C13H4M"
          />
        </div>
      </Modal>
    </div>
  );
};

export default PaymentManager;
