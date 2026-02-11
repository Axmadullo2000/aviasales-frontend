'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Plane } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLogin } from '@/lib/hooks';  // ← подключаем хук

const loginSchema = z.object({
    email: z.string().email('Пожалуйста, введите корректный email'),
    password: z.string().min(1, 'Пароль не может быть пустым'),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/';  // ← откуда пришли
    const { mutate: login, isPending } = useLogin(redirectTo);  // ← передаём redirectTo

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { rememberMe: true },
    });

    const onSubmit = (data: LoginFormValues) => {
        login({ email: data.email, password: data.password });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md border border-slate-200 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-3 pb-6 pt-8 px-8 text-center bg-gradient-to-b from-white to-slate-50">
                        <div className="mx-auto w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                            <Plane className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                            Вход в аккаунт
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            Войдите, чтобы найти лучшие билеты
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 pt-2">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input
                                {...register('email')}
                                type="email"
                                label="Email"
                                placeholder="name@example.com"
                                error={errors.email?.message}
                                leftIcon={<Mail className="h-5 w-5 text-slate-500" />}
                                autoComplete="email"
                                autoFocus
                            />
                            <Input
                                {...register('password')}
                                type="password"
                                label="Пароль"
                                placeholder="••••••••••"
                                error={errors.password?.message}
                                leftIcon={<Lock className="h-5 w-5 text-slate-500" />}
                                autoComplete="current-password"
                            />
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        {...register('rememberMe')}
                                    />
                                    <span className="text-slate-700 select-none">Запомнить меня</span>
                                </label>
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                                disabled={isPending}
                                loading={isPending}
                            >
                                Войти
                            </Button>
                        </form>

                        <div className="mt-8 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-slate-500">или</span>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-sm text-slate-600">
                            Нет аккаунта?{' '}
                            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                                Зарегистрироваться
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </main>
            <Footer className="py-8 text-slate-500 text-sm border-t" />
        </div>
    );
}
