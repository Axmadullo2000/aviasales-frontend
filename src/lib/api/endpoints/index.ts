import type { LoginRequest, RegisterRequest, AuthResponse } from '../../../types';
import {apiClient} from "@/lib/api/Сlient";

export const api = {
    auth: {
        login: async (data: LoginRequest): Promise<AuthResponse> => {
            const response = await apiClient.post('/auth/login', data);
            return response.data;
        },

        register: async (data: RegisterRequest): Promise<AuthResponse> => {
            const response = await apiClient.post('/auth/register', data);
            return response.data;
        },

        refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
            const response = await apiClient.post('/auth/refresh', { refreshToken });
            return response.data;
        },
    },
};
