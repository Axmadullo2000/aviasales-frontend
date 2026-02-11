import {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/lib/store/AuthStore';
import {api} from '@/lib/api';
import {IDLE_TIMEOUT_MS} from "@/lib/hooks/IDLE_TIMEOUT_MS";

// Give user 60 seconds to respond before auto-logout
const COUNTDOWN_SECONDS = 60;

export function UseSessionActivity() {
    const router = useRouter();
    const { isAuthenticated, clearAuth, setAuth } = useAuthStore();

    const [showPrompt, setShowPrompt] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimers = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }, []);

    const handleLogout = useCallback(() => {
        clearTimers();
        setShowPrompt(false);
        clearAuth();
        router.push('/login');
    }, [clearAuth, clearTimers, router]);

    const startCountdown = useCallback(() => {
        setCountdown(COUNTDOWN_SECONDS);
        setShowPrompt(true);

        countdownTimerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [handleLogout]);

    const resetIdleTimer = useCallback(() => {
        if (!isAuthenticated) return;
        clearTimers();

        idleTimerRef.current = setTimeout(() => {
            startCountdown();
        }, IDLE_TIMEOUT_MS);
    }, [isAuthenticated, clearTimers, startCountdown]);

    // User confirms they're still here — refresh token
    const handleStillHere = useCallback(async () => {
        clearTimers();
        setShowPrompt(false);

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                handleLogout();
                return;
            }
            const response = await api.auth.refreshToken(refreshToken);
            const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]));
            setAuth(
                {
                    id: tokenPayload.id || tokenPayload.userId,
                    email: tokenPayload.email || tokenPayload.sub,
                    role: tokenPayload.role || tokenPayload.roles?.[0] || 'ROLE_USER',
                },
                response.accessToken,
                response.refreshToken
            );
            resetIdleTimer();
        } catch {
            handleLogout();
        }
    }, [clearTimers, handleLogout, resetIdleTimer, setAuth]);

    // Attach activity listeners
    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

        const onActivity = () => {
            if (!showPrompt) resetIdleTimer();
        };

        events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
        resetIdleTimer();

        return () => {
            events.forEach((e) => window.removeEventListener(e, onActivity));
            clearTimers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    return { showPrompt, countdown, handleStillHere, handleLogout };
}
