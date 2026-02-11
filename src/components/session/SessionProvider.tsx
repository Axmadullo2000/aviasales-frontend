'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/AuthStore';

// ─── Настройки ─────────────────────────────────────────────────────────────
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const COUNTDOWN_SECONDS = 60;
// ────────────────────────────────────────────────────────────────────────────

function Ring({ value, max }: { value: number; max: number }) {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / max) * circ;
    const color = value > 30 ? '#3b82f6' : value > 10 ? '#f59e0b' : '#ef4444';

    return (
        <svg className="w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
            />
        </svg>
    );
}

function IdleModal({
                       countdown,
                       onStillHere,
                       onLogout,
                   }: {
    countdown: number;
    onStillHere: () => void;
    onLogout: () => void;
}) {
    const urgent = countdown <= 10;
    const mid = countdown <= 30 && countdown > 10;
    const accent = urgent ? '#ef4444' : mid ? '#f59e0b' : '#3b82f6';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
                <div
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30"
                    style={{ background: accent }}
                />
                <div className="p-8 relative">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Сессия неактивна</h2>
                        <div className="relative">
                            <Ring value={countdown} max={COUNTDOWN_SECONDS} />
                            <div
                                className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
                                style={{ color: accent }}
                            >
                                {countdown}
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-8">
                        Вы ещё здесь? Иначе через <strong>{countdown} сек</strong> будет выполнен выход.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onLogout}
                            className="flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            Выйти сейчас
                        </button>
                        <button
                            onClick={onStillHere}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            Я здесь
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, clearAuth, setAuth, initFromStorage } = useAuthStore();

    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    const clearAllTimers = useCallback(() => {
        console.log('[TIMERS] Очистка всех таймеров');
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        idleTimerRef.current = null;
        countdownTimerRef.current = null;
    }, []);

    const doLogout = useCallback(() => {
        console.log('[LOGOUT] Выполняется выход');
        clearAllTimers();
        setShowModal(false);
        clearAuth();
        router.replace('/login');
    }, [clearAuth, router, clearAllTimers]);

    const startIdleTimer = useCallback(() => {
        if (!isAuthenticated || showModal) {
            console.log('[IDLE] Таймер не запускаем: не авторизован или модалка уже открыта');
            return;
        }
        clearAllTimers();
        console.log(`[IDLE] Запускаем таймер бездействия на ${IDLE_TIMEOUT_MS / 1000} сек`);
        idleTimerRef.current = setTimeout(() => {
            console.log('[IDLE] Сработал таймер бездействия → открываем модалку');
            startCountdown();
        }, IDLE_TIMEOUT_MS);
    }, [isAuthenticated, showModal, clearAllTimers]);

    const startCountdown = useCallback(() => {
        clearAllTimers();
        setShowModal(true);
        setCountdown(COUNTDOWN_SECONDS);
        console.log('[COUNTDOWN] Модалка открыта, запускаем обратный отсчёт');

        const interval = setInterval(() => {
            console.log('[COUNTDOWN] Тик');
            setCountdown((prev) => {
                const next = prev - 1;
                console.log(`[COUNTDOWN] Новое значение: ${next}`);
                if (next <= 0) {
                    console.log('[COUNTDOWN] Достигли 0 → выход');
                    clearInterval(interval);
                    setTimeout(doLogout, 50); // даём React дорисовать 0
                    return 0;
                }
                return next;
            });
        }, 1000);

        countdownTimerRef.current = interval;
    }, [doLogout, clearAllTimers]);

    const handleStillHere = useCallback(async () => {
        console.log('[STILL_HERE] Пользователь нажал "Я здесь"');
        clearAllTimers();
        setShowModal(false);

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.log('[REFRESH] Нет refreshToken → выход');
            doLogout();
            return;
        }

        // ... остальной код refresh (без изменений) ...
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
                { method: 'GET', headers: { refreshTokenAuth: refreshToken } }
            );

            if (!res.ok) throw new Error('Refresh failed');

            const data = await res.json();
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));

            setAuth(
                {
                    id: payload.id || payload.userId || payload.sub,
                    email: payload.email || payload.sub,
                    role: payload.role || payload.roles?.[0] || 'ROLE_USER',
                },
                data.accessToken,
                data.refreshToken
            );

            startIdleTimer();
        } catch (err) {
            console.error('[REFRESH] Ошибка:', err);
            doLogout();
        }
    }, [doLogout, setAuth, startIdleTimer, clearAllTimers]);

    // ── Монтирование ──────────────────────────────────────────────────────────
    useEffect(() => {
        console.log('[SessionProvider] Монтирование');
        initFromStorage();

        return () => {
            console.log('[SessionProvider] Размонтирование');
            clearAllTimers();
        };
    }, [initFromStorage, clearAllTimers]);

    // ── Отслеживание активности ──────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('[ACTIVITY] Не авторизован → таймеры очищены');
            clearAllTimers();
            return;
        }

        const reset = () => {
            if (showModal) return;
            startIdleTimer();
        };

        const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

        console.log('[ACTIVITY] Слушатели активности добавлены');
        startIdleTimer(); // сразу запускаем

        return () => {
            events.forEach((ev) => window.removeEventListener(ev, reset));
            clearAllTimers();
        };
    }, [isAuthenticated, showModal, startIdleTimer, clearAllTimers]);

    return (
        <>
            {children}
            {showModal && (
                <IdleModal
                    countdown={countdown}
                    onStillHere={handleStillHere}
                    onLogout={doLogout}
                />
            )}
        </>
    );
}
