'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Plane, Calendar, Users, Search } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { flightSearchSchema, type FlightSearchFormData } from '@/lib/utils/Validation';
import { useBookingStore } from '@/lib/store/BookingStore';
import { cn } from '@/lib/utils/cn';
import type { CabinClass } from '@/types';

type Variant = 'default' | 'hero';

interface SearchFormProps {
    variant?: Variant;
}

export function SearchForm({ variant = 'default' }: SearchFormProps) {
    const router = useRouter();
    const setSearchParams = useBookingStore((s) => s.setSearchParams);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FlightSearchFormData>({
        resolver: zodResolver(flightSearchSchema),
        defaultValues: {
            passengers: 1,
            cabinClass: 'ECONOMY' as CabinClass,
        },
    });

    const onSubmit = handleSubmit((data) => {
        // Правильная структура для setSearchParams
        setSearchParams({
            from: data.from.toUpperCase(),
            to: data.to.toUpperCase(),
            date: data.departureDate,
            passengers: data.passengers,
            cabinClass: data.cabinClass as CabinClass,
        });

        const params = new URLSearchParams({
            from: data.from.toUpperCase(),
            to: data.to.toUpperCase(),
            date: data.departureDate,
            passengers: data.passengers.toString(),
            cabinClass: data.cabinClass,
        });
        router.push(`/search?${params.toString()}`);
    });

    const isHero = variant === 'hero';

    return (
        <form onSubmit={onSubmit} className={cn('space-y-5', isHero && 'space-y-6')}>
            <div className={cn('grid gap-4', isHero ? 'md:grid-cols-2' : 'md:grid-cols-[2fr_2fr_1fr]')}>
                <Input
                    {...register('from')}
                    placeholder="Откуда (TAS, DME...)"
                    leftIcon={<Plane className="w-5 h-5" />}
                    error={errors.from?.message}
                    className={cn('uppercase', isHero && 'text-lg py-6')}
                    maxLength={3}
                />

                <Input
                    {...register('to')}
                    placeholder="Куда (DXB, IST...)"
                    leftIcon={<Plane className="w-5 h-5 rotate-90" />}
                    error={errors.to?.message}
                    className={cn('uppercase', isHero && 'text-lg py-6')}
                    maxLength={3}
                />

                <Input
                    {...register('departureDate')}
                    type="date"
                    leftIcon={<Calendar className="w-5 h-5" />}
                    error={errors.departureDate?.message}
                    className={isHero ? 'text-lg py-6' : ''}
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            <div className={cn('grid gap-4', isHero ? 'md:grid-cols-3' : 'md:grid-cols-[1fr_1fr_auto]')}>
                <Input
                    {...register('passengers', { valueAsNumber: true })}
                    type="number"
                    placeholder="Пассажиры"
                    leftIcon={<Users className="w-5 h-5" />}
                    min={1}
                    max={9}
                    error={errors.passengers?.message}
                    className={isHero ? 'text-lg py-6' : ''}
                />

                <Select
                    {...register('cabinClass')}
                    options={[
                        { value: 'ECONOMY', label: 'Эконом' },
                        { value: 'BUSINESS', label: 'Бизнес' },
                        { value: 'FIRST_CLASS', label: 'Первый класс' },
                    ]}
                    className={isHero ? 'text-lg py-6' : ''}
                />

                <Button
                    type="submit"
                    size={isHero ? 'hero' : 'lg'}
                    isLoading={isSubmitting}
                    className={cn('w-full md:w-auto', isHero && 'text-xl py-7')}
                    leftIcon={<Search className="w-6 h-6" />}
                >
                    Найти билеты
                </Button>
            </div>
        </form>
    );
}
