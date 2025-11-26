/**
 * Authentication Service
 * Handles user login, signup, logout
 */

import { apiClient } from './api';
import { AuthResponse, LoginCredentials, User } from '../types';

interface SignupData {
    username: string;
    email: string;
    phone_number: string;
    password: string;
    user_type?: 'trainer' | 'client' | 'admin';
}

export const authService = {
    /**
     * Login user with username and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
        return response;
    },

    /**
     * Sign up new user
     */
    async signup(data: SignupData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/signup/', data);
        return response;
    },

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        await apiClient.post('/auth/logout/', {});
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>('/auth/me/');
        return response;
    },

    /**
     * Set auth token in API client and localStorage
     */
    setToken(token: string | null): void {
        if (token) {
            apiClient.setToken(token);
            localStorage.setItem('auth_token', token);
        } else {
            apiClient.clearToken();
            localStorage.removeItem('auth_token');
        }
    },

    /**
     * Remove auth token from API client and localStorage
     */
    removeToken(): void {
        apiClient.clearToken();
        localStorage.removeItem('auth_token');
    },

    /**
     * Get auth token from localStorage
     */
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    /**
     * Request password reset - sends reset link to email
     */
    async requestPasswordReset(email: string): Promise<{ message: string; reset_url?: string }> {
        const response = await apiClient.post<{ message: string; reset_url?: string }>(
            '/auth/password-reset/request/',
            { email }
        );
        return response;
    },

    /**
     * Confirm password reset with token
     */
    async confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(
            '/auth/password-reset/confirm/',
            { token, new_password: newPassword }
        );
        return response;
    },
};
