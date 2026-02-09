import React from 'react';
import { Plane, Clock, Calendar } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { formatTime, formatDate, formatPrice, calculateDuration } from '@/lib/utils/Format';
import type { FlightResponse } from '@/types';


interface FlightCardProps {
    flight: FlightResponse;
    onSelect?: (flight: FlightResponse) => void;
    showPrice?: boolean;
    cabinClass?: 'ECONOMY' | 'BUSINESS' | 'FIRST_CLASS';
}

export const FlightCard: React.FC<FlightCardProps> = ({
                                                          flight,
                                                          onSelect,
                                                          showPrice = true,
                                                          cabinClass = 'ECONOMY',
                                                      }) => {
    const price =
        cabinClass === 'BUSINESS'
            ? flight.businessPrice
            : cabinClass === 'FIRST_CLASS'
                ? flight.firstClassPrice
                : flight.economyPrice;

    const duration = calculateDuration(flight.departureTime, flight.arrivalTime);

    return (
        <Card className="hover:shadow-md transition-shadow" padding="md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Flight Info */}
                <div className="flex-1">
                    {/* Airline */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{flight.airline.name}</div>
                            <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                        </div>
                        <Badge variant="info" size="sm">
                            {flight.aircraftType || 'Boeing 737'}
                        </Badge>
                    </div>

                    {/* Route & Time */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                        {/* Departure */}
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {formatTime(flight.departureTime)}
                            </div>
                            <div className="text-sm text-gray-600">{flight.origin.iataCode}</div>
                            <div className="text-xs text-gray-500">{flight.origin.city}</div>
                        </div>

                        {/* Duration */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                                <div className="h-px flex-1 bg-gray-300" />
                                <Clock className="w-4 h-4 text-gray-400 mx-2" />
                                <div className="h-px flex-1 bg-gray-300" />
                            </div>
                            <div className="text-sm font-medium text-gray-600">{duration}</div>
                            <div className="text-xs text-gray-500">Direct</div>
                        </div>

                        {/* Arrival */}
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                {formatTime(flight.arrivalTime)}
                            </div>
                            <div className="text-sm text-gray-600">{flight.destination.iataCode}</div>
                            <div className="text-xs text-gray-500">{flight.destination.city}</div>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(flight.departureTime, 'EEE, MMM dd')}</span>
                    </div>
                </div>

                {/* Price & Action */}
                {showPrice && price && (
                    <div className="flex flex-col items-end gap-2 md:border-l md:pl-6">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">From</div>
                            <div className="text-3xl font-bold text-blue-600">{formatPrice(price)}</div>
                            <div className="text-xs text-gray-500">{flight.availableSeats} seats left</div>
                        </div>
                        {onSelect && (
                            <Button onClick={() => onSelect(flight)} size="lg" className="w-full md:w-auto">
                                Select Flight
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
