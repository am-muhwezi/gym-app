/**
 * Goal Service
 * Handles all goal-related API operations
 */

import { apiClient } from './api';
import type { Goal, GoalCreatePayload } from '../types';

export const goalService = {
  /**
   * Get all goals for a specific client
   */
  async getClientGoals(clientId: string): Promise<Goal[]> {
    return apiClient.get<Goal[]>('/goals/', {
      params: { client: clientId },
    });
  },

  /**
   * Get a single goal
   */
  async getGoal(goalId: string): Promise<Goal> {
    return apiClient.get<Goal>(`/goals/${goalId}/`);
  },

  /**
   * Create a new goal for a client
   */
  async createGoal(clientId: string, data: GoalCreatePayload): Promise<Goal> {
    return apiClient.post<Goal>('/goals/', {
      ...data,
      client: clientId,
    });
  },

  /**
   * Update a goal
   */
  async updateGoal(goalId: string, data: Partial<GoalCreatePayload>): Promise<Goal> {
    return apiClient.patch<Goal>(`/goals/${goalId}/`, data);
  },

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, currentValue: string): Promise<Goal> {
    return apiClient.patch<Goal>(`/goals/${goalId}/`, {
      current_value: currentValue,
    });
  },

  /**
   * Mark goal as completed
   */
  async completeGoal(goalId: string): Promise<Goal> {
    return apiClient.patch<Goal>(`/goals/${goalId}/`, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    return apiClient.delete<void>(`/goals/${goalId}/`);
  },
};
