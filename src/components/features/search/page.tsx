'use client';

import { use, Suspense } from 'react';
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

    const params = {
        originCode: searchParams.get('from') || '',
        destinationCode: searchParams.get('to') || '',
        departureDate: searchParams.get('date') || '',
        passengers: parseInt(searchParams.get('passengers') || '1'),
        cabinClass: (searchParams.get('cabinClass') as CabinClass) || CabinClass.ECONOMY,
    };

    const { data, isLoading, error } = useFlightSearch(params);

    const handleSelectFlight = (flight: FlightResponse) => {
        setSelectedFlight(flight);
        router.push('/booking');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading flights. Please try again.</p>
            </div>
        );
    }

    if (!data || data.content.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No flights found. Try different search criteria.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Summary */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {params.originCode} → {params.destinationCode}
                </h1>
                <p className="text-gray-600">
                    {data.totalElements} flights found • {params.passengers} passenger(s) • {params.cabinClass}
                </p>
            </div>

            {/* Flight List */}
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
        <Suspense fallback={<Spinner size="lg" />}>
            <SearchResults />
        </Suspense>
    );
}