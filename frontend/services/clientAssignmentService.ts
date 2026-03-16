import { apiClient } from './api';
import type {
  ClientWorkoutAssignment,
  ClientWorkoutAssignmentCreatePayload,
  ClientProgramAssignment,
  ClientProgramAssignmentCreatePayload,
  PaginatedResponse
} from '../types';

export const clientAssignmentService = {
  // Workout Assignments

  /**
   * Get workout assignments
   */
  async getWorkoutAssignments(params?: {
    client?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<ClientWorkoutAssignment>> {
    return apiClient.get<PaginatedResponse<ClientWorkoutAssignment>>(
      '/library/client-workout-assignments/',
      { params }
    );
  },

  /**
   * Create workout assignment
   */
  async createWorkoutAssignment(
    data: ClientWorkoutAssignmentCreatePayload
  ): Promise<ClientWorkoutAssignment> {
    return apiClient.post<ClientWorkoutAssignment>(
      '/library/client-workout-assignments/',
      data
    );
  },

  /**
   * Mark workout as complete
   */
  async markWorkoutComplete(id: string): Promise<ClientWorkoutAssignment> {
    return apiClient.post<ClientWorkoutAssignment>(
      `/library/client-workout-assignments/${id}/mark_complete/`
    );
  },

  /**
   * Delete workout assignment
   */
  async deleteWorkoutAssignment(id: string): Promise<void> {
    return apiClient.delete<void>(`/library/client-workout-assignments/${id}/`);
  },

  // Program Assignments

  /**
   * Get program assignments
   */
  async getProgramAssignments(params?: {
    client?: string;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<ClientProgramAssignment>> {
    return apiClient.get<PaginatedResponse<ClientProgramAssignment>>(
      '/library/client-program-assignments/',
      { params }
    );
  },

  /**
   * Create program assignment
   */
  async createProgramAssignment(
    data: ClientProgramAssignmentCreatePayload
  ): Promise<ClientProgramAssignment> {
    return apiClient.post<ClientProgramAssignment>(
      '/library/client-program-assignments/',
      data
    );
  },

  /**
   * Update program assignment
   */
  async updateProgramAssignment(
    id: string,
    data: Partial<ClientProgramAssignment>
  ): Promise<ClientProgramAssignment> {
    return apiClient.patch<ClientProgramAssignment>(
      `/library/client-program-assignments/${id}/`,
      data
    );
  },

  /**
   * Delete program assignment
   */
  async deleteProgramAssignment(id: string): Promise<void> {
    return apiClient.delete<void>(`/library/client-program-assignments/${id}/`);
  },
};
