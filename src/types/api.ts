// src/lib/api.ts

import axios from 'axios';
import { useAuthStore } from '@/lib/store/AuthStore';
import type {
    LoginRequest,
    RegisterRequest,
    CreateBookingRequest,
} from '@/types';

// ─── Axios instance ──────────────────────────────────────────────────────────

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: подставляем accessToken ───────────────────────────

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response interceptor: тихий refresh при 401 ────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Если 401 и это не повторный запрос и не запрос refresh/login
        if (
            error.response?.status === 401 &&
            !original._retry &&
            !original.url?.includes('/auth/')
        ) {
            if (isRefreshing) {
                // Ставим запрос в очередь пока идёт refresh
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(original);
                });
            }

            original._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                useAuthStore.getState().clearAuth();
                window.dispatchEvent(new Event('auth-logout'));
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
                    { headers: { refreshTokenAuth: refreshToken } }
                );

                const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
                useAuthStore.getState().setAuth(
                    {
                        id: payload.userId || payload.sub,
                        email: payload.sub,
                        role: payload.role,
                    },
                    data.accessToken,
                    data.refreshToken
                );

                processQueue(null, data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return axiosInstance(original);
            } catch (refreshError) {
                processQueue(refreshError, null);
                useAuthStore.getState().clearAuth();
                window.dispatchEvent(new Event('auth-logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ─── API методы ──────────────────────────────────────────────────────────────

export const api = {

    auth: {
        login: (data: LoginRequest) =>
            axiosInstance
                .post<{ accessToken: string; refreshToken: string }>('/auth/login', data)
                .then((r) => r.data),

        register: (data: RegisterRequest) =>
            axiosInstance
                .post<{ accessToken: string; refreshToken: string }>('/auth/register', data)
                .then((r) => r.data),

        refresh: (refreshToken: string) =>
            axiosInstance
                .get<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
                    headers: { refreshTokenAuth: refreshToken },
                })
                .then((r) => r.data),
    },

    bookings: {
        create: (data: CreateBookingRequest) =>
            axiosInstance
                .post<{ bookingReference: string }>('/bookings', data)
                .then((r) => r.data),

        getByReference: (reference: string) =>
            axiosInstance
                .get(`/bookings/${reference}`)
                .then((r) => r.data),

        getUserBookings: (page = 0, size = 10) =>
            axiosInstance
                .get('/bookings/my', { params: { page, size } })
                .then((r) => r.data),

        cancel: (reference: string, body?: { reason?: string }) =>
            axiosInstance
                .post(`/bookings/${reference}/cancel`, body)
                .then((r) => r.data),

        downloadTicket: (reference: string) =>
            axiosInstance
                .get(`/bookings/${reference}/ticket`, { responseType: 'blob' })
                .then((r) => r.data as Blob),
    },
};
