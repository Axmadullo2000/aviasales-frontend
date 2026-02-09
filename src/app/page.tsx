'use client';

import {Card} from '@/components/ui';
import {SearchForm} from '@/components/features/search/SearchForm';
import {usePopularDestinations} from '@/lib/hooks';

export default function HomePage() {
  const {
    data: destinations,
    isLoading,
    isError,
  } = usePopularDestinations(4);

// пока данные не пришли
  if (isLoading) return <div>Loading...</div>;

// если ошибка
  if (isError) return <div>Failed to load destinations</div>;

// теперь destinations точно массив или undefined
  const popularDestinations = destinations || [];

  return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Find Your Perfect Flight
              </h1>
              <p className="text-xl text-blue-100">
                Search, compare and book flights to destinations worldwide
              </p>
            </div>

            <SearchForm />
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Aviasales?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* cards */}
          </div>
        </div>

        {/* Popular Destinations */}

        {popularDestinations.length > 0 && (
            <div className="bg-gray-50 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">Popular Destinations</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {popularDestinations.map((dest) => (
                      <Card key={dest.airport.id} hover padding="md" className="text-center">
                        <div className="text-4xl mb-2">✈️</div>
                        <h3 className="font-semibold text-lg">{dest.airport.city}</h3>
                        <p className="text-gray-500 text-sm mb-2">{dest.airport.iataCode}</p>
                        <p className="text-blue-600 font-bold">
                          from ${dest.minPrice.toFixed(0)}
                        </p>
                      </Card>
                  ))}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
