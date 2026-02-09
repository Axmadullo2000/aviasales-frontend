// Application constants

export const BOOKING_EXPIRY_MINUTES = 15;

export const MAX_PASSENGERS = 9;

export const COUNTRIES = [
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'RU', name: 'Russia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'TR', name: 'Turkey' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
];

export const PAYMENT_METHODS = {
    UZCARD: 'UzCard',
    HUMO: 'Humo',
    VISA: 'Visa',
    MASTERCARD: 'Mastercard',
    MAESTRO: 'Maestro',
    AMEX: 'American Express',
    UNIONPAY: 'UnionPay',
    MIR: 'Мир',
} as const;

export const BAGGAGE_ALLOWANCE = {
    ECONOMY: 23, // kg
    BUSINESS: 32, // kg
    FIRST_CLASS: 40, // kg
};

export const HAND_LUGGAGE = {
    ECONOMY: 8, // kg
    BUSINESS: 10, // kg
    FIRST_CLASS: 12, // kg
};

export const ROUND_TRIP_DISCOUNT = 0.05; // 5%

export const SEAT_PREFERENCES = [
    { value: 'WINDOW', label: 'Window' },
    { value: 'AISLE', label: 'Aisle' },
    { value: 'MIDDLE', label: 'Middle' },
] as const;