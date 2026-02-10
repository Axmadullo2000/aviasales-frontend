'use client';

import {useFieldArray, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {ArrowRight, Trash2, UserPlus} from 'lucide-react';
import {Button, Card, Input} from '@/components/ui';
import {bookingSchema} from '@/lib/utils/Validation';
import {useBookingStore} from '@/lib/store/BookingStore';
import {useCreateBooking} from '@/lib/hooks'; //@/lib/hooks/UseCreateBooking

export default function BookingPage() {
  const router = useRouter();
  const { selectedFlight, passengers, setPassengers, contactInfo, setContactInfo } = useBookingStore();
  const { mutate: createBooking, isPending } = useCreateBooking();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengers: passengers.length ? passengers : [{}],
      contactInfo: contactInfo || { email: '', phone: '' },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'passengers',
  });

  const onSubmit = (data: any) => {
    setPassengers(data.passengers);
    setContactInfo(data.contactInfo);

    if (!selectedFlight) {
      alert('Рейс не выбран');
      return;
    }

    // @ts-ignore
    // @ts-ignore
    createBooking({
      flightId: selectedFlight.id,
      passengers: data.passengers,
      contactEmail: data.contactInfo.email,
      contactPhone: data.contactInfo.phone,
      defaultCabinClass: selectedFlight.cabinClass || 'ECONOMY',
    });
  };

  if (!selectedFlight) {
    router.push('/search');
    return null;
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
                          <h2 className="text-xl font-semibold">
                            Пассажир {index + 1}
                          </h2>
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
                          <Input {...register(`passengers.${index}.firstName`)} label="Имя" />
                          <Input {...register(`passengers.${index}.lastName`)} label="Фамилия" />
                          <Input {...register(`passengers.${index}.passportNumber`)} label="Номер паспорта" />
                          <Input {...register(`passengers.${index}.dateOfBirth`)} type="date" label="Дата рождения" />
                          {/* ... остальные поля по аналогии ... */}
                        </div>
                      </div>
                  ))}

                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({})}
                      className="w-full"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Добавить пассажира
                  </Button>

                  {/* Контактные данные */}
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Контактные данные</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                      <Input {...register('contactInfo.email')} label="Email" type="email" />
                      <Input {...register('contactInfo.phone')} label="Телефон" />
                    </div>
                  </div>

                  <div className="pt-8 border-t">
                    <Button type="submit" size="lg" className="w-full text-lg" isLoading={isPending}>
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
                {/* Здесь можно вывести краткую информацию о рейсе */}
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
                  {/* ... дата, класс, цена и т.д. ... */}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
