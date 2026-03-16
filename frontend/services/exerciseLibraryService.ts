import { apiClient } from './api';
import type {
  ExerciseLibrary,
  ExerciseLibraryCreatePayload,
  PaginatedResponse
} from '../types';

export const exerciseLibraryService = {
  /**
   * Get all exercises (global + trainer's)
   */
  async getExercises(params?: {
    modality?: string;
    muscle_group?: string;
    category?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<ExerciseLibrary>> {
    return apiClient.get<PaginatedResponse<ExerciseLibrary>>('/library/exercises/', { params });
  },

  /**
   * Get single exercise
   */
  async getExercise(id: string): Promise<ExerciseLibrary> {
    return apiClient.get<ExerciseLibrary>(`/library/exercises/${id}/`);
  },

  /**
   * Create custom exercise
   */
  async createExercise(data: ExerciseLibraryCreatePayload): Promise<ExerciseLibrary> {
    return apiClient.post<ExerciseLibrary>('/library/exercises/', data);
  },

  /**
   * Update exercise
   */
  async updateExercise(id: string, data: Partial<ExerciseLibraryCreatePayload>): Promise<ExerciseLibrary> {
    return apiClient.patch<ExerciseLibrary>(`/library/exercises/${id}/`, data);
  },

  /**
   * Delete exercise
   */
  async deleteExercise(id: string): Promise<void> {
    return apiClient.delete<void>(`/library/exercises/${id}/`);
  },
};
