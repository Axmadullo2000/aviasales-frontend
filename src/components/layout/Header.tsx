'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plane, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/config/routes';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        router.push(ROUTES.LOGIN);
    };

    const navigation = [
        { name: 'Home', href: ROUTES.HOME },
        { name: 'My Bookings', href: ROUTES.MY_BOOKINGS, protected: true },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={ROUTES.HOME} className="flex items-center gap-2">
                        <Plane className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">
              Aviasales
            </span>
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        {navigation.map((item) => {
                            if (item.protected && !isAuthenticated) return null;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'text-sm font-medium',
                                        pathname === item.href
                                            ? 'text-blue-600'
                                            : 'text-gray-700 hover:text-blue-600'
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User className="w-5 h-5" />
                                    <span className="text-sm">{user?.email}</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.LOGIN)}>
                                    Login
                                </Button>
                                <Button size="sm" onClick={() => router.push(ROUTES.REGISTER)}>
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>
        </header>
    );
}
