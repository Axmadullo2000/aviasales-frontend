'use client';

import { UseSessionActivity } from '@/lib/hooks/UseSessionActivity';

// Circular progress ring component
function CountdownRing({ value, max }: { value: number; max: number }) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / max) * circumference;

    const color =
        value > 30 ? '#3b82f6' : value > 10 ? '#f59e0b' : '#ef4444';

    return (
        <svg width="72" height="72" className="rotate-[-90deg]">
            {/* Background track */}
            <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth="4"
            />
            {/* Progress arc */}
            <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
            />
        </svg>
    );
}

export function SessionPrompt() {
    const { showPrompt, countdown, handleStillHere, handleLogout } = UseSessionActivity();

    if (!showPrompt) return null;

    const MAX = 60;
    const isUrgent = countdown <= 10;
    const isMid = countdown <= 30 && countdown > 10;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9999]"
                style={{
                    background: 'rgba(2, 8, 23, 0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.2s ease',
                }}
            />

            {/* Dialog */}
            <div
                className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
                style={{ animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        borderRadius: '20px',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                        width: '100%',
                        maxWidth: '400px',
                        padding: '36px 32px 28px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Subtle glow behind */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: isUrgent
                                ? 'rgba(239, 68, 68, 0.08)'
                                : isMid
                                    ? 'rgba(245, 158, 11, 0.08)'
                                    : 'rgba(59, 130, 246, 0.08)',
                            filter: 'blur(40px)',
                            transition: 'background 0.3s ease',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Header: icon + timer */}
                    <div className="flex items-start justify-between mb-6">
                        {/* Left: plane icon */}
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#60a5fa"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L12 10 4.8 8.2c-.6-.2-1.2.2-1.4.8l-.1.3c-.2.6.1 1.2.7 1.4l4.5 1.5L6 14l-2 1 .7 1.3L7 15.3l1.5 2.5 1.3.7L11 16l1.5 4.5c.2.6.8.9 1.4.7l.3-.1c.6-.2 1-.8.8-1.4z" />
                            </svg>
                        </div>

                        {/* Right: countdown ring */}
                        <div className="relative flex items-center justify-center">
                            <CountdownRing value={countdown} max={MAX} />
                            <span
                                style={{
                                    position: 'absolute',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: isUrgent ? '#ef4444' : isMid ? '#f59e0b' : '#e2e8f0',
                                    transition: 'color 0.3s ease',
                                    transform: 'rotate(90deg)',
                                }}
                            >
                {countdown}
              </span>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="mb-7">
                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#f1f5f9',
                                marginBottom: '8px',
                                letterSpacing: '-0.3px',
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            Вы ещё здесь?
                        </h2>
                        <p
                            style={{
                                fontSize: '14px',
                                color: '#94a3b8',
                                lineHeight: '1.6',
                            }}
                        >
                            Сессия неактивна некоторое время. Подтвердите присутствие — иначе вы будете
                            автоматически выйдете из системы через{' '}
                            <span
                                style={{
                                    color: isUrgent ? '#ef4444' : isMid ? '#f59e0b' : '#60a5fa',
                                    fontWeight: '600',
                                    transition: 'color 0.3s ease',
                                }}
                            >
                {countdown} сек
              </span>
                            .
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div
                        style={{
                            height: '3px',
                            borderRadius: '2px',
                            background: '#1e293b',
                            marginBottom: '20px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                borderRadius: '2px',
                                width: `${(countdown / MAX) * 100}%`,
                                background: isUrgent
                                    ? '#ef4444'
                                    : isMid
                                        ? '#f59e0b'
                                        : '#3b82f6',
                                transition: 'width 0.9s linear, background 0.3s ease',
                            }}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {/* Logout — secondary */}
                        <button
                            onClick={handleLogout}
                            style={{
                                flex: '1',
                                padding: '11px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(148, 163, 184, 0.15)',
                                background: 'rgba(148, 163, 184, 0.06)',
                                color: '#94a3b8',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
                                (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(148,163,184,0.06)';
                                (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(148,163,184,0.15)';
                            }}
                        >
                            Выйти
                        </button>

                        {/* Still here — primary */}
                        <button
                            onClick={handleStillHere}
                            style={{
                                flex: '2',
                                padding: '11px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(59,130,246,0.45)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(59,130,246,0.35)';
                            }}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Да, я здесь
                        </button>
                    </div>
                </div>
            </div>

            {/* Keyframes injected once */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
        </>
    );
}
