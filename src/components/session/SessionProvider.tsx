'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/AuthStore';

// ─── Настройки ─────────────────────────────────────────────────────────────
const IDLE_MS = 10 * 60 * 1000; // показать диалог через 10 мин бездействия
const COUNTDOWN = 60;            // секунд на ответ
// ───────────────────────────────────────────────────────────────────────────

// Круговой таймер
function Ring({ value, max }: { value: number; max: number }) {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / max) * circ;
    const color = value > 30 ? '#3b82f6' : value > 10 ? '#f59e0b' : '#ef4444';
    return (
        <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
    <circle cx="34" cy="34" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
    <circle
        cx="34" cy="34" r={r} fill="none"
    stroke={color} strokeWidth="5" strokeLinecap="round"
    strokeDasharray={circ} strokeDashoffset={offset}
    style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s' }}
    />
    </svg>
);
}

// Модалка
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
        <>
            <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(2,8,23,0.82)',
            backdropFilter: 'blur(6px)',
            animation: 'sid-fade .2s ease',
    }} />

    <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            animation: 'sid-up .25s cubic-bezier(.34,1.56,.64,1)',
    }}>
    <div style={{
        background: 'linear-gradient(145deg,#0f172a,#1e293b)',
            border: '1px solid rgba(148,163,184,.12)',
            borderRadius: '20px',
            boxShadow: '0 32px 80px rgba(0,0,0,.6)',
            width: '100%', maxWidth: '400px',
            padding: '32px 28px 24px',
            position: 'relative', overflow: 'hidden',
    }}>

    {/* Glow blob */}
    <div style={{
        position: 'absolute', top: '-60px', left: '50%',
            transform: 'translateX(-50%)',
            width: '220px', height: '220px', borderRadius: '50%',
            background: `${accent}14`, filter: 'blur(50px)',
            pointerEvents: 'none', transition: 'background .3s',
    }} />

    {/* Header row */}
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
    {/* Icon */}
    <div style={{
        width: 48, height: 48, borderRadius: 12,
            background: 'rgba(59,130,246,.12)',
            border: '1px solid rgba(59,130,246,.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L12 10 4.8 8.2c-.6-.2-1.2.2-1.4.8l-.1.3c-.2.6.1 1.2.7 1.4l4.5 1.5L6 14l-2 1 .7 1.3L7 15.3l1.5 2.5 1.3.7L11 16l1.5 4.5c.2.6.8.9 1.4.7l.3-.1c.6-.2 1-.8.8-1.4z"/>
        </svg>
        </div>

    {/* Ring + number */}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Ring value={countdown} max={COUNTDOWN} />
    <span style={{
        position: 'absolute',
            fontSize: 15, fontWeight: 700,
            color: accent, transition: 'color .3s',
            transform: 'rotate(90deg)',
    }}>
    {countdown}
    </span>
    </div>
    </div>

    {/* Text */}
    <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-.3px' }}>
    Вы ещё здесь?
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
    Сессия неактивна. Подтвердите присутствие — иначе вы будете выйдети из системы через{' '}
    <span style={{ color: accent, fontWeight: 600, transition: 'color .3s' }}>
    {countdown} сек
    </span>.
    </p>

    {/* Progress bar */}
    <div style={{ height: 3, borderRadius: 2, background: '#1e293b', marginBottom: 20, overflow: 'hidden' }}>
    <div style={{
        height: '100%', borderRadius: 2,
            width: `${(countdown / COUNTDOWN) * 100}%`,
            background: accent,
            transition: 'width .95s linear, background .3s',
    }} />
    </div>

    {/* Buttons */}
    <div style={{ display: 'flex', gap: 10 }}>
    <button
        onClick={onLogout}
    style={{
        flex: 1, padding: '11px 14px', borderRadius: 10,
            border: '1px solid rgba(148,163,184,.15)',
            background: 'rgba(148,163,184,.06)',
            color: '#94a3b8', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', transition: 'all .15s',
    }}
    onMouseEnter={e => {
        const b = e.currentTarget;
        b.style.background = 'rgba(239,68,68,.1)';
        b.style.color = '#ef4444';
        b.style.borderColor = 'rgba(239,68,68,.3)';
    }}
    onMouseLeave={e => {
        const b = e.currentTarget;
        b.style.background = 'rgba(148,163,184,.06)';
        b.style.color = '#94a3b8';
        b.style.borderColor = 'rgba(148,163,184,.15)';
    }}
>
    Выйти
    </button>

    <button
    onClick={onStillHere}
    style={{
        flex: 2, padding: '11px 20px', borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(59,130,246,.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .15s',
    }}
    onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,.45)';
    }}
    onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,.35)';
    }}
>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
        </svg>
    Да, я здесь
    </button>
    </div>
    </div>
    </div>

    <style>{`
        @keyframes sid-fade { from{opacity:0} to{opacity:1} }
        @keyframes sid-up   { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </>
);
}

// ─── Главный провайдер ──────────────────────────────────────────────────────
export function SessionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, clearAuth, setAuth, initFromStorage } = useAuthStore();

    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN);

    const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── helpers ──
    const stopAll = useCallback(() => {
        if (idleRef.current) clearTimeout(idleRef.current);
        if (tickRef.current) clearInterval(tickRef.current);
    }, []);

    const doLogout = useCallback(() => {
        stopAll();
        setShowModal(false);
        clearAuth();
        router.push('/login');
    }, [clearAuth, router, stopAll]);

    const startCountdown = useCallback(() => {
        setCountdown(COUNTDOWN);
        setShowModal(true);
        tickRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { doLogout(); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, [doLogout]);

    const resetIdle = useCallback(() => {
        if (!isAuthenticated || showModal) return;
        stopAll();
        idleRef.current = setTimeout(startCountdown, IDLE_MS);
    }, [isAuthenticated, showModal, stopAll, startCountdown]);

    // ── "Да, я здесь" — тихий рефреш токена ──
    const handleStillHere = useCallback(async () => {
        stopAll();
        setShowModal(false);

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) { doLogout(); return; }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
                { method: 'GET', headers: { refreshTokenAuth: refreshToken } }
            );

            if (!res.ok) throw new Error('refresh failed');

            const data = await res.json();

            // Парсим user из нового токена
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            setAuth(
                {
                    id: payload.id || payload.userId,
                    email: payload.email || payload.sub,
                    role: payload.role || payload.roles?.[0] || 'ROLE_USER',
                },
                data.accessToken,
                data.refreshToken
            );

            // Перезапускаем таймер бездействия
            idleRef.current = setTimeout(startCountdown, IDLE_MS);
        } catch {
            doLogout();
        }
    }, [doLogout, setAuth, startCountdown, stopAll]);

    // ── Инициализация при загрузке страницы ──
    useEffect(() => {
        initFromStorage();
    }, [initFromStorage]);

    // ── Слушаем событие logout от axiosInstance (401 + refresh fail) ──
    useEffect(() => {
        const onLogout = () => doLogout();
        const onRefreshed = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            const payload = JSON.parse(atob(detail.accessToken.split('.')[1]));
            setAuth(
                {
                    id: payload.id || payload.userId,
                    email: payload.email || payload.sub,
                    role: payload.role || payload.roles?.[0] || 'ROLE_USER',
                },
                detail.accessToken,
                detail.refreshToken
            );
        };

        window.addEventListener('auth-logout', onLogout);
        window.addEventListener('token-refreshed', onRefreshed);
        return () => {
            window.removeEventListener('auth-logout', onLogout);
            window.removeEventListener('token-refreshed', onRefreshed);
        };
    }, [doLogout, setAuth]);

    // ── Трекинг активности ──
    useEffect(() => {
        if (!isAuthenticated) { stopAll(); return; }

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
        resetIdle(); // запускаем сразу

        return () => {
            events.forEach((e) => window.removeEventListener(e, resetIdle));
            stopAll();
        };
    }, [isAuthenticated, resetIdle, stopAll]);

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
