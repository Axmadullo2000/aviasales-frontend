import { apiClient } from '@/lib/api/Сlient';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<void> => {
        await apiClient.post('/auth/register', data);
    },

    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await apiClient.get<AuthResponse>('/auth/refresh', {
            headers: {
                refreshTokenAuth: refreshToken,
            },
        });
        return response.data;
    }
};
