/**
 * Log Service
 * Handles daily logs and activity tracking
 */

import { apiClient } from './api';
import type { Log, LogCreatePayload } from '../types';

export const logService = {
  /**
   * Get all logs for a client
   */
  async getClientLogs(clientId: string): Promise<Log[]> {
    return apiClient.get<Log[]>('/clients/logs/', {
      params: { client: clientId },
    });
  },

  /**
   * Get recent logs for a client (last N days)
   */
  async getRecentLogs(clientId: string, days: number = 21): Promise<Log[]> {
    const logs = await this.getClientLogs(clientId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return logs.filter((log) => new Date(log.date) >= cutoffDate);
  },

  /**
   * Get a single log
   */
  async getLog(logId: string): Promise<Log> {
    return apiClient.get<Log>(`/clients/logs/${logId}/`);
  },

  /**
   * Create a new log
   */
  async createLog(clientId: string, data: LogCreatePayload): Promise<Log> {
    return apiClient.post<Log>('/clients/logs/', {
      ...data,
      client: clientId,
    });
  },

  /**
   * Update a log
   */
  async updateLog(logId: string, data: Partial<LogCreatePayload>): Promise<Log> {
    return apiClient.patch<Log>(`/clients/logs/${logId}/`, data);
  },

  /**
   * Delete a log
   */
  async deleteLog(logId: string): Promise<void> {
    return apiClient.delete<void>(`/clients/logs/${logId}/`);
  },

  /**
   * Get average performance rating for a client
   */
  async getAveragePerformance(clientId: string, days?: number): Promise<number> {
    const logs = days
      ? await this.getRecentLogs(clientId, days)
      : await this.getClientLogs(clientId);

    const logsWithRating = logs.filter((log) => log.performance_rating != null);

    if (logsWithRating.length === 0) return 0;

    const sum = logsWithRating.reduce((acc, log) => acc + (log.performance_rating || 0), 0);
    return parseFloat((sum / logsWithRating.length).toFixed(2));
  },
};
