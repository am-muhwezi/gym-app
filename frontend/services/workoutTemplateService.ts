import { apiClient } from './api';
import type {
  WorkoutTemplate,
  WorkoutTemplateCreatePayload,
  WorkoutExercise,
  WorkoutExerciseCreatePayload,
  PaginatedResponse
} from '../types';

export const workoutTemplateService = {
  /**
   * Get all workout templates
   */
  async getWorkouts(page?: number): Promise<PaginatedResponse<WorkoutTemplate>> {
    return apiClient.get<PaginatedResponse<WorkoutTemplate>>('/library/workouts/', {
      params: { page }
    });
  },

  /**
   * Get single workout template
   */
  async getWorkout(id: string): Promise<WorkoutTemplate> {
    return apiClient.get<WorkoutTemplate>(`/library/workouts/${id}/`);
  },

  /**
   * Create workout template
   */
  async createWorkout(data: WorkoutTemplateCreatePayload): Promise<WorkoutTemplate> {
    return apiClient.post<WorkoutTemplate>('/library/workouts/', data);
  },

  /**
   * Update workout template
   */
  async updateWorkout(id: string, data: Partial<WorkoutTemplateCreatePayload>): Promise<WorkoutTemplate> {
    return apiClient.patch<WorkoutTemplate>(`/library/workouts/${id}/`, data);
  },

  /**
   * Delete workout template
   */
  async deleteWorkout(id: string): Promise<void> {
    return apiClient.delete<void>(`/library/workouts/${id}/`);
  },

  /**
   * Add exercise to workout
   */
  async addExercise(workoutId: string, data: WorkoutExerciseCreatePayload): Promise<WorkoutExercise> {
    return apiClient.post<WorkoutExercise>(`/library/workouts/${workoutId}/add_exercise/`, data);
  },

  /**
   * Remove exercise from workout
   */
  async removeExercise(workoutId: string, exerciseId: string): Promise<void> {
    return apiClient.delete<void>(`/library/workouts/${workoutId}/remove_exercise/${exerciseId}/`);
  },
};
