/**
 * Goal Service
 * Handles all goal-related API operations
 * Backend endpoints: /api/clients/{id}/goals/
 */

import { apiClient } from './api';
import type { Goal, GoalCreatePayload } from '../types';

export const goalService = {
  /**
   * Get all goals for a specific client
   * GET /api/clients/{id}/goals/
   */
  async getClientGoals(clientId: string): Promise<Goal[]> {
    return apiClient.get<Goal[]>(`/clients/${clientId}/goals/`);
  },

  /**
   * Get a single goal by ID
   */
  async getGoal(clientId: string, goalId: string): Promise<Goal> {
    const goals = await this.getClientGoals(clientId);
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) throw new Error('Goal not found');
    return goal;
  },

  /**
   * Create a new goal for a client
   * POST /api/clients/{id}/goals/
   */
  async createGoal(clientId: string, data: GoalCreatePayload): Promise<Goal> {
    return apiClient.post<Goal>(`/clients/${clientId}/goals/`, data);
  },

  /**
   * Update a goal
   * PATCH /api/clients/{id}/update_goal/
   */
  async updateGoal(clientId: string, goalId: string, data: Partial<GoalCreatePayload>): Promise<Goal> {
    return apiClient.patch<Goal>(`/clients/${clientId}/update_goal/`, {
      goal_id: goalId,
      ...data,
    });
  },

  /**
   * Update goal progress (current_value)
   */
  async updateGoalProgress(clientId: string, goalId: string, currentValue: string): Promise<Goal> {
    return apiClient.patch<Goal>(`/clients/${clientId}/update_goal/`, {
      goal_id: goalId,
      current_value: currentValue,
    });
  },

  /**
   * Mark goal as achieved
   * PATCH /api/clients/{id}/update_goal/
   */
  async completeGoal(clientId: string, goalId: string): Promise<Goal> {
    return apiClient.patch<Goal>(`/clients/${clientId}/update_goal/`, {
      goal_id: goalId,
      achieved: true,
    });
  },

  /**
   * Toggle goal achieved status
   */
  async toggleGoalAchieved(clientId: string, goalId: string, achieved: boolean): Promise<Goal> {
    return apiClient.patch<Goal>(`/clients/${clientId}/update_goal/`, {
      goal_id: goalId,
      achieved: achieved,
    });
  },

  /**
   * Delete a goal (not implemented in backend)
   */
  async deleteGoal(clientId: string, goalId: string): Promise<void> {
    throw new Error('Delete goal endpoint not implemented in backend');
  },
};
