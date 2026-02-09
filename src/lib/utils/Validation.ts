import { z } from 'zod';
import { CabinClass, Gender } from '@/types';

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

// ==================== FLIGHT SEARCH SCHEMA ====================

export const flightSearchSchema = z
    .object({
        from: z.string().min(3, 'Select origin airport').max(3),
        to: z.string().min(3, 'Select destination airport').max(3),
        departureDate: z.string().min(1, 'Select departure date'),
        passengers: z.number().min(1).max(9, 'Maximum 9 passengers'),
        cabinClass: z.nativeEnum(CabinClass),
    })
    .refine((data) => data.from !== data.to, {
        message: 'Origin and destination must be different',
        path: ['to'],
    });

// ==================== PASSENGER SCHEMA ====================

export const passengerSchema = z.object({
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name too long')
        .regex(/^[a-zA-Z\s-]+$/, 'Only letters, spaces and hyphens allowed'),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name too long')
        .regex(/^[a-zA-Z\s-]+$/, 'Only letters, spaces and hyphens allowed'),
    passportNumber: z
        .string()
        .min(6, 'Invalid passport number')
        .max(15, 'Invalid passport number')
        .regex(/^[A-Z0-9]+$/, 'Passport must contain only uppercase letters and numbers'),
    dateOfBirth: z
        .string()
        .min(1, 'Date of birth is required')
        .refine(
            (date) => {
                const dob = new Date(date);
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                return age >= 0 && age <= 120;
            },
            'Invalid date of birth'
        ),
    nationality: z.string().min(2, 'Select nationality').max(2),
    gender: z.nativeEnum(Gender),
    passportCountry: z.string().min(2, 'Select passport country').max(2),
    passportExpiry: z
        .string()
        .min(1, 'Passport expiry is required')
        .refine(
            (date) => {
                const expiry = new Date(date);
                const today = new Date();
                return expiry > today;
            },
            'Passport must be valid'
        ),
    cabinClass: z.nativeEnum(CabinClass).optional(),
    seatNumber: z.string().regex(/^[1-9][0-9]?[A-K]$/).optional().or(z.literal('')),
    seatPreference: z.enum(['WINDOW', 'AISLE', 'MIDDLE']).optional(),
    saveForFuture: z.boolean().optional(),
});

// ==================== CONTACT INFO SCHEMA ====================

export const contactInfoSchema = z.object({
    email: z.string().email('Invalid email address'),
    phone: z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format'),
    specialRequests: z.string().max(500, 'Special requests too long').optional(),
});

// ==================== PAYMENT SCHEMA ====================

export const paymentSchema = z.object({
    cardNumber: z
        .string()
        .min(13, 'Card number must be at least 13 digits')
        .max(19, 'Card number too long')
        .regex(/^[0-9\s]+$/, 'Card number must contain only digits'),
    cardHolderName: z
        .string()
        .min(3, 'Cardholder name required')
        .max(50, 'Cardholder name too long')
        .regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed'),
    expiryDate: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Invalid format (MM/YY)')
        .refine(
            (date) => {
                const [month, year] = date.split('/').map(Number);
                const expiry = new Date(2000 + year, month - 1);
                return expiry > new Date();
            },
            'Card has expired'
        ),
    cvv: z.string().regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
});

// ==================== CARD VALIDATION HELPERS ====================

export function detectCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.startsWith('8600')) return 'UzCard';
    if (cleaned.startsWith('9860')) return 'Humo';
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || /^(2221|2720)/.test(cleaned)) return 'Mastercard';
    if (cleaned.startsWith('6')) return 'Maestro';
    if (/^(34|37)/.test(cleaned)) return 'American Express';
    if (cleaned.startsWith('62')) return 'UnionPay';
    if (/^(2200|2201|2202|2203|2204)/.test(cleaned)) return 'Мир';
    return 'Unknown';
}

export function validateLuhn(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');

    // UzCard and Humo don't use Luhn
    if (cleaned.startsWith('8600') || cleaned.startsWith('9860')) {
        return cleaned.length === 16;
    }

    // Luhn algorithm for other cards
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

// ==================== BOOKING SCHEMA ====================

export const bookingSchema = z.object({
    passengers: z.array(passengerSchema).min(1).max(9),
    contactInfo: contactInfoSchema,
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type FlightSearchFormData = z.infer<typeof flightSearchSchema>;
export type PassengerFormData = z.infer<typeof passengerSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;