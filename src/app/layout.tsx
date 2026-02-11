import { QueryProvider } from '@/providers/QueryProvider';
import { SessionProvider } from '@/components/session/SessionProvider';

import './globals.css';

export const metadata = {
    title: 'Aviasales - Flight Booking',
    description: 'Book flights worldwide',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <QueryProvider>
            {/*
            SessionProvider:
            - восстанавливает сессию после перезагрузки
            - следит за бездействием (10 мин → диалог)
            - рефрешит токен по кнопке "Да, я здесь"
            - слушает auth-logout от axiosInstance
          */}
            <SessionProvider>
                {children}
            </SessionProvider>
        </QueryProvider>
        </body>
        </html>
    );
}
