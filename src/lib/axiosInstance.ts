// src/lib/axiosInstance.ts
// ЗАМЕНИТЕ ПОЛНОСТЬЮ существующий axiosInstance.ts

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST: автоматически вставляем accessToken ────────────────────────────
axiosInstance.interceptors.request.use((config) => {
    // Ищем токен сначала в cookie, потом в localStorage
    const tokenFromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessToken='))
        ?.split('=')[1];

    const token = tokenFromCookie || localStorage.getItem('accessToken');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── RESPONSE: при 401 — пробуем обновить токен один раз ─────────────────────
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Не рефрешим запросы к самому auth
        const isAuthEndpoint =
            originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/refresh') ||
            originalRequest?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                // Ставим запрос в очередь пока идёт рефреш
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Запрос на обновление токена (нативный fetch — не через axiosInstance!)
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
                    {
                        method: 'GET',
                        headers: { refreshTokenAuth: refreshToken },
                    }
                );

                if (!res.ok) throw new Error('Refresh failed');

                const data = await res.json();
                const newAccessToken: string = data.accessToken;
                const newRefreshToken: string = data.refreshToken;

                // Сохраняем новые токены
                document.cookie = `accessToken=${newAccessToken}; path=/; max-age=900; SameSite=Lax`;
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Обновляем zustand store (через window event — чтобы не создавать circular import)
                window.dispatchEvent(
                    new CustomEvent('token-refreshed', {
                        detail: { accessToken: newAccessToken, refreshToken: newRefreshToken },
                    })
                );

                processQueue(null, newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Рефреш не удался — выходим
                document.cookie = 'accessToken=; path=/; max-age=0';
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                window.dispatchEvent(new CustomEvent('auth-logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
