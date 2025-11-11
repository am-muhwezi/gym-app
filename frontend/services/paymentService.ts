/**
 * Payment Service
 * Handles payment and transaction operations
 */

import { apiClient } from './api';
import type { Payment, PaymentCreatePayload } from '../types';

export const paymentService = {
  /**
   * Get all payments for a client
   */
  async getClientPayments(clientId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/', {
      params: { client: clientId },
    });
  },

  /**
   * Get a single payment
   */
  async getPayment(paymentId: string): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${paymentId}/`);
  },

  /**
   * Create a new payment
   */
  async createPayment(data: PaymentCreatePayload): Promise<Payment> {
    return apiClient.post<Payment>('/payments/', data);
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${paymentId}/`, { status });
  },

  /**
   * Mark payment as completed
   */
  async markPaymentCompleted(
    paymentId: string,
    transactionId?: string
  ): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${paymentId}/`, {
      status: 'completed',
      transaction_id: transactionId,
    });
  },

  /**
   * Get payment status for client (next due, overdue)
   */
  async getClientPaymentStatus(clientId: string): Promise<{
    nextPayment: Payment | null;
    overduePayments: Payment[];
    totalOverdue: number;
  }> {
    const payments = await this.getClientPayments(clientId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingPayments = payments.filter((p) => p.status === 'pending');

    const overduePayments = pendingPayments.filter((p) => {
      if (!p.due_date) return false;
      const dueDate = new Date(p.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    const upcomingPayments = pendingPayments.filter((p) => {
      if (!p.due_date) return true;
      const dueDate = new Date(p.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today;
    });

    upcomingPayments.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      nextPayment: upcomingPayments[0] || null,
      overduePayments,
      totalOverdue,
    };
  },

  /**
   * Record M-Pesa payment
   */
  async recordMpesaPayment(
    clientId: string,
    amount: number,
    transactionId: string,
    description?: string
  ): Promise<Payment> {
    return apiClient.post<Payment>('/payments/', {
      client: clientId,
      amount,
      method: 'mpesa',
      status: 'completed',
      transaction_id: transactionId,
      description,
    });
  },

  /**
   * Record cash payment
   */
  async recordCashPayment(
    clientId: string,
    amount: number,
    description?: string
  ): Promise<Payment> {
    return apiClient.post<Payment>('/payments/', {
      client: clientId,
      amount,
      method: 'cash',
      status: 'completed',
      description,
    });
  },
};
