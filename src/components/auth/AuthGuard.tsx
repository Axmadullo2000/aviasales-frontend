'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/AuthStore';
import { Spinner } from '@/components/ui/Spinner';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        // Not authenticated + trying to access protected route → go to login
        if (!isAuthenticated && !isPublicRoute) {
            router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        }

        // Already authenticated + trying to access login/register → go home
        if (isAuthenticated && isPublicRoute) {
            router.replace('/');
        }
    }, [isAuthenticated, isPublicRoute, pathname, router]);

    // Show spinner while redirecting away from protected route
    if (!isAuthenticated && !isPublicRoute) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" />
            </div>
        );
    }

    return <>{children}</>;
}
