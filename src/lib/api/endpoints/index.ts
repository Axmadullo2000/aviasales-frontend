import apiClient from './Flights';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../../../types';

export const api = {
    auth: {
        login: async (data: LoginRequest): Promise<AuthResponse> => {
            const response = await apiClient.post('/v1/auth/login', data);
            return response.data;
        },

        register: async (data: RegisterRequest): Promise<AuthResponse> => {
            const response = await apiClient.post('/v1/auth/register', data);
            return response.data;
        },

        refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
            const response = await apiClient.post('/v1/auth/refresh', { refreshToken });
            return response.data;
        },
    },
};
