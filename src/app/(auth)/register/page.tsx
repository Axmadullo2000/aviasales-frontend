// app/register/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// ────────────────────────────────────────────────
// Схема валидации (такая же, как для логина)
// ────────────────────────────────────────────────
const registerSchema = z.object({
    email: z.string().email({ message: 'Введите корректный email' }),
    password: z
        .string()
        .min(6, { message: 'Пароль должен быть минимум 6 символов' })
        .max(72, { message: 'Пароль слишком длинный' }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('http://localhost:8080/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const text = await res.text(); // сервер возвращает простой текст

            if (!res.ok) {
                // 400, 409 (уже существует) и т.д.
                throw new Error(text || 'Ошибка регистрации');
            }

            // 200 → "User registered successfully"
            setSuccess(true);
            // Через 1.5–2 секунды редиректим на логин
            setTimeout(() => {
                router.push('/login?registered=true');
            }, 1800);
        } catch (err: any) {
            setError(err.message || 'Не удалось зарегистрироваться. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                        Создать аккаунт
                    </CardTitle>
                    <CardDescription className="text-center">
                        Введите email и пароль для регистрации
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {success ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="text-green-600 text-xl font-medium">
                                Регистрация успешна!
                            </div>
                            <p className="text-gray-600">Сейчас вы будете перенаправлены на страницу входа...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                    {...register('email')}
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Пароль</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    {...register('password')}
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <p className="text-sm text-destructive text-center pt-2">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full text-base py-6"
                                disabled={isLoading || success}
                            >
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Зарегистрироваться
                            </Button>
                        </form>
                    )}
                </CardContent>

                {!success && (
                    <CardFooter className="flex flex-col space-y-4 text-sm text-muted-foreground pt-2">
                        <div className="text-center">
                            Уже есть аккаунт?{' '}
                            <Link
                                href="/login"
                                className="text-primary hover:underline font-medium"
                            >
                                Войти
                            </Link>
                        </div>

                        <p className="text-xs text-center">
                            Регистрируясь, вы соглашаетесь с{' '}
                            <Link href="/terms" className="underline hover:text-primary">
                                условиями использования
                            </Link>{' '}
                            и{' '}
                            <Link href="/privacy" className="underline hover:text-primary">
                                политикой конфиденциальности
                            </Link>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}