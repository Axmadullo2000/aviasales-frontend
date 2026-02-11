// src/lib/store/AuthStore.ts
// ЗАМЕНИТЕ ПОЛНОСТЬЮ существующий AuthStore.ts

import { create } from 'zustand';

interface User {
    id: string | number;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
    initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setAuth: (user, accessToken, refreshToken) => {
        // Сохраняем в cookie (для middleware) и localStorage (для axiosInstance)
        document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },

    clearAuth: () => {
        document.cookie = 'accessToken=; path=/; max-age=0';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },

    // Восстанавливаем сессию после перезагрузки страницы
    initFromStorage: () => {
        try {
            const userStr = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');

            if (userStr && accessToken) {
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const isExpired = payload.exp * 1000 < Date.now();

                if (!isExpired) {
                    const user = JSON.parse(userStr);
                    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
                    set({ user, isAuthenticated: true });
                } else {
                    // Токен истёк — всё равно восстанавливаем user,
                    // axiosInstance сам сделает refresh при первом запросе
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        const user = JSON.parse(userStr);
                        set({ user, isAuthenticated: true });
                    } else {
                        // Нет refresh токена — чистим всё
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                    }
                }
            }
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },
}));
