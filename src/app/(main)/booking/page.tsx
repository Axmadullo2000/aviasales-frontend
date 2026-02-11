'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowRight, Trash2, UserPlus } from 'lucide-react';
import { Button, Card, Input, Select } from '@/components/ui';
import { bookingSchema, type PassengerFormData, type ContactInfoFormData } from '@/lib/utils/Validation';
import { useBookingStore } from '@/lib/store/BookingStore';
import { useCreateBooking } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store/AuthStore';  // Импортируем хранилище авторизации
import type { CreateBookingRequest, CabinClass } from '@/types';

interface BookingFormData {
  passengers: PassengerFormData[];
  contactInfo: ContactInfoFormData;
}

export default function BookingPage() {
  const router = useRouter();
  const { selectedFlight, searchParams } = useBookingStore();
  const { mutate: createBooking, isPending } = useCreateBooking();
  const { isAuthenticated } = useAuthStore();  // Получаем состояние авторизации

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirectTo=/booking');  // ← передаём куда вернуться
    }
  }, [isAuthenticated, router]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengers: [{}] as any,
      contactInfo: { email: '', phone: '' },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'passengers',
  });

  const onSubmit = (data: BookingFormData) => {
    if (!selectedFlight) {
      alert('Рейс не выбран');
      return;
    }

    const bookingRequest: CreateBookingRequest = {
      flightId: selectedFlight.id,
      passengers: data.passengers,
      contactEmail: data.contactInfo.email,
      contactPhone: data.contactInfo.phone,
      defaultCabinClass: (searchParams?.cabinClass as CabinClass) || 'ECONOMY',
      specialRequests: '',
    };

    createBooking(bookingRequest);
  };

  // Если рейс не выбран, перенаправляем на страницу поиска
  useEffect(() => {
    if (!selectedFlight) {
      router.push('/search');
    }
  }, [selectedFlight, router]);

  if (!selectedFlight || !isAuthenticated) {
    return null;  // Возвращаем null, чтобы не рендерить страницу, если пользователь не авторизован или рейс не выбран
  }

  return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Левая часть — форма */}
            <div className="md:col-span-2">
              <Card className="p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-8">Пассажиры</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                  {fields.map((field, index) => (
                      <div key={field.id} className="border rounded-xl p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-semibold">Пассажир {index + 1}</h2>
                          {fields.length > 1 && (
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <Input
                              {...register(`passengers.${index}.firstName`)}
                              label="Имя"
                              error={errors.passengers?.[index]?.firstName?.message}
                          />
                          <Input
                              {...register(`passengers.${index}.lastName`)}
                              label="Фамилия"
                              error={errors.passengers?.[index]?.lastName?.message}
                          />
                          <Input
                              {...register(`passengers.${index}.passportNumber`)}
                              label="Номер паспорта"
                              error={errors.passengers?.[index]?.passportNumber?.message}
                          />
                          <Input
                              {...register(`passengers.${index}.dateOfBirth`)}
                              type="date"
                              label="Дата рождения"
                              error={errors.passengers?.[index]?.dateOfBirth?.message}
                          />
                          <Input
                              {...register(`passengers.${index}.nationality`)}
                              label="Национальность (код)"
                              placeholder="UZ"
                              maxLength={2}
                              className="uppercase"
                              error={errors.passengers?.[index]?.nationality?.message}
                          />
                          <Select
                              {...register(`passengers.${index}.gender`)}
                              label="Пол"
                              options={[
                                { value: 'MALE', label: 'Мужской' },
                                { value: 'FEMALE', label: 'Женский' },
                                { value: 'OTHER', label: 'Другой' },
                              ]}
                              error={errors.passengers?.[index]?.gender?.message}
                          />
                          <Input
                              {...register(`passengers.${index}.passportCountry`)}
                              label="Страна паспорта (код)"
                              placeholder="UZ"
                              maxLength={2}
                              className="uppercase"
                              error={errors.passengers?.[index]?.passportCountry?.message}
                          />
                          <Input
                              {...register(`passengers.${index}.passportExpiry`)}
                              type="date"
                              label="Срок действия паспорта"
                              error={errors.passengers?.[index]?.passportExpiry?.message}
                          />
                        </div>
                      </div>
                  ))}

                  <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                          append({
                            firstName: '',
                            lastName: '',
                            passportNumber: '',
                            dateOfBirth: '',
                            nationality: '',
                            gender: 'MALE',
                            passportCountry: '',
                            passportExpiry: '',
                          })
                      }
                      className="w-full"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Добавить пассажира
                  </Button>

                  {/* Контактные данные */}
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Контактные данные</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                      <Input
                          {...register('contactInfo.email')}
                          label="Email"
                          type="email"
                          error={errors.contactInfo?.email?.message}
                      />
                      <Input
                          {...register('contactInfo.phone')}
                          label="Телефон"
                          placeholder="+998901234567"
                          error={errors.contactInfo?.phone?.message}
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full text-lg"
                        loading={isPending}  // или использовать isPending.toString()
                    >
                      Перейти к оплате <ArrowRight className="ml-3 w-6 h-6" />
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Правая часть — summary */}
            <div className="md:col-span-1">
              <Card className="p-6 sticky top-6">
                <h3 className="text-xl font-bold mb-6">Ваш рейс</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span>Рейс</span>
                    <span className="font-medium">{selectedFlight.flightNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Откуда → Куда</span>
                    <span className="font-medium">
                    {selectedFlight.origin.iataCode} → {selectedFlight.destination.iataCode}
                  </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Пассажиров</span>
                    <span className="font-medium">{fields.length}</span>
                  </div>
                  {searchParams && (
                      <div className="flex justify-between">
                        <span>Класс</span>
                        <span className="font-medium">{searchParams.cabinClass}</span>
                      </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
