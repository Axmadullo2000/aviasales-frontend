'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, Lock, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Card } from '../../../components/ui';//@/components/ui
import { loginSchema, type LoginFormData } from '@/src/lib/utils/validation';//@/lib/utils/validation
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/lib/store/authStore';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);

        try {
            // Call login API
            const response = await api.auth.login(data);

            // Decode JWT to get user info (simple decode, not verification)
            const tokenPayload = JSON.parse(
                atob(response.accessToken.split('.')[1])
            );

            // Set auth in store
            setAuth(
                {
                    id: tokenPayload.userId,
                    email: data.email,
                    role: tokenPayload.role,
                },
                response.accessToken,
                response.refreshToken
            );

            toast.success('Login successful!');
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
            <Card className="w-full max-w-md" padding="lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Plane className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to your Aviasales account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="your.email@example.com"
                        error={errors.email?.message}
                        leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                        autoComplete="email"
                    />

                    <Input
                        {...register('password')}
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        error={errors.password?.message}
                        leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                        autoComplete="current-password"
                    />

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">Remember me</span>
                        </label>
                        <a href="#" className="text-blue-600 hover:text-blue-700">
                            Forgot password?
                        </a>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Sign In
                    </Button>
                </form>

                {/* Divider */}
                <div className="mt-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300" />
                    <span className="px-4 text-sm text-gray-500">or</span>
                    <div className="flex-1 border-t border-gray-300" />
                </div>

                {/* Register Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Test Credentials (for development) */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800 mb-2">Test Credentials:</p>
                    <p className="text-xs text-yellow-700">
                        Email: axmadullo2000@gmail.com<br />
                        Password: admin123
                    </p>
                </div>
            </Card>
        </div>
    );
}