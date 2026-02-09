import Link from 'next/link';
import { ROUTES } from '@/lib/config/routes';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">About Aviasales</h3>
                        <p className="text-sm text-gray-400">
                            Your trusted platform for booking flights worldwide. Fast, secure, and easy.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href={ROUTES.HOME} className="hover:text-white transition">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href={ROUTES.SEARCH} className="hover:text-white transition">
                                    Search Flights
                                </Link>
                            </li>
                            <li>
                                <Link href={ROUTES.MY_BOOKINGS} className="hover:text-white transition">
                                    My Bookings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    FAQs
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm">
                            <li>✉️ support@aviasales.uz</li>
                            <li>📞 +998 99 749 4262</li>
                            <li>📍 Tashkent, Uzbekistan</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
                    <p>© {currentYear} Aviasales. All rights reserved.</p>
                    <p className="mt-2">
                        Built with ❤️ by{' '}
                        <a
                            href="https://github.com/Axmadullo2000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition"
                        >
                            Axmadullo Ubaydullayev
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
