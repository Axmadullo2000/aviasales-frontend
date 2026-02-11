'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Smartphone, Building2, CheckCircle2, Lock } from 'lucide-react';
import { Button, Card, Spinner } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { StepsIndicator } from '@/components/features/booking/StepsIndicator';
import { useBookingDetail, useCreatePayment } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils/Format';
import { CardPaymentForm } from '@/components/features/payment/CardPaymentForm';
import { BookingDetailSummary } from '@/components/features/payment/BookingDetailSummary';
import type { PaymentMethod } from '@/types';

const PAYMENT_METHODS: {
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    description: string;
}[] = [
    { id: 'CREDIT_CARD',    label: 'Кредитная / Дебетовая карта', icon: <CreditCard className="w-5 h-5" />, description: 'Visa, Mastercard, Amex' },
    { id: 'UZCARD',         label: 'UzCard',                       icon: <Smartphone className="w-5 h-5" />, description: 'Национальная карта Узбекистана' },
    { id: 'HUMO',           label: 'Humo',                         icon: <Smartphone className="w-5 h-5" />, description: 'Национальная платёжная карта' },
    { id: 'BANK_TRANSFER',  label: 'Банковский перевод',           icon: <Building2 className="w-5 h-5" />, description: 'Прямой банковский перевод' },
];

const STEPS = [
    { id: 1, label: 'Поиск' },
    { id: 2, label: 'Пассажиры' },
    { id: 3, label: 'Оплата' },
    { id: 4, label: 'Подтверждение' },
];

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingRef = searchParams.get('ref');

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CREDIT_CARD');
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: booking, isLoading, error } = useBookingDetail(bookingRef ?? undefined);
    const { mutateAsync: createPayment } = useCreatePayment();

    // Обработчик для карточных методов
    const handleCardPayment = async (cardData: {
        cardNumber: string;   // уже без пробелов (нормализовано в CardPaymentForm)
        cardHolder: string;
        expiryDate: string;   // MM/YY
        cvv: string;
    }) => {
        if (!booking) return;
        setIsProcessing(true);
        try {
            await createPayment({
                bookingReference: booking.bookingReference,
                amount: booking.totalAmount,
                paymentMethod: selectedMethod,
                // ── данные карты ──────────────────────────────────────────
                cardNumber:  cardData.cardNumber,   // 16 цифр без пробелов
                cardHolder:  cardData.cardHolder,
                expiryDate:  cardData.expiryDate,   // MM/YY — бэкенд принимает оба формата
                cvv:         cardData.cvv,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Обработчик для банковского перевода
    const handleBankTransfer = async () => {
        if (!booking) return;
        setIsProcessing(true);
        try {
            await createPayment({
                bookingReference: booking.bookingReference,
                amount: booking.totalAmount,
                paymentMethod: 'BANK_TRANSFER',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!bookingRef) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <p className="text-red-600 font-medium">Номер бронирования не найден.</p>
                <Button className="mt-4" onClick={() => router.push('/')}>На главную</Button>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
    }

    if (error || !booking) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <p className="text-red-600 font-medium mb-4">Не удалось загрузить информацию о бронировании.</p>
                <Button onClick={() => router.push('/my-bookings')}>Мои бронирования</Button>
            </div>
        );
    }

    const isCardMethod = selectedMethod === 'CREDIT_CARD' || selectedMethod === 'UZCARD' || selectedMethod === 'HUMO';

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Шаги */}
            <div className="bg-white border-b py-6">
                <div className="max-w-4xl mx-auto px-4">
                    <StepsIndicator
                        steps={STEPS.map((s, i) => ({
                            ...s,
                            status: i < 2 ? 'completed' : i === 2 ? 'current' : 'pending',
                        }))}
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Оплата бронирования</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Левая колонка */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Выбор метода */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Способ оплаты
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {PAYMENT_METHODS.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`
                                            flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                                            ${selectedMethod === method.id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }
                                        `}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {method.icon}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-gray-900">{method.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{method.description}</div>
                                        </div>
                                        {selectedMethod === method.id && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Форма карты */}
                        {isCardMethod && (
                            <CardPaymentForm
                                paymentMethod={selectedMethod}
                                amount={booking.totalAmount}
                                onSubmit={handleCardPayment}
                                isLoading={isProcessing}
                            />
                        )}

                        {/* Банковский перевод */}
                        {selectedMethod === 'BANK_TRANSFER' && (
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Банковский перевод</h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Банк получателя:</span>
                                        <span className="font-medium">Kapitalbank</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Получатель:</span>
                                        <span className="font-medium">Aviasales LLC</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Назначение:</span>
                                        <span className="font-medium">{booking.bookingReference}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Сумма:</span>
                                        <span className="font-bold text-blue-700">{formatPrice(booking.totalAmount)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    После перевода бронирование будет подтверждено в течение 1–2 рабочих дней.
                                </p>
                                <Button className="w-full mt-4" size="lg" isLoading={isProcessing} onClick={handleBankTransfer}>
                                    Подтвердить перевод
                                </Button>
                            </Card>
                        )}

                        {/* SSL */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>Ваши данные защищены шифрованием SSL 256-bit.</span>
                        </div>
                    </div>

                    {/* Правая колонка */}
                    <div className="lg:col-span-1">
                        <BookingDetailSummary booking={booking} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>}>
                <PaymentContent />
            </Suspense>
        </>
    );
}
