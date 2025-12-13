/**
 * Trainer Management Service (Admin only)
 * SaaS Admin perspective - manages trainer accounts, not their business
 */

import { apiClient } from './api';
import { Trainer, TrainerCreatePayload, TrainerUpdatePayload, TrainerResetPasswordPayload, AdminAnalytics, TrainerDetailResponse, TrainerSubscriptionUpdatePayload } from '../types';

export const trainerService = {
    /**
     * Get all trainer accounts
     */
    async getTrainers(): Promise<Trainer[]> {
        const response = await apiClient.get<Trainer[]>('/auth/admin/trainers/');
        return response;
    },

    /**
     * Get specific trainer account details with operations
     */
    async getTrainer(trainerId: string): Promise<Trainer> {
        const response = await apiClient.get<Trainer>(`/auth/admin/trainers/${trainerId}/`);
        return response;
    },

    /**
     * Get detailed trainer info with statistics and operations
     */
    async getTrainerDetails(trainerId: string): Promise<TrainerDetailResponse> {
        const response = await apiClient.get<TrainerDetailResponse>(`/auth/admin/trainers/${trainerId}/`);
        return response;
    },

    /**
     * Create a new trainer account
     */
    async createTrainer(data: TrainerCreatePayload): Promise<Trainer> {
        const response = await apiClient.post<Trainer>('/auth/admin/trainers/create/', data);
        return response;
    },

    /**
     * Update trainer account details
     */
    async updateTrainer(trainerId: string, data: TrainerUpdatePayload): Promise<Trainer> {
        const response = await apiClient.patch<Trainer>(`/auth/admin/trainers/${trainerId}/update/`, data);
        return response;
    },

    /**
     * Delete a trainer account
     */
    async deleteTrainer(trainerId: string): Promise<void> {
        await apiClient.delete(`/auth/admin/trainers/${trainerId}/delete/`);
    },

    /**
     * Toggle trainer active status (suspend/activate)
     */
    async toggleActiveStatus(trainerId: string): Promise<{ message: string; is_active: boolean }> {
        const response = await apiClient.patch<{ message: string; is_active: boolean }>(
            `/auth/admin/trainers/${trainerId}/toggle-active/`,
            {}
        );
        return response;
    },

    /**
     * Reset trainer password (admin action)
     */
    async resetPassword(trainerId: string, data: TrainerResetPasswordPayload): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(
            `/auth/admin/trainers/${trainerId}/reset-password/`,
            data
        );
        return response;
    },

    /**
     * Update trainer subscription (admin action)
     */
    async updateSubscription(trainerId: string, data: TrainerSubscriptionUpdatePayload): Promise<{ message: string; subscription: any }> {
        const response = await apiClient.patch<{ message: string; subscription: any }>(
            `/auth/admin/trainers/${trainerId}/subscription/`,
            data
        );
        return response;
    },

    /**
     * Block a trainer account (admin action)
     */
    async blockTrainer(trainerId: string, block_reason?: string): Promise<{ message: string; account_blocked: boolean; block_reason: string; blocked_at: string }> {
        const response = await apiClient.post<{ message: string; account_blocked: boolean; block_reason: string; blocked_at: string }>(
            `/auth/admin/trainers/${trainerId}/block/`,
            { block_reason }
        );
        return response;
    },

    /**
     * Unblock a trainer account (admin action)
     */
    async unblockTrainer(trainerId: string): Promise<{ message: string; account_blocked: boolean }> {
        const response = await apiClient.post<{ message: string; account_blocked: boolean }>(
            `/auth/admin/trainers/${trainerId}/unblock/`,
            {}
        );
        return response;
    },

    /**
     * Get platform-level admin analytics
     */
    async getAdminAnalytics(): Promise<AdminAnalytics> {
        const response = await apiClient.get<AdminAnalytics>('/auth/admin/analytics/');
        return response;
    },
};
