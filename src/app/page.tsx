'use client';

import { SearchForm } from '@/components/features/search/SearchForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Plane, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { usePopularDestinations } from '@/lib/hooks';
import { Card, Badge } from '@/components/ui';

export default function Home() {
  const { data: popular, isLoading } = usePopularDestinations(8);

  return (
      <>
        <Header />

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white">
          <div className="absolute inset-0 bg-[url('/plane-bg.jpg')] bg-cover bg-center opacity-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
              Найди билеты дешевле всех
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto">
              Сравниваем цены 1000+ авиакомпаний. Бронируй без лишних кликов.
            </p>

            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl">
              <SearchForm variant="hero" />
            </div>
          </div>
        </div>

        {/* Преимущества */}
        <div className="bg-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <ShieldCheck className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold">Безопасная оплата</h3>
                <p className="mt-2 text-gray-600">UzCard, Humo, Visa, Mastercard</p>
              </div>
              <div>
                <Clock className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold">Мгновенное бронирование</h3>
                <p className="mt-2 text-gray-600">Место фиксируется на 15 минут</p>
              </div>
              <div>
                <CreditCard className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold">Лучшие цены</h3>
                <p className="mt-2 text-gray-600">Сравниваем все агрегаторы</p>
              </div>
              <div>
                <Plane className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold">Электронный билет</h3>
                <p className="mt-2 text-gray-600">PDF сразу после оплаты</p>
              </div>
            </div>
          </div>
        </div>

        {/* Популярные направления */}
        <div className="bg-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Популярные направления
            </h2>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {popular?.map((dest) => (
                      <Card
                          key={dest.iataCode}
                          className="overflow-hidden hover:shadow-xl transition group cursor-pointer"
                      >
                        <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold">
                          {dest.iataCode}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{dest.city}</h3>
                          <p className="text-sm text-gray-600">{dest.country}</p>
                          {dest.minPrice && (
                              <div className="mt-2">
                                <Badge variant="success">от {dest.minPrice}$</Badge>
                              </div>
                          )}
                        </div>
                      </Card>
                  ))}
                </div>
            )}
          </div>
        </div>

        <Footer />
      </>
  );
}
