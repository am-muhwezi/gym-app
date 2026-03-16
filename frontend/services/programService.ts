import { apiClient } from './api';
import type {
  Program,
  ProgramCreatePayload,
  ProgramWeek,
  ProgramDay,
  PaginatedResponse
} from '../types';

export const programService = {
  /**
   * Get all programs
   */
  async getPrograms(page?: number): Promise<PaginatedResponse<Program>> {
    return apiClient.get<PaginatedResponse<Program>>('/library/programs/', {
      params: { page }
    });
  },

  /**
   * Get single program
   */
  async getProgram(id: string): Promise<Program> {
    return apiClient.get<Program>(`/library/programs/${id}/`);
  },

  /**
   * Create program
   */
  async createProgram(data: ProgramCreatePayload): Promise<Program> {
    return apiClient.post<Program>('/library/programs/', data);
  },

  /**
   * Update program
   */
  async updateProgram(id: string, data: Partial<ProgramCreatePayload>): Promise<Program> {
    return apiClient.patch<Program>(`/library/programs/${id}/`, data);
  },

  /**
   * Delete program
   */
  async deleteProgram(id: string): Promise<void> {
    return apiClient.delete<void>(`/library/programs/${id}/`);
  },

  /**
   * Add week to program
   */
  async addWeek(programId: string, data: {
    week_number: number;
    title?: string;
    description?: string;
  }): Promise<ProgramWeek> {
    return apiClient.post<ProgramWeek>(`/library/programs/${programId}/add_week/`, data);
  },

  /**
   * Add day to program week
   */
  async addDay(programId: string, weekId: string, data: {
    day_number: number;
    day_of_week: string;
    workout_template_id?: string;
    title?: string;
    notes?: string;
    is_rest_day: boolean;
  }): Promise<ProgramDay> {
    return apiClient.post<ProgramDay>(
      `/library/programs/${programId}/weeks/${weekId}/add_day/`,
      data
    );
  },
};
