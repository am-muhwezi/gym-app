/**
 * Payment Service
 * Handles payment and transaction operations
 */

import { apiClient } from './api';
import type {
  Payment,
  PaymentCreatePayload,
  PaymentMarkPaidPayload,
  PaymentMpesaPayload,
  PaymentReceipt,
  PaymentStatistics,
  PaginatedResponse,
} from '../types';

export const paymentService = {
  /**
   * Get all payments (optionally filtered by client, status) - handles pagination internally
   */
  async getPayments(filters?: {
    client?: string;
    payment_status?: string;
    payment_method?: string;
  }): Promise<Payment[]> {
    // First, get the first page to know total pages
    const firstPage = await apiClient.get<PaginatedResponse<Payment>>('/payments/', {
      params: { ...filters, page: 1, page_size: 100 } as any,
    });

    let allPayments = [...firstPage.results];

    // If there are more pages, fetch them all
    if (firstPage.total_pages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= firstPage.total_pages; page++) {
        pagePromises.push(
          apiClient.get<PaginatedResponse<Payment>>('/payments/', {
            params: { ...filters, page, page_size: 100 } as any,
          })
        );
      }

      const additionalPages = await Promise.all(pagePromises);
      additionalPages.forEach(pageData => {
        allPayments = [...allPayments, ...pageData.results];
      });
    }

    return allPayments;
  },

  /**
   * Get all payments for a client - handles pagination internally
   */
  async getClientPayments(clientId: string): Promise<Payment[]> {
    return this.getPayments({ client: clientId });
  },

  /**
   * Get a single payment
   */
  async getPayment(paymentId: string): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${paymentId}/`);
  },

  /**
   * Create a new payment/invoice
   */
  async createPayment(data: PaymentCreatePayload): Promise<Payment> {
    return apiClient.post<Payment>('/payments/', data);
  },

  /**
   * Update a payment
   */
  async updatePayment(paymentId: string, data: Partial<Payment>): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${paymentId}/`, data);
  },

  /**
   * Delete a payment
   */
  async deletePayment(paymentId: string): Promise<void> {
    return apiClient.delete<void>(`/payments/${paymentId}/`);
  },

  /**
   * Initiate M-Pesa STK Push
   */
  async payWithMpesa(
    paymentId: string,
    payload: PaymentMpesaPayload
  ): Promise<{ message: string; CheckoutRequestID?: string }> {
    return apiClient.post(`/payments/${paymentId}/pay_mpesa/`, payload);
  },

  /**
   * Mark payment as paid manually (cash, bank transfer, etc.)
   */
  async markAsPaid(
    paymentId: string,
    payload: PaymentMarkPaidPayload
  ): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${paymentId}/mark_paid/`, payload);
  },

  /**
   * Get payment receipt
   */
  async getReceipt(paymentId: string): Promise<PaymentReceipt> {
    return apiClient.get<PaymentReceipt>(`/payments/${paymentId}/receipt/`);
  },

  /**
   * Get payment statistics
   */
  async getStatistics(): Promise<PaymentStatistics> {
    return apiClient.get<PaymentStatistics>('/payments/statistics/');
  },

  /**
   * Get overdue payments - handles pagination internally
   */
  async getOverduePayments(): Promise<Payment[]> {
    // First, get the first page to know total pages
    const firstPage = await apiClient.get<PaginatedResponse<Payment>>('/payments/overdue/', {
      params: { page: 1, page_size: 100 },
    });

    let allPayments = [...firstPage.results];

    // If there are more pages, fetch them all
    if (firstPage.total_pages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= firstPage.total_pages; page++) {
        pagePromises.push(
          apiClient.get<PaginatedResponse<Payment>>('/payments/overdue/', {
            params: { page, page_size: 100 },
          })
        );
      }

      const additionalPages = await Promise.all(pagePromises);
      additionalPages.forEach(pageData => {
        allPayments = [...allPayments, ...pageData.results];
      });
    }

    return allPayments;
  },

  /**
   * M-Pesa callback handler (not used directly in frontend)
   */
  // Callback is handled automatically by the backend

  // ============ BACKWARD COMPATIBILITY HELPERS ============

  /**
   * Update payment status
   * @deprecated Use markAsPaid instead
   */
  async updatePaymentStatus(paymentId: string, status: Payment['payment_status']): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${paymentId}/`, { payment_status: status });
  },

  /**
   * Mark payment as completed
   * @deprecated Use markAsPaid instead
   */
  async markPaymentCompleted(
    paymentId: string,
    transactionId?: string
  ): Promise<Payment> {
    return this.markAsPaid(paymentId, {
      payment_method: 'cash',
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

    const pendingPayments = payments.filter(
      (p) => (p.payment_status || p.status) === 'pending'
    );

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
   * @deprecated Use createPayment with payment_method: 'mpesa' and markAsPaid
   */
  async recordMpesaPayment(
    clientId: string,
    amount: number,
    transactionId: string,
    description?: string
  ): Promise<Payment> {
    const payment = await apiClient.post<Payment>('/payments/', {
      client: clientId,
      amount,
      payment_method: 'mpesa',
      description,
    });

    return this.markAsPaid(payment.id, {
      payment_method: 'mpesa',
      transaction_id: transactionId,
    });
  },

  /**
   * Record cash payment
   * @deprecated Use createPayment with payment_method: 'cash' and markAsPaid
   */
  async recordCashPayment(
    clientId: string,
    amount: number,
    description?: string
  ): Promise<Payment> {
    const payment = await apiClient.post<Payment>('/payments/', {
      client: clientId,
      amount,
      payment_method: 'cash',
      description,
    });

    return this.markAsPaid(payment.id, {
      payment_method: 'cash',
    });
  },
};
