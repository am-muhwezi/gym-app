import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentCreatePayload,
  PaymentMarkPaidPayload,
  PaymentMpesaPayload,
  PaymentStatistics,
  Client,
} from '../types';
import { Card, Button, Modal, Input, Select, TextArea, Badge, StatCard } from '../components/ui';
import { paymentService, clientService, generatePaymentReceipt, printReceipt } from '../services';
import { PaymentDetailsModal } from '../components/payments';
import { useToast } from '../context/ToastContext';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_STATUSES: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const PaymentsPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [createForm, setCreateForm] = useState<PaymentCreatePayload>({
    client: '',
    amount: 0,
    payment_method: 'cash',
    phone_number: '',
    due_date: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, clientsData, stats] = await Promise.all([
        paymentService.getPayments(),
        clientService.getAllClients(),
        paymentService.getStatistics().catch(() => null),
      ]);
      setPayments(paymentsData);
      setClients(clientsData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading payments data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!createForm.client || !createForm.amount) {
      showWarning('Please fill in required fields');
      return;
    }

    try {
      await paymentService.createPayment(createForm);
      showSuccess('Payment created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      loadData();
    } catch (error: any) {
      showError(`Failed to create payment: ${error.message}`);
    }
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const resetCreateForm = () => {
    setCreateForm({
      client: '',
      amount: 0,
      payment_method: 'cash',
      phone_number: '',
      due_date: '',
      description: '',
      notes: '',
    });
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

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const status = payment.payment_status || payment.status;
    const method = payment.payment_method || payment.method;

    const statusMatch = selectedStatus === 'all' || status === selectedStatus;
    const clientMatch = selectedClient === 'all' || payment.client === selectedClient;
    const searchMatch =
      !searchTerm ||
      getClientName(payment.client).toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && clientMatch && searchMatch;
  });

  const isPaymentOverdue = (payment: Payment) => {
    const status = payment.payment_status || payment.status;
    if (status !== 'pending' || !payment.due_date) return false;
    const dueDate = new Date(payment.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Payments</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create Invoice</Button>
      </div>

      {/* Compact Statistics Bar */}
      {statistics && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Total Received:</span>
              <span className="text-lg font-bold text-green-400">KES {(statistics.total_received || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Pending:</span>
              <span className="text-lg font-bold text-yellow-400">KES {(statistics.pending_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Overdue:</span>
              <span className="text-lg font-bold text-red-400">KES {(statistics.overdue_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">This Month:</span>
              <span className="text-lg font-bold text-brand-primary">KES {(statistics.this_month_revenue || 0).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
            >
              <option value="all">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client, invoice, description..."
              className="w-full p-3 bg-dark-800 text-white rounded-lg border border-dark-700"
            />
          </div>
        </div>
      </Card>

      {/* Payments List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left p-4 text-gray-400 font-semibold">Client</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Description</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Amount</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const status = payment.payment_status || payment.status;
                  const method = payment.payment_method || payment.method;
                  const isOverdue = isPaymentOverdue(payment);

                  return (
                    <tr
                      key={payment.id}
                      onClick={() => handlePaymentClick(payment)}
                      className={`border-b border-dark-700 hover:bg-dark-800 cursor-pointer transition-colors ${
                        isOverdue ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <p className="text-brand-primary hover:text-brand-secondary font-semibold">
                          {getClientName(payment.client)}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-white">
                          {payment.description || 'Payment'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{method}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">KES {Number(payment.amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status as PaymentStatus)}
                          {isOverdue && (
                            <Badge variant="danger" size="sm">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {payment.due_date ? (
                          <p className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                            {new Date(payment.due_date).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">-</p>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetCreateForm();
        }}
        title="Create Invoice"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayment}>Create Invoice</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Client *"
            required
            value={createForm.client}
            onChange={(e) => setCreateForm({ ...createForm, client: e.target.value })}
            options={clients.map((c) => ({
              value: c.id,
              label: `${c.first_name} ${c.last_name}`,
            }))}
          />

          {/* Membership Plan Templates */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Membership Plan (Quick Select)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCreateForm({
                  ...createForm,
                  amount: 2000,
                  description: 'Per Session',
                  due_date: new Date().toISOString().split('T')[0]
                })}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white">Per Session</p>
                <p className="text-sm text-brand-primary">KES 2,000</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setCreateForm({
                    ...createForm,
                    amount: 5000,
                    description: 'Monthly Membership',
                    due_date: nextMonth.toISOString().split('T')[0]
                  });
                }}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white">Monthly</p>
                <p className="text-sm text-brand-primary">KES 5,000</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextQuarter = new Date();
                  nextQuarter.setMonth(nextQuarter.getMonth() + 3);
                  setCreateForm({
                    ...createForm,
                    amount: 13500,
                    description: 'Quarterly Membership (3 months)',
                    due_date: nextQuarter.toISOString().split('T')[0]
                  });
                }}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white">Quarterly</p>
                <p className="text-sm text-brand-primary">KES 13,500</p>
                <p className="text-xs text-gray-500">Save 10%</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextYear = new Date();
                  nextYear.setFullYear(nextYear.getFullYear() + 1);
                  setCreateForm({
                    ...createForm,
                    amount: 48000,
                    description: 'Annual Membership (12 months)',
                    due_date: nextYear.toISOString().split('T')[0]
                  });
                }}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-left rounded-lg border border-dark-700 transition-colors"
              >
                <p className="font-semibold text-white">Annual</p>
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
            value={createForm.amount || ''}
            onChange={(e) =>
              setCreateForm({ ...createForm, amount: parseFloat(e.target.value) || 0 })
            }
            placeholder="5000"
          />

          <Select
            label="Payment Method *"
            required
            value={createForm.payment_method}
            onChange={(e) =>
              setCreateForm({ ...createForm, payment_method: e.target.value as PaymentMethod })
            }
            options={PAYMENT_METHODS}
          />

          {createForm.payment_method === 'mpesa' && (
            <Input
              label="Phone Number (254...)"
              value={createForm.phone_number}
              onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
              placeholder="254712345678"
            />
          )}

          <Input
            label="Due Date"
            type="date"
            value={createForm.due_date}
            onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
          />

          <Input
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="e.g., Monthly membership - January"
          />

          <TextArea
            label="Notes"
            value={createForm.notes}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
            placeholder="Additional notes..."
          />
        </div>
      </Modal>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        client={selectedPayment ? clients.find((c) => c.id === selectedPayment.client) || null : null}
        onUpdate={loadData}
      />
    </div>
  );
};

export default PaymentsPage;
