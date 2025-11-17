/**
 * Analytics Service
 * Handles analytics and reporting operations
 */

import { apiClient } from './api';
import type {
  DashboardAnalytics,
  RevenueTrend,
  ClientRetentionData,
  PerformanceMetrics,
} from '../types';

export const analyticsService = {
  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<DashboardAnalytics> {
    return apiClient.get<DashboardAnalytics>('/analytics/dashboard/', {
      params: { period },
    });
  },

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    months: number = 6
  ): Promise<{ trends: RevenueTrend[] }> {
    return apiClient.get<{ trends: RevenueTrend[] }>('/analytics/revenue-trends/', {
      params: { period, months },
    });
  },

  /**
   * Get client retention metrics
   */
  async getClientRetention(): Promise<ClientRetentionData> {
    return apiClient.get<ClientRetentionData>('/analytics/client-retention/');
  },

  /**
   * Get trainer performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return apiClient.get<PerformanceMetrics>('/analytics/performance/');
  },
};
