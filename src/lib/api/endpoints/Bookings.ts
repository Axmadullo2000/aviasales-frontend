// src/lib/types/Booking.ts  (или где у тебя типы)

export interface CreateBookingPayload {
    flightId: number | string;               // ID рейса из вашей БД или внешнего API
    defaultCabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';  // fallback, если не указано у пассажира
    passengers: Passenger[];                 // минимум 1
    contactEmail: string;
    contactPhone?: string;                   // часто optional, но полезно
    specialRequests?: string;                // SSR: wheelchair, meal, etc.
    // Опционально, если нужно:
    // payment?: { method: string; ... }     // обычно оплата отдельно после создания брони
    // currency?: string;
    // language?: string;                    // 'ru', 'en' etc.
}

export interface Passenger {
    id?: string | number;                    // временный ID на фронте, если нужно
    firstName: string;
    lastName: string;
    middleName?: string;                     // отчество — часто нужно в СНГ
    dateOfBirth: string;                     // ISO: "1990-05-15"
    gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
    nationality: string;                     // ISO 3166-1 alpha-2: "UZ", "RU", "KZ"...
    passportNumber: string;
    passportCountry: string;                 // страна выдачи паспорта (ISO 2)
    passportExpiry: string;                  // "2028-12-31"
    // Дополнительно (часто требуется):
    title?: 'MR' | 'MRS' | 'MS' | 'MSTR' | 'MISS';  // обращение
    // Для младенцев / детей:
    passengerType?: 'ADT' | 'CHD' | 'INF';   // adult / child / infant (по возрасту)
    // Выбор места (если уже выбрано на предыдущем шаге)
    cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST_CLASS';
    seatNumber?: string;                     // "12A", "9F"...
    seatPreference?: 'WINDOW' | 'AISLE' | 'ANY' | null;
    // Для лояльности / доп. услуг
    frequentFlyer?: { program: string; number: string };
    // Маркировка для будущих бронирований
    saveForFuture?: boolean;
}

export class bookingsApi {

}