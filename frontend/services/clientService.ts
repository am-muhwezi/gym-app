/**
 * Client Service
 * Handles all client-related API operations
 */

import { apiClient } from './api';
import type { Client, ClientCreatePayload, PaginatedResponse } from '../types';

export const clientService = {
  /**
   * Get all clients for the authenticated trainer
   */
  async getAllClients(): Promise<Client[]> {
    return apiClient.get<Client[]>('/clients/');
  },

  /**
   * Get paginated clients
   */
  async getClientsPaginated(page: number = 1): Promise<PaginatedResponse<Client>> {
    return apiClient.get<PaginatedResponse<Client>>('/clients/', {
      params: { page },
    });
  },

  /**
   * Get a single client by ID
   */
  async getClient(clientId: string): Promise<Client> {
    return apiClient.get<Client>(`/clients/${clientId}/`);
  },

  /**
   * Create a new client
   */
  async createClient(data: ClientCreatePayload): Promise<Client> {
    return apiClient.post<Client>('/clients/', data);
  },

  /**
   * Update client information
   */
  async updateClient(clientId: string, data: Partial<ClientCreatePayload>): Promise<Client> {
    return apiClient.patch<Client>(`/clients/${clientId}/`, data);
  },

  /**
   * Delete a client
   */
  async deleteClient(clientId: string): Promise<void> {
    return apiClient.delete<void>(`/clients/${clientId}/`);
  },

  /**
   * Deactivate a client (custom action)
   */
  async deactivateClient(clientId: string, reason?: string): Promise<{ status: string }> {
    return apiClient.post<{ status: string }>(`/clients/${clientId}/deactivate/`, { reason });
  },

  /**
   * Get client statistics
   */
  async getClientStatistics(): Promise<any> {
    return apiClient.get<any>('/clients/statistics/');
  },

  /**
   * Get client progress report
   */
  async getProgressReport(clientId: string): Promise<any> {
    return apiClient.get<any>(`/clients/${clientId}/progress_report/`);
  },
};
