'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plane, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../lib/store/authStore';
import { cn } from '../../lib/utils/format';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'My Bookings', href: '/my-bookings', protected: true },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Plane className="w-8 h-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">Aviasales</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {navigation.map((item) => {
                            if (item.protected && !isAuthenticated) return null;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'text-sm font-medium transition-colors',
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
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm text-gray-700">{user?.email}</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/login')}
                                >
                                    Login
                                </Button>
                                <Button size="sm" onClick={() => router.push('/register')}>
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-3 border-t">
                        {navigation.map((item) => {
                            if (item.protected && !isAuthenticated) return null;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'block px-3 py-2 rounded-md text-base font-medium',
                                        pathname === item.href
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}

                        <div className="pt-4 border-t space-y-3">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-gray-700">
                                        {user?.email}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            router.push('/login');
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            router.push('/register');
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
