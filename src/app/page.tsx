'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { Plane } from 'lucide-react';
import {Footer} from "@/components/layout/Footer";
import {SearchForm} from "@/components/features/search";
import {Header} from "@/components/layout/Header";
import {usePopularDestinations} from "@/lib/hooks";

export default function HomePage() {
  const router = useRouter();
  const { data: destinations, isLoading } = usePopularDestinations(5);
  const popularDestinations = destinations || [];

  // Эмодзи флагов по странам
  const countryFlags: Record<string, string> = {
    'Узбекистан': '🇺🇿',
    'ОАЭ': '🇦🇪',
    'Россия': '🇷🇺',
    'Турция': '🇹🇷',
    'США': '🇺🇸',
    'Германия': '🇩🇪',
    'Франция': '🇫🇷',
  };

  const handleDestinationClick = (dest: any) => {
    // Формируем параметры для поиска
    const params = new URLSearchParams({
      from: dest.iataCode,
      to: dest.iataCode, // замените на правильное значение для 'to', если нужно
      date: new Date().toISOString().split('T')[0], // сегодняшняя дата, можно изменить
    });

    // Перенаправление на страницу с результатами поиска
    router.push(`/search?${params.toString()}`);
  };

  return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
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

          {/* Popular Destinations */}
          {!isLoading && popularDestinations.length > 0 && (
              <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Popular Destinations
                    </h2>
                    <p className="text-gray-600">
                      Explore our most popular flight routes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {popularDestinations.map((dest) => (
                        <Card
                            key={dest.iataCode}
                            hover
                            padding="lg"
                            className="text-center cursor-pointer transform transition-transform hover:scale-105"
                            onClick={() => handleDestinationClick(dest)} // Обработчик клика
                        >
                          {/* Flag */}
                          <div className="text-5xl mb-3">
                            {countryFlags[dest.country] || '✈️'}
                          </div>

                          {/* City */}
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {dest.city}
                          </h3>

                          {/* IATA Code */}
                          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-2">
                            {dest.iataCode}
                          </div>

                          {/* Country */}
                          <p className="text-gray-600 text-sm mb-3">
                            {dest.country}
                          </p>

                          {/* Flight Count */}
                          <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                            <Plane className="w-4 h-4" />
                            <span>{dest.flightCount} flights</span>
                          </div>

                          {/* Price (if available) */}
                          {dest.minPrice && (
                              <p className="text-blue-600 font-bold text-lg mt-2">
                                from ${dest.minPrice}
                              </p>
                          )}
                        </Card>
                    ))}
                  </div>
                </div>
              </div>
          )}

          {/* Loading State */}
          {isLoading && (
              <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading popular destinations...</p>
                  </div>
                </div>
              </div>
          )}
        </div>
        <Footer />
      </>
  );
}
