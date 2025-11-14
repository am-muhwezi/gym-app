/**
 * Workout Service
 * Handles all workout and exercise-related API operations
 */

import { apiClient } from './api';

export interface WorkoutPlan {
  id: string;
  client: string;
  name: string;
  description: string;
  exercises: Exercise[];
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  workout_plan: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  rest_period_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanCreatePayload {
  name: string;
  description?: string;
}

export interface ExerciseCreatePayload {
  name: string;
  description?: string;
  sets: number;
  reps: number;
  rest_period_seconds: number;
}

export const workoutService = {
  /**
   * Get all workout plans for a client
   * GET /api/clients/{id}/workouts/
   */
  async getClientWorkouts(clientId: string): Promise<WorkoutPlan[]> {
    return apiClient.get<WorkoutPlan[]>(`/clients/${clientId}/workouts/`);
  },

  /**
   * Create a new workout plan for a client
   * POST /api/clients/{id}/workouts/
   */
  async createWorkoutPlan(clientId: string, data: WorkoutPlanCreatePayload): Promise<WorkoutPlan> {
    return apiClient.post<WorkoutPlan>(`/clients/${clientId}/workouts/`, data);
  },

  /**
   * Delete a workout plan
   * DELETE /api/clients/{id}/workouts/{planId}/
   */
  async deleteWorkoutPlan(clientId: string, planId: string): Promise<void> {
    return apiClient.delete<void>(`/clients/${clientId}/workouts/${planId}/`);
  },

  /**
   * Add an exercise to a workout plan
   * POST /api/clients/{id}/workouts/{planId}/exercises/
   */
  async addExercise(
    clientId: string,
    planId: string,
    data: ExerciseCreatePayload
  ): Promise<Exercise> {
    return apiClient.post<Exercise>(
      `/clients/${clientId}/workouts/${planId}/exercises/`,
      data
    );
  },

  /**
   * Delete an exercise from a workout plan
   * DELETE /api/clients/{id}/workouts/{planId}/exercises/{exerciseId}/
   */
  async deleteExercise(
    clientId: string,
    planId: string,
    exerciseId: string
  ): Promise<void> {
    return apiClient.delete<void>(
      `/clients/${clientId}/workouts/${planId}/exercises/${exerciseId}/`
    );
  },
};
