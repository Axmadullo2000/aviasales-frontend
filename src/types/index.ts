// =============================================
// AUTH
// =============================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    id: string | number;
    email: string;
    role: string;
}

// =============================================
// FLIGHTS
// =============================================

export type CabinClass = 'ECONOMY' | 'BUSINESS' | 'FIRST_CLASS';

export type SortBy = 'PRICE' | 'DEPARTURE_TIME' | 'ARRIVAL_TIME' | 'DURATION';

export interface Airport {
    iataCode: string;
    name: string;
    city: string;
    country: string;
    countryCode: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
}

export interface Airline {
    iataCode: string;
    name: string;
    logoUrl?: string;
    country?: string;
}

export interface FlightResponse {
    id: number;
    flightNumber: string;
    airline: Airline;
    origin: Airport;
    destination: Airport;
    departureTime: string;   // ISO 8601
    arrivalTime: string;     // ISO 8601
    economyPrice: number;
    businessPrice: number;
    firstClassPrice: number;
    availableSeats: number;
    aircraftType?: string;
    status?: string;
}

export interface FlightDetailResponse extends FlightResponse {
    totalSeats: number;
    economySeats: number;
    businessSeats: number;
    firstClassSeats: number;
    amenities?: string[];
}

export interface FlightSearchRequest {
    originCode: string;
    destinationCode: string;
    departureDate: string;   // YYYY-MM-DD
    passengers: number;
    cabinClass: CabinClass;
    sortBy?: SortBy;
}

export interface PopularDestinationResponse {
    iataCode: string;
    city: string;
    country: string;
    minPrice?: number;
    imageUrl?: string;
}

export interface AvailableSeatsResponse {
    flightId: number;
    cabinClass: CabinClass;
    availableSeats: number;
}

// Round trip
export interface RoundTripSearchRequest {
    originCode: string;
    destinationCode: string;
    departureDate: string;
    returnDate: string;
    passengers: number;
    cabinClass: CabinClass;
}

export interface RoundTripSearchResponse {
    outboundFlights: FlightResponse[];
    returnFlights: FlightResponse[];
}

export interface RoundTripDiscountResponse {
    discount: number;
    discountPercent: number;
    originalPrice: number;
    discountedPrice: number;
}

// =============================================
// PASSENGERS
// =============================================

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface PassengerInfo {
    firstName: string;
    lastName: string;
    passportNumber: string;
    dateOfBirth: string;       // YYYY-MM-DD
    nationality: string;       // 2-letter ISO (UZ, RU...)
    gender: Gender;
    passportCountry: string;   // 2-letter ISO
    passportExpiry: string;    // YYYY-MM-DD
}

export interface ContactInfo {
    email: string;
    phone: string;
}

// =============================================
// BOOKINGS
// =============================================

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export interface CreateBookingRequest {
    flightId: number;
    passengers: PassengerInfo[];
    contactEmail: string;
    contactPhone: string;
    defaultCabinClass: CabinClass;
    specialRequests?: string;
}

export interface CancelBookingRequest {
    reason?: string;
}

// Сокращённый ответ (для списка)
export interface BookingResponse {
    id: number;
    bookingReference: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    totalPassengers: number;
    totalAmount: number;
    amountDue: number;
    createdAt: string;
    expiresAt: string;
}

// Полный ответ с билетами (для страниц деталей и оплаты)
export interface BookingDetailResponse extends BookingResponse {
    contactEmail: string;
    contactPhone: string;
    tickets: TicketResponse[];
}

export interface TicketResponse {
    id: number;
    ticketNumber: string;
    seatNumber?: string;
    cabinClass: CabinClass;
    price: number;
    status: string;
    passenger: PassengerInfo & { id?: number };
    // Рейс — опционально (может прийти вложенным)
    flight?: FlightResponse;
}

// =============================================
// PAYMENTS
// =============================================

// Все поддерживаемые методы оплаты
export type PaymentMethod =
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'UZCARD'
    | 'HUMO'
    | 'BANK_TRANSFER'
    | 'CASH';

export interface CreatePaymentRequest {
    bookingReference: string;
    amount: number;
    paymentMethod: PaymentMethod;
    // Данные карты (только для карточных методов)
    cardNumber?: string;
    cardHolder?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    expiryDate?: string
}

export interface PaymentResponse {
    id: number;
    transactionId: string;
    bookingReference: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    createdAt: string;
}

export interface PaymentStatusResponse {
    transactionId: string;
    status: PaymentStatus;
    message?: string;
}

export interface ReceiptResponse {
    bookingReference: string;
    amount: number;
    paidAt: string;
    receiptNumber: string;
}

// =============================================
// PRICING
// =============================================

export interface DynamicPriceResponse {
    flightId: number;
    cabinClass: CabinClass;
    basePrice: number;
    dynamicPrice: number;
    priceMultiplier: number;
}

export interface CalendarPriceResponse {
    from: string;
    to: string;
    month: string;
    prices: Record<string, number>; // "YYYY-MM-DD" -> price
}

// =============================================
// PAGINATION
// =============================================

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;         // current page (0-indexed)
    size: number;
    first: boolean;
    last: boolean;
}
