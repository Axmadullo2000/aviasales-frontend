export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    SEARCH: '/search',
    BOOKING: '/booking',
    PAYMENT: '/payment',
    CONFIRMATION: '/confirmation',
    MY_BOOKINGS: '/my-bookings',
} as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER];

export const PROTECTED_ROUTES = [
    ROUTES.BOOKING,
    ROUTES.PAYMENT,
    ROUTES.CONFIRMATION,
    ROUTES.MY_BOOKINGS,
];
