import { z } from 'zod';
import { CabinClass, Gender } from '@/types';

// =============================================
// AUTH
// =============================================

export const loginSchema = z.object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(6, 'Минимум 6 символов'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.string().email('Введите корректный email'),
    password: z
        .string()
        .min(6, 'Минимум 6 символов')
        .max(72, 'Максимум 72 символа'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// =============================================
// FLIGHT SEARCH
// =============================================

export const flightSearchSchema = z.object({
    from: z
        .string()
        .min(3, 'Введите код аэропорта (3 буквы)')
        .max(3, 'Код аэропорта — 3 буквы')
        .regex(/^[A-Za-z]{3}$/, 'Только 3 латинские буквы'),
    to: z
        .string()
        .min(3, 'Введите код аэропорта (3 буквы)')
        .max(3, 'Код аэропорта — 3 буквы')
        .regex(/^[A-Za-z]{3}$/, 'Только 3 латинские буквы'),
    departureDate: z
        .string()
        .min(1, 'Выберите дату'),
    passengers: z
        .number({ invalid_type_error: 'Укажите число пассажиров' })
        .min(1, 'Минимум 1 пассажир')
        .max(9, 'Максимум 9 пассажиров'),
    cabinClass: z.enum(['ECONOMY', 'BUSINESS', 'FIRST_CLASS'] as const),
});

export type FlightSearchFormData = z.infer<typeof flightSearchSchema>;

// =============================================
// PASSENGER
// =============================================

export const passengerSchema = z.object({
    firstName: z
        .string()
        .min(2, 'Введите имя (минимум 2 символа)')
        .regex(/^[A-Za-z\s-]+$/, 'Только латинские буквы'),
    lastName: z
        .string()
        .min(2, 'Введите фамилию (минимум 2 символа)')
        .regex(/^[A-Za-z\s-]+$/, 'Только латинские буквы'),
    passportNumber: z
        .string()
        .min(6, 'Минимум 6 символов')
        .max(20, 'Максимум 20 символов')
        .regex(/^[A-Z0-9]+$/, 'Только заглавные буквы и цифры'),
    dateOfBirth: z.string().min(1, 'Укажите дату рождения'),
    nationality: z
        .string()
        .length(2, 'Код страны — 2 буквы')
        .regex(/^[A-Z]{2}$/, 'Только 2 заглавные латинские буквы'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const),
    passportCountry: z
        .string()
        .length(2, 'Код страны — 2 буквы')
        .regex(/^[A-Z]{2}$/, 'Только 2 заглавные латинские буквы'),
    passportExpiry: z.string().min(1, 'Укажите дату истечения паспорта'),
});

export type PassengerFormData = z.infer<typeof passengerSchema>;

// =============================================
// CONTACT INFO
// =============================================

export const contactInfoSchema = z.object({
    email: z.string().email('Введите корректный email'),
    phone: z
        .string()
        .min(9, 'Введите номер телефона')
        .regex(/^\+?[\d\s\-()]+$/, 'Некорректный номер телефона'),
});

export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;

// =============================================
// BOOKING (PASSENGERS + CONTACT)
// =============================================

export const bookingSchema = z.object({
    passengers: z.array(passengerSchema).min(1, 'Добавьте хотя бы одного пассажира'),
    contactInfo: contactInfoSchema,
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// =============================================
// PAYMENT (CARD)
// =============================================

export const cardPaymentSchema = z.object({
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
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Формат: MM/YY')
        .refine((val) => {
            const [month, year] = val.split('/').map(Number);
            const exp = new Date(2000 + year, month - 1);
            return exp > new Date();
        }, 'Карта просрочена'),
    cvv: z
        .string()
        .min(3, 'CVV — 3 цифры')
        .max(4, 'CVV — 3–4 цифры')
        .regex(/^\d+$/, 'Только цифры'),
});

export type CardPaymentFormData = z.infer<typeof cardPaymentSchema>;
