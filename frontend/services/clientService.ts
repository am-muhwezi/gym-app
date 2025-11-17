/**
 * Client Service
 * Handles all client-related API operations
 */

import { apiClient } from './api';
import type { Client, ClientCreatePayload, PaginatedResponse } from '../types';

export const clientService = {
  /**
   * Get all clients for the authenticated trainer (handles pagination internally)
   */
  async getAllClients(): Promise<Client[]> {
    // First, get the first page to know total pages
    const firstPage = await apiClient.get<PaginatedResponse<Client>>('/clients/', {
      params: { page: 1, page_size: 100 },
    });

    let allClients = [...firstPage.results];

    // If there are more pages, fetch them all
    if (firstPage.total_pages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= firstPage.total_pages; page++) {
        pagePromises.push(
          apiClient.get<PaginatedResponse<Client>>('/clients/', {
            params: { page, page_size: 100 },
          })
        );
      }

      const additionalPages = await Promise.all(pagePromises);
      additionalPages.forEach(pageData => {
        allClients = [...allClients, ...pageData.results];
      });
    }

    return allClients;
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
