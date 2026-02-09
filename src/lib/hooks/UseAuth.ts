import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../api';
import { useAuthStore } from '@/lib/store';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useLogin() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: (data: LoginRequest) => api.auth.login(data),
        onSuccess: (response) => {
            // Decode JWT to get user info (simple decode, not verification)
            const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]));

            setAuth(
                {
                    id: tokenPayload.userId,
                    email: tokenPayload.sub,
                    role: tokenPayload.role,
                },
                response.accessToken,
                response.refreshToken
            );

            toast.success('Login successful!');
            router.push('/');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        },
    });
}

export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: RegisterRequest) => api.auth.register(data),
        onSuccess: () => {
            toast.success('Registration successful! Please login.');
            router.push('/login');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        },
    });
}

export function useLogout() {
    const router = useRouter();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return () => {
        clearAuth();
        toast.success('Logged out successfully');
        router.push('/login');
    };
}