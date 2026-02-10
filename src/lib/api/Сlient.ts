import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../config/env';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: env.API_URL, // Теперь это будет http://localhost:8080/api/v1
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - add token
        this.client.interceptors.request.use(
            (config) => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle 401
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (!refreshToken) throw new Error('No refresh token');

                        const response = await axios.get(`${env.API_URL}/v1/auth/refresh`, {
                            headers: { refreshTokenAuth: refreshToken },
                        });

                        const { accessToken } = response.data;
                        localStorage.setItem('accessToken', accessToken);

                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    get instance() {
        return this.client;
    }
}

export const apiClient = new ApiClient().instance;
