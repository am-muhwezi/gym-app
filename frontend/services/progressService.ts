/**
 * Progress Service
 * Handles client progress tracking and measurements
 */

import { apiClient } from './api';
import type { ClientProgress, ProgressCreatePayload } from '../types';

export const progressService = {
  /**
   * Get all progress records for a client
   */
  async getClientProgress(clientId: string): Promise<ClientProgress[]> {
    return apiClient.get<ClientProgress[]>('/clients/progress/', {
      params: { client: clientId },
    });
  },

  /**
   * Get latest progress record for a client
   */
  async getLatestProgress(clientId: string): Promise<ClientProgress | null> {
    const records = await this.getClientProgress(clientId);
    return records.length > 0 ? records[0] : null;
  },

  /**
   * Get a single progress record
   */
  async getProgress(progressId: string): Promise<ClientProgress> {
    return apiClient.get<ClientProgress>(`/clients/progress/${progressId}/`);
  },

  /**
   * Create a new progress record
   */
  async createProgress(clientId: string, data: ProgressCreatePayload): Promise<ClientProgress> {
    return apiClient.post<ClientProgress>('/clients/progress/', {
      ...data,
      client: clientId,
    });
  },

  /**
   * Update a progress record
   */
  async updateProgress(
    progressId: string,
    data: Partial<ProgressCreatePayload>
  ): Promise<ClientProgress> {
    return apiClient.patch<ClientProgress>(`/clients/progress/${progressId}/`, data);
  },

  /**
   * Delete a progress record
   */
  async deleteProgress(progressId: string): Promise<void> {
    return apiClient.delete<void>(`/clients/progress/${progressId}/`);
  },

  /**
   * Calculate BMI from latest progress
   */
  calculateBMI(weight: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(2));
  },

  /**
   * Get progress comparison (first vs latest)
   */
  async getProgressComparison(clientId: string): Promise<{
    first: ClientProgress | null;
    latest: ClientProgress | null;
    changes: Record<string, number>;
  }> {
    const records = await this.getClientProgress(clientId);

    if (records.length === 0) {
      return { first: null, latest: null, changes: {} };
    }

    const first = records[records.length - 1];
    const latest = records[0];
    const changes: Record<string, number> = {};

    // Calculate changes for numeric fields
    const fields = [
      'weight',
      'body_fat_percentage',
      'muscle_mass',
      'chest',
      'waist',
      'hips',
      'arms',
      'thighs',
    ];

    fields.forEach((field) => {
      const firstVal = (first as any)[field];
      const latestVal = (latest as any)[field];
      if (firstVal != null && latestVal != null) {
        changes[field] = latestVal - firstVal;
      }
    });

    return { first, latest, changes };
  },
};
