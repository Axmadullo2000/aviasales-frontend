'use client';

import {ChevronDown, ChevronUp, Plane, Tag, Users} from 'lucide-react';
import {useState} from 'react';
import {Badge, Card} from '@/components/ui';
import {calculateDuration, formatDate, formatPrice, formatTime} from '@/lib/utils/Format';
import type {BookingDetailResponse} from '@/types';

interface BookingDetailSummaryProps {
    booking: BookingDetailResponse;
}

export function BookingDetailSummary({ booking }: BookingDetailSummaryProps) {
    const [showPassengers, setShowPassengers] = useState(false);

    // Получаем данные рейса из первого билета (все билеты одного бронирования — один рейс)
    const firstTicket = booking.tickets?.[0];
    const flight = firstTicket?.flight;

    return (
        <div className="space-y-4 sticky top-6">
            {/* Детали рейса */}
            <Card className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-600" />
                    Детали рейса
                </h3>

                {flight ? (
                    <>
                        {/* Маршрут */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{formatTime(flight.departureTime)}</div>
                                <div className="text-sm font-semibold text-blue-600">{flight.origin?.iataCode}</div>
                                <div className="text-xs text-gray-500">{flight.origin?.city}</div>
                            </div>
                            <div className="flex-1 mx-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">
                                    {calculateDuration(flight.departureTime, flight.arrivalTime)}
                                </div>
                                <div className="flex items-center">
                                    <div className="flex-1 h-px bg-gray-300" />
                                    <Plane className="w-3 h-3 text-gray-400 mx-1" />
                                    <div className="flex-1 h-px bg-gray-300" />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Прямой</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</div>
                                <div className="text-sm font-semibold text-blue-600">{flight.destination?.iataCode}</div>
                                <div className="text-xs text-gray-500">{flight.destination?.city}</div>
                            </div>
                        </div>

                        {/* Инфо о рейсе */}
                        <div className="space-y-2 text-sm border-t pt-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Рейс</span>
                                <span className="font-medium">{flight.flightNumber}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Авиакомпания</span>
                                <span className="font-medium">{flight.airline?.name}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Дата</span>
                                <span className="font-medium">{formatDate(flight.departureTime, 'EEE, dd MMM')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Класс</span>
                                <span className="font-medium capitalize">
                  {firstTicket?.cabinClass?.replace('_', ' ').toLowerCase() ?? '—'}
                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    // Фоллбэк если нет данных о рейсе (из-за структуры API)
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Бронирование</span>
                            <span className="font-medium">{booking.bookingReference}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Пассажиров</span>
                            <span className="font-medium">{booking.totalPassengers}</span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Пассажиры */}
            {booking.tickets && booking.tickets.length > 0 && (
                <Card className="p-5">
                    <button
                        className="w-full flex items-center justify-between text-left"
                        onClick={() => setShowPassengers(!showPassengers)}
                    >
                        <h3 className="font-bold flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Пассажиры ({booking.tickets.length})
                        </h3>
                        {showPassengers ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {showPassengers && (
                        <div className="mt-3 space-y-2 border-t pt-3">
                            {booking.tickets.map((ticket, i) => (
                                <div key={ticket.id ?? i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {ticket.passenger?.firstName} {ticket.passenger?.lastName}
                  </span>
                                    <Badge variant="info" size="sm">
                                        {ticket.seatNumber ?? `Место ${i + 1}`}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Итоговая сумма */}
            <Card className="p-5 bg-blue-50 border-blue-200">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Итого к оплате
                </h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Билеты ({booking.totalPassengers} пасс.)</span>
                        <span>{formatPrice(booking.totalAmount)}</span>
                    </div>
                    {booking.amountDue !== booking.totalAmount && booking.amountDue > 0 && (
                        <div className="flex justify-between text-orange-600">
                            <span>К доплате</span>
                            <span>{formatPrice(booking.amountDue)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                        <span>Сборы и налоги</span>
                        <span>Включены</span>
                    </div>
                </div>

                <div className="border-t border-blue-300 mt-3 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Итого</span>
                    <span className="text-2xl font-bold text-blue-700">
            {formatPrice(booking.amountDue > 0 ? booking.amountDue : booking.totalAmount)}
          </span>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                    Оплата в USD. Конвертация по курсу вашего банка.
                </p>
            </Card>
        </div>
    );
}
