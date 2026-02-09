'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plane, Calendar, Users, Search } from 'lucide-react';
import { Button, Input, Select, Card } from '../components/ui/';
import { flightSearchSchema, type FlightSearchFormData } from '../lib/utils/Validation';
import { CabinClass } from '../types';
import { useBookingStore } from '../lib/store/BookingStore';

export default function HomePage() {
  const router = useRouter();
  const setSearchParams = useBookingStore((state: { setSearchParams: any; }) => state.setSearchParams);
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                ✈️ Find Your Perfect Flight
              </h1>
              <p className="text-xl text-blue-100">
                Search, compare and book flights to destinations worldwide
              </p>
            </div>

            {/* Search Form */}
            <Card className="max-w-4xl mx-auto bg-white text-gray-900" padding="lg">
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
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Aviasales?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
                <p className="text-gray-600">
                  Find the best flights with our advanced search filters
                </p>
              </div>
            </Card>

            <Card hover padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                <p className="text-gray-600">
                  Support for UzCard, Humo, Visa, and other payment methods
                </p>
              </div>
            </Card>

            <Card hover padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎫</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Tickets</h3>
                <p className="text-gray-600">
                  Get your e-tickets immediately after booking
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Popular Destinations
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { city: 'Moscow', code: 'DME', price: '$268' },
                { city: 'Dubai', code: 'DXB', price: '$450' },
                { city: 'Istanbul', code: 'IST', price: '$320' },
                { city: 'Delhi', code: 'DEL', price: '$180' },
              ].map((dest) => (
                  <Card key={dest.code} hover padding="md" className="text-center">
                    <div className="text-4xl mb-2">✈️</div>
                    <h3 className="font-semibold text-lg">{dest.city}</h3>
                    <p className="text-gray-500 text-sm mb-2">{dest.code}</p>
                    <p className="text-blue-600 font-bold">from {dest.price}</p>
                  </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}