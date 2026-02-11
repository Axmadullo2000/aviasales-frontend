'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { FlightCard } from '@/components/features/flights/FlightCard';
import { useFlightSearch } from '@/lib/hooks';
import { useBookingStore } from '@/lib/store';
import { CabinClass } from '@/types';
import type { FlightResponse } from '@/types';

function SearchResults() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setSelectedFlight = useBookingStore((state) => state.setSelectedFlight);

    // Считываем параметры с проверки на корректность для cabinClass
    const originCode = searchParams.get('from') || '';
    const destinationCode = searchParams.get('to') || '';
    const departureDate = searchParams.get('date') || '';
    const passengers = parseInt(searchParams.get('passengers') || '1');

    // Проверяем и приводим cabinClass к типу CabinClass
    const cabinClassParam = searchParams.get('cabinClass');
    const cabinClass: CabinClass =
        cabinClassParam === 'BUSINESS' || cabinClassParam === 'FIRST_CLASS' || cabinClassParam === 'ECONOMY'
            ? cabinClassParam
            : "ECONOMY";

    const params = {
        originCode,
        destinationCode,
        departureDate,
        passengers,
        cabinClass,
    };

    const { data, isLoading, error } = useFlightSearch(params);

    const handleSelectFlight = (flight: FlightResponse) => {
        setSelectedFlight(flight);
        router.push('/booking');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-16 bg-white rounded-xl p-8 text-center shadow">
                <p className="text-red-600 font-medium">
                    Error loading flights. Please try again.
                </p>
            </div>
        );
    }

    if (!data || data.content.length === 0) {
        return (
            <div className="max-w-4xl mx-auto mt-16 bg-white rounded-xl p-8 text-center shadow">
                <p className="text-gray-600">
                    No flights found. Try different search criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Summary */}
            <div className="mb-6 bg-white rounded-xl p-6 shadow-sm border">
                <h1 className="text-2xl font-bold text-gray-900">
                    {params.originCode} → {params.destinationCode}
                </h1>
                <p className="text-gray-600 mt-1">
                    {data.totalElements} flights • {params.passengers} passenger(s) • {params.cabinClass}
                </p>
            </div>

            {/* List */}
            <div className="space-y-4">
                {data.content.map((flight) => (
                    <FlightCard
                        key={flight.id}
                        flight={flight}
                        onSelect={handleSelectFlight}
                        cabinClass={params.cabinClass}
                    />
                ))}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center min-h-screen">
                    <Spinner size="lg" />
                </div>
            }
        >
            <SearchResults />
        </Suspense>
    );
}
