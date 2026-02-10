import { QueryProvider } from '@/providers/QueryProvider';
import './globals.css'; // Добавьте импорт CSS!

export const metadata = {
    title: 'Aviasales - Flight Booking',
    description: 'Book flights worldwide',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <QueryProvider>
            {children}
        </QueryProvider>
        </body>
        </html>
    );
}
