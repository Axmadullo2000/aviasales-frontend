'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, Calendar, User } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { formatPrice } from '@/lib/utils/Format';
import type { PaymentMethod, CreatePaymentRequest } from '@/types';

const cardSchema = z.object({
    cardNumber: z
        .string()
        .min(19, 'Введите полный номер карты')
        .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Неверный формат номера карты'),
    cardHolder: z
        .string()
        .min(3, 'Введите имя держателя карты')
        .regex(/^[A-Za-z\s]+$/, 'Только латинские буквы'),
    expiryDate: z
        .string()
        .min(1, 'Введите срок действия')
        .regex(/^(0[1-9]|1[0-2])\/\d{2,4}$/, 'Формат: MM/YY')
        .refine((val) => {
            const parts = val.split('/');
            const month = parseInt(parts[0]);
            const yearRaw = parseInt(parts[1]);
            const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
            const exp = new Date(year, month - 1);
            return exp > new Date();
        }, 'Карта просрочена'),
    cvv: z
        .string()
        .min(3, 'CVV — 3 цифры')
        .max(4, 'CVV — 3–4 цифры')
        .regex(/^\d+$/, 'Только цифры'),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardPaymentFormProps {
    paymentMethod: PaymentMethod;
    amount: number;
    // onSubmit получает уже нормализованные данные — cardNumber без пробелов
    onSubmit: (data: {
        cardNumber: string;
        cardHolder: string;
        expiryDate: string;  // MM/YY — бэкенд сам конвертирует
        cvv: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

// ─── Форматирование ───────────────────────────────────────────────────────────

function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4); // только MM+YY
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
}

// ─── Определение типа карты (синхронизировано с бэкендом) ────────────────────

type CardInfo = { label: string; color: string; bgColor: string };

function detectCardType(number: string): CardInfo {
    const n = number.replace(/\s/g, '');

    if (n.length < 1) return { label: '', color: '', bgColor: '' };

    // UzCard — prefix 5614
    if (n.startsWith('5614')) {
        return { label: 'UzCard', color: 'text-blue-800', bgColor: 'bg-blue-100' };
    }

    // Humo — prefix 9860
    if (n.startsWith('9860')) {
        return { label: 'Humo', color: 'text-green-800', bgColor: 'bg-green-100' };
    }

    // American Express — prefix 34 или 37 (проверяем ДО Maestro/Visa)
    if (n.startsWith('34') || n.startsWith('37')) {
        return { label: 'Amex', color: 'text-blue-700', bgColor: 'bg-blue-50' };
    }

    // UnionPay — prefix 62
    if (n.startsWith('62')) {
        return { label: 'UnionPay', color: 'text-red-800', bgColor: 'bg-red-50' };
    }

    // МИР — 2200–2204
    if (n.length >= 4) {
        const first4 = parseInt(n.slice(0, 4));
        if (!isNaN(first4) && first4 >= 2200 && first4 <= 2204) {
            return { label: 'МИР', color: 'text-green-700', bgColor: 'bg-green-50' };
        }
        // Mastercard 2221–2720
        if (!isNaN(first4) && first4 >= 2221 && first4 <= 2720) {
            return { label: 'Mastercard', color: 'text-orange-700', bgColor: 'bg-orange-50' };
        }
    }

    // Mastercard — 51–55
    if (n.length >= 2) {
        const first2 = parseInt(n.slice(0, 2));
        if (!isNaN(first2) && first2 >= 51 && first2 <= 55) {
            return { label: 'Mastercard', color: 'text-orange-700', bgColor: 'bg-orange-50' };
        }
    }

    // Maestro — prefix 6
    if (n.startsWith('6')) {
        return { label: 'Maestro', color: 'text-purple-700', bgColor: 'bg-purple-50' };
    }

    // Visa — prefix 4
    if (n.startsWith('4')) {
        return { label: 'VISA', color: 'text-blue-700', bgColor: 'bg-blue-50' };
    }

    // МИР — prefix 2 (после проверки диапазонов выше)
    if (n.startsWith('2')) {
        return { label: 'МИР', color: 'text-green-700', bgColor: 'bg-green-50' };
    }

    return { label: '', color: '', bgColor: '' };
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export function CardPaymentForm({ paymentMethod, amount, onSubmit, isLoading = false }: CardPaymentFormProps) {
    const [cardFlipped, setCardFlipped] = useState(false);
    const [displayCardNumber, setDisplayCardNumber] = useState('');
    const [displayHolder, setDisplayHolder]         = useState('');
    const [displayExpiry, setDisplayExpiry]         = useState('');

    const { handleSubmit, setValue, trigger, formState: { errors } } = useForm<CardFormData>({
        resolver: zodResolver(cardSchema),
        defaultValues: { cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' },
    });

    const cardInfo = detectCardType(displayCardNumber);
    const methodLabel =
        paymentMethod === 'UZCARD' ? 'UzCard' :
            paymentMethod === 'HUMO'   ? 'Humo'   : 'Банковская карта';

    // Нормализация перед отправкой — убираем пробелы из номера
    const handleFormSubmit = (data: CardFormData) => {
        return onSubmit({
            ...data,
            cardNumber: data.cardNumber.replace(/\s/g, ''), // "1234 5678..." → "12345678..."
        });
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                {methodLabel}
            </h2>

            {/* ── Превью карты ─────────────────────────────────────────────── */}
            <div className="mb-8">
                <div className={`
                    relative w-full max-w-sm mx-auto h-44 rounded-2xl p-6 text-white
                    bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800
                    shadow-xl transition-all duration-300 select-none
                    ${cardFlipped ? 'scale-[0.98]' : ''}
                `}>
                    <div className="w-10 h-7 bg-yellow-300 rounded-md mb-4 opacity-90" />

                    {!cardFlipped ? (
                        <>
                            <div className="text-xl font-mono tracking-widest mb-4">
                                {displayCardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs opacity-70 mb-0.5">Держатель карты</div>
                                    <div className="text-sm font-semibold uppercase tracking-wide truncate max-w-[180px]">
                                        {displayHolder || 'FULL NAME'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs opacity-70 mb-0.5">Срок</div>
                                    <div className="text-sm font-semibold">{displayExpiry || 'MM/YY'}</div>
                                </div>
                            </div>

                            {/* Бейдж типа карты */}
                            {cardInfo.label && (
                                <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded ${cardInfo.color} ${cardInfo.bgColor}`}>
                                    {cardInfo.label}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col justify-between">
                            <div className="w-full h-8 bg-gray-800 rounded"
                                 style={{ marginLeft: '-1.5rem', width: 'calc(100% + 3rem)' }} />
                            <div className="flex justify-end items-center mt-4">
                                <div className="bg-white/20 h-8 flex-1 rounded mr-3" />
                                <div className="bg-white text-gray-900 font-mono font-bold px-3 py-1 rounded text-sm min-w-[50px] text-center">
                                    CVV
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Форма ────────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

                {/* Номер карты */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Номер карты</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text" inputMode="numeric"
                            placeholder="0000 0000 0000 0000" maxLength={19}
                            autoComplete="cc-number"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                            onChange={(e) => {
                                const fmt = formatCardNumber(e.target.value);
                                e.target.value = fmt;
                                setDisplayCardNumber(fmt);
                                setValue('cardNumber', fmt, { shouldValidate: false });
                            }}
                            onBlur={() => trigger('cardNumber')}
                        />
                    </div>
                    {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>}
                </div>

                {/* Имя держателя */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя держателя карты</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text" placeholder="IVAN IVANOV"
                            autoComplete="cc-name"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg uppercase text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardHolder ? 'border-red-500' : 'border-gray-300'}`}
                            onChange={(e) => {
                                const upper = e.target.value.toUpperCase();
                                e.target.value = upper;
                                setDisplayHolder(upper);
                                setValue('cardHolder', upper, { shouldValidate: false });
                            }}
                            onBlur={() => trigger('cardHolder')}
                        />
                    </div>
                    {errors.cardHolder && <p className="mt-1 text-sm text-red-600">{errors.cardHolder.message}</p>}
                </div>

                {/* Срок + CVV */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Срок действия</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="text" inputMode="numeric"
                                placeholder="MM/YY" maxLength={5}
                                autoComplete="cc-exp"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                                onChange={(e) => {
                                    const fmt = formatExpiry(e.target.value);
                                    e.target.value = fmt;
                                    setDisplayExpiry(fmt);
                                    setValue('expiryDate', fmt, { shouldValidate: false });
                                }}
                                onBlur={() => trigger('expiryDate')}
                            />
                        </div>
                        {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV / CVC</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="password" inputMode="numeric"
                                placeholder="•••" maxLength={4}
                                autoComplete="cc-csc"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                                onFocus={() => setCardFlipped(true)}
                                onBlur={() => { setCardFlipped(false); trigger('cvv'); }}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '');
                                    e.target.value = digits;
                                    setValue('cvv', digits, { shouldValidate: false });
                                }}
                            />
                        </div>
                        {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>}
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full text-base" isLoading={isLoading}>
                    <Lock className="w-4 h-4 mr-2" />
                    Оплатить {formatPrice(amount)}
                </Button>
            </form>
        </Card>
    );
}
