'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plane, Calendar, Users, Search } from 'lucide-react';
import { Button, Input, Select, Card } from '@/components/ui';
import { flightSearchSchema, type FlightSearchFormData } from '@/lib/utils/Validation';
import { CabinClass } from '@/types';
import { useBookingStore } from '@/lib/store';


export const SearchForm: React.FC = () => {
    const router = useRouter();
    const setSearchParams = useBookingStore((state) => state.setSearchParams);
    const [isSearching, setIsSearching] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FlightSearchFormData>({
        resolver: zodResolver(flightSearchSchema),
        defaultValues: {
            passengers: 1,
            cabinClass: CabinClass.ECONOMY,
        },
    });

    const onSubmit = async (data: FlightSearchFormData) => {
        setIsSearching(true);

        // Save search params to store
        setSearchParams({
            from: data.from,
            to: data.to,
            date: data.departureDate,
            passengers: data.passengers,
            cabinClass: data.cabinClass,
        });

        // Navigate to search results
        const params = new URLSearchParams({
            from: data.from,
            to: data.to,
            date: data.departureDate,
            passengers: data.passengers.toString(),
            cabinClass: data.cabinClass,
        });

        router.push(`/search?${params.toString()}`);
    };

    return (
        <Card className="max-w-4xl mx-auto" padding="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* From/To Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        {...register('from')}
                        label="From"
                        placeholder="e.g., TAS, DME, DXB"
                        error={errors.from?.message}
                        leftIcon={<Plane className="w-5 h-5 text-gray-400" />}
                        maxLength={3}
                        className="uppercase"
                    />
                    <Input
                        {...register('to')}
                        label="To"
                        placeholder="e.g., TAS, DME, DXB"
                        error={errors.to?.message}
                        leftIcon={<Plane className="w-5 h-5 text-gray-400 rotate-90" />}
                        maxLength={3}
                        className="uppercase"
                    />
                </div>

                {/* Date/Passengers Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        {...register('departureDate')}
                        type="date"
                        label="Departure Date"
                        error={errors.departureDate?.message}
                        leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                        {...register('passengers', { valueAsNumber: true })}
                        type="number"
                        label="Passengers"
                        error={errors.passengers?.message}
                        leftIcon={<Users className="w-5 h-5 text-gray-400" />}
                        min={1}
                        max={9}
                    />
                    <Select
                        {...register('cabinClass')}
                        label="Class"
                        error={errors.cabinClass?.message}
                        options={[
                            { value: CabinClass.ECONOMY, label: 'Economy' },
                            { value: CabinClass.BUSINESS, label: 'Business' },
                            { value: CabinClass.FIRST_CLASS, label: 'First Class' },
                        ]}
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={isSearching}
                    leftIcon={<Search className="w-5 h-5" />}
                >
                    Search Flights
                </Button>
            </form>
        </Card>
    );
};
