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
                // Проверяем не истёк ли токен
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const isExpired = payload.exp * 1000 < Date.now();

                if (!isExpired) {
                    const user = JSON.parse(userStr);
                    // Восстанавливаем cookie (мог пропасть после перезагрузки)
                    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
                    set({ user, isAuthenticated: true });
                } else {
                    // Токен истёк — пробуем рефрешнуть тихо через refreshToken
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        // axiosInstance сам подхватит при первом запросе
                        const user = JSON.parse(userStr);
                        set({ user, isAuthenticated: true });
                    }
                }
            }
        } catch {
            // Повреждённые данные — чистим
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },
}));
