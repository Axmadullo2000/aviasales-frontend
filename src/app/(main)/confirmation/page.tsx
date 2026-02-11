'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, Home, Calendar, Plane, Users } from 'lucide-react';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { useBookingDetail, useDownloadTicket } from '@/lib/hooks';
import { formatPrice, formatDate, formatTime, calculateDuration } from '@/lib/utils/Format';

function ConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingRef = searchParams.get('ref');

    const { data: booking, isLoading, error } = useBookingDetail(bookingRef ?? undefined);
    const { mutate: downloadTicket, isPending: isDownloading } = useDownloadTicket(bookingRef ?? '');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <p className="text-red-600 font-medium mb-4">Не удалось загрузить подтверждение.</p>
                <Button onClick={() => router.push('/my-bookings')}>Мои бронирования</Button>
            </div>
        );
    }

    const firstTicket = booking.tickets?.[0];
    const flight = firstTicket?.flight;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">

                {/* Успех */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Оплата прошла успешно!</h1>
                    <p className="text-gray-600">
                        Ваш билет забронирован. Номер бронирования:
                    </p>
                    <div className="mt-2 inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-xl font-bold text-blue-700 font-mono tracking-widest">
              {booking.bookingReference}
            </span>
                    </div>
                </div>

                {/* Детали рейса */}
                {flight && (
                    <Card className="p-6 mb-4">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Plane className="w-5 h-5 text-blue-600" />
                            Детали рейса
                        </h2>

                        <div className="flex items-center justify-between mb-5">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{formatTime(flight.departureTime)}</div>
                                <div className="font-semibold text-blue-600 text-lg">{flight.origin?.iataCode}</div>
                                <div className="text-sm text-gray-500">{flight.origin?.city}</div>
                            </div>
                            <div className="flex-1 mx-4 text-center">
                                <div className="text-sm text-gray-500 mb-1">
                                    {calculateDuration(flight.departureTime, flight.arrivalTime)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex-1 h-px bg-gray-300" />
                                    <Plane className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1 h-px bg-gray-300" />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Прямой рейс</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{formatTime(flight.arrivalTime)}</div>
                                <div className="font-semibold text-blue-600 text-lg">{flight.destination?.iataCode}</div>
                                <div className="text-sm text-gray-500">{flight.destination?.city}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {formatDate(flight.departureTime, 'EEE, dd MMM yyyy')}
                            </div>
                            <div className="text-gray-600">
                                Рейс: <span className="font-medium">{flight.flightNumber}</span>
                            </div>
                            <div className="text-gray-600">
                                Авиакомпания: <span className="font-medium">{flight.airline?.name}</span>
                            </div>
                            <div className="text-gray-600">
                                Класс: <span className="font-medium capitalize">
                  {firstTicket?.cabinClass?.replace('_', ' ').toLowerCase() ?? '—'}
                </span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Пассажиры */}
                {booking.tickets && booking.tickets.length > 0 && (
                    <Card className="p-6 mb-4">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Пассажиры
                        </h2>
                        <div className="space-y-3">
                            {booking.tickets.map((ticket, i) => (
                                <div key={ticket.id ?? i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">
                    {ticket.passenger?.firstName} {ticket.passenger?.lastName}
                  </span>
                                    <div className="flex items-center gap-2">
                                        {ticket.seatNumber && (
                                            <Badge variant="info" size="sm">Место {ticket.seatNumber}</Badge>
                                        )}
                                        <Badge variant="success" size="sm">Подтверждён</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Итог оплаты */}
                <Card className="p-6 mb-6 bg-green-50 border-green-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-sm text-gray-600">Оплачено</div>
                            <div className="text-3xl font-bold text-green-700">
                                {formatPrice(booking.totalAmount)}
                            </div>
                        </div>
                        <Badge variant="success">Оплачено</Badge>
                    </div>
                </Card>

                {/* Кнопки действий */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        size="lg"
                        className="flex-1"
                        isLoading={isDownloading}
                        onClick={() => downloadTicket()}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Скачать билет (PDF)
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push('/my-bookings')}
                    >
                        Мои бронирования
                    </Button>
                    <Button
                        size="lg"
                        variant="ghost"
                        onClick={() => router.push('/')}
                    >
                        <Home className="w-5 h-5" />
                    </Button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Подтверждение и билет отправлены на ваш email.
                </p>
            </div>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <>
            <Header />
            <Suspense
                fallback={
                    <div className="flex justify-center items-center min-h-screen">
                        <Spinner size="lg" />
                    </div>
                }
            >
                <ConfirmationContent />
            </Suspense>
        </>
    );
}