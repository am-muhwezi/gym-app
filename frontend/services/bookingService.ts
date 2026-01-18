/**
 * Booking Service
 * Handles booking and scheduling operations
 */

import { apiClient } from './api';
import type {
  Booking,
  BookingCreatePayload,
  BookingUpdatePayload,
  BookingStatistics,
  Schedule,
  RecurringBooking,
  PaginatedResponse,
} from '../types';

export const bookingService = {
  /**
   * Get paginated bookings
   */
  async getBookings(page: number = 1, filters?: {
    status?: string;
    client?: string;
    upcoming?: boolean;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Booking>> {
    return apiClient.get<PaginatedResponse<Booking>>('/bookings/bookings/', {
      params: { ...filters, page },
    });
  },

  /**
   * Get all bookings (handles pagination internally)
   */
  async getAllBookings(filters?: {
    status?: string;
    client?: string;
    upcoming?: boolean;
    date_from?: string;
    date_to?: string;
  }): Promise<Booking[]> {
    const firstPage = await apiClient.get<PaginatedResponse<Booking>>('/bookings/bookings/', {
      params: { ...filters, page: 1, page_size: 100 },
    });

    let allBookings = [...firstPage.results];

    if (firstPage.total_pages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= firstPage.total_pages; page++) {
        pagePromises.push(
          apiClient.get<PaginatedResponse<Booking>>('/bookings/bookings/', {
            params: { ...filters, page, page_size: 100 },
          })
        );
      }

      const additionalPages = await Promise.all(pagePromises);
      additionalPages.forEach(pageData => {
        allBookings = [...allBookings, ...pageData.results];
      });
    }

    return allBookings;
  },

  /**
   * Get a single booking
   */
  async getBooking(bookingId: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/bookings/${bookingId}/`);
  },

  /**
   * Create a new booking
   */
  async createBooking(data: BookingCreatePayload): Promise<Booking> {
    return apiClient.post<Booking>('/bookings/bookings/', data);
  },

  /**
   * Update a booking
   */
  async updateBooking(bookingId: string, data: BookingUpdatePayload): Promise<Booking> {
    return apiClient.patch<Booking>(`/bookings/bookings/${bookingId}/`, data);
  },

  /**
   * Delete a booking
   */
  async deleteBooking(bookingId: string): Promise<void> {
    return apiClient.delete<void>(`/bookings/bookings/${bookingId}/`);
  },

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(page: number = 1): Promise<PaginatedResponse<Booking>> {
    return apiClient.get<PaginatedResponse<Booking>>('/bookings/bookings/upcoming/', {
      params: { page },
    });
  },

  /**
   * Get today's bookings
   */
  async getTodayBookings(page: number = 1): Promise<PaginatedResponse<Booking>> {
    return apiClient.get<PaginatedResponse<Booking>>('/bookings/bookings/today/', {
      params: { page },
    });
  },

  /**
   * Mark booking as completed
   */
  async completeBooking(
    bookingId: string,
    data: { session_summary?: string; client_rating?: number }
  ): Promise<Booking> {
    return apiClient.post<Booking>(`/bookings/bookings/${bookingId}/complete/`, data);
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    return apiClient.post<Booking>(`/bookings/bookings/${bookingId}/cancel/`, { reason });
  },

  /**
   * Get booking statistics
   */
  async getStatistics(): Promise<BookingStatistics> {
    return apiClient.get<BookingStatistics>('/bookings/bookings/statistics/');
  },

  // ============ SCHEDULE MANAGEMENT ============

  /**
   * Get trainer's schedule
   */
  async getSchedules(): Promise<Schedule[]> {
    return apiClient.get<Schedule[]>('/bookings/schedules/');
  },

  /**
   * Create a schedule slot
   */
  async createSchedule(data: {
    weekday: number;
    start_time: string;
    end_time: string;
    is_available?: boolean;
    notes?: string;
  }): Promise<Schedule> {
    return apiClient.post<Schedule>('/bookings/schedules/', data);
  },

  /**
   * Update a schedule slot
   */
  async updateSchedule(scheduleId: string, data: Partial<Schedule>): Promise<Schedule> {
    return apiClient.patch<Schedule>(`/bookings/schedules/${scheduleId}/`, data);
  },

  /**
   * Delete a schedule slot
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    return apiClient.delete<void>(`/bookings/schedules/${scheduleId}/`);
  },

  // ============ RECURRING BOOKINGS ============

  /**
   * Get recurring bookings
   */
  async getRecurringBookings(): Promise<RecurringBooking[]> {
    return apiClient.get<RecurringBooking[]>('/bookings/recurring-bookings/');
  },

  /**
   * Create a recurring booking
   */
  async createRecurringBooking(data: {
    client: string;
    session_type: string;
    title: string;
    description?: string;
    weekday: number;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    location?: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    start_date: string;
    end_date?: string;
  }): Promise<RecurringBooking> {
    return apiClient.post<RecurringBooking>('/bookings/recurring-bookings/', data);
  },

  /**
   * Update a recurring booking
   */
  async updateRecurringBooking(
    recurringBookingId: string,
    data: Partial<RecurringBooking>
  ): Promise<RecurringBooking> {
    return apiClient.patch<RecurringBooking>(
      `/bookings/recurring-bookings/${recurringBookingId}/`,
      data
    );
  },

  /**
   * Delete a recurring booking
   */
  async deleteRecurringBooking(recurringBookingId: string): Promise<void> {
    return apiClient.delete<void>(`/bookings/recurring-bookings/${recurringBookingId}/`);
  },
};
