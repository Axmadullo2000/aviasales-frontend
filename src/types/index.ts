// ==================== ENUMS ====================

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

export enum CabinClass {
    ECONOMY = 'ECONOMY',
    BUSINESS = 'BUSINESS',
    FIRST_CLASS = 'FIRST_CLASS',
}

export enum FlightStatus {
    SCHEDULED = 'SCHEDULED',
    BOARDING = 'BOARDING',
    DEPARTED = 'DEPARTED',
    IN_FLIGHT = 'IN_FLIGHT',
    ARRIVED = 'ARRIVED',
    DELAYED = 'DELAYED',
    CANCELLED = 'CANCELLED',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum PaymentMethod {
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
}

export enum FlightSortBy {
    PRICE = 'PRICE',
    DURATION = 'DURATION',
    DEPARTURE_TIME = 'DEPARTURE_TIME',
}

// ==================== AIRPORT & AIRLINE ====================

export interface Airport {
    id: number;
    iataCode: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
    latitude: number;
    longitude: number;
}

export interface Airline {
    id: number;
    iataCode: string;
    name: string;
    logoUrl?: string;
    baggageAllowance: number;
    handLuggage: number;
    isLowCost: boolean;
    rating: number;
}

// ==================== FLIGHTS ====================

export interface FlightResponse {
    id: number;
    flightNumber: string;
    airline: Airline;
    origin: Airport;
    destination: Airport;
    departureTime: string; // ISO string
    arrivalTime: string;
    duration: string; // "4h 20m"
    status: FlightStatus;
    availableSeats: number;
    economyPrice: number;
    businessPrice?: number;
    firstClassPrice?: number;
    aircraftType?: string;
}

export interface FlightDetailResponse extends FlightResponse {
    totalSeats: number;
    economySeats: number;
    businessSeats: number;
    firstClassSeats: number;
    economyAvailable: number;
    businessAvailable: number;
    firstClassAvailable: number;
}

export interface PopularDestinationResponse {
    airport: Airport;
    flightCount: number;
    minPrice: number;
    avgPrice: number;
}

export interface FlightSearchRequest {
    originCode: string; // IATA code
    destinationCode: string;
    departureDate: string; // YYYY-MM-DD
    passengers: number;
    cabinClass: CabinClass;
    sortBy?: FlightSortBy;
}

export interface RoundTripSearchRequest extends FlightSearchRequest {
    returnDate: string;
    flexibleDates?: boolean;
    directOnly?: boolean;
}

export interface RoundTripSearchResponse {
    outboundFlights: FlightResponse[];
    returnFlights: FlightResponse[];
    discount: number;
}

export interface AvailableSeatsResponse {
    flightId: number;
    cabinClass: CabinClass;
    availableSeats: number;
    totalSeats: number;
    availableSeatNumbers: string[];
}

// ==================== BOOKINGS ====================

export interface PassengerInfo {
    firstName: string;
    lastName: string;
    passportNumber: string;
    dateOfBirth: string; // YYYY-MM-DD
    nationality: string;
    gender: Gender;
    passportCountry: string;
    passportExpiry: string;
    cabinClass?: CabinClass;
    seatNumber?: string;
    seatPreference?: 'WINDOW' | 'AISLE' | 'MIDDLE';
    saveForFuture?: boolean;
}

export interface CreateBookingRequest {
    flightId: number;
    defaultCabinClass?: CabinClass;
    passengers: PassengerInfo[];
    contactEmail: string;
    contactPhone: string;
    specialRequests?: string;
}

export interface ContactInfo {
    email: string;
    phone: string;
}

export interface BookingResponse {
    id: number;
    bookingReference: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    paidAmount: number;
    amountDue: number;
    totalPassengers: number;
    createdAt: string;
    expiresAt: string;
    paymentInstructions: string;
}

export interface TicketResponse {
    id: number;
    ticketNumber: string;
    passengerName: string;
    passengerFirstName: string;
    passengerLastName: string;
    flightNumber: string;
    origin: string; // airport code
    destination: string;
    departureTime: string;
    arrivalTime: string;
    cabinClass: CabinClass;
    seatNumber: string;
    price: number;
    status: string;
    checkedBaggage: number;
    cabinBaggage: number;
}

export interface BookingDetailResponse {
    id: number;
    bookingReference: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    paidAmount: number;
    amountDue: number;
    createdAt: string;
    expiresAt: string;
    confirmedAt?: string;
    contactInfo: ContactInfo;
    specialRequests?: string;
    tickets: TicketResponse[];
}

export interface CancelBookingRequest {
    reason?: string;
}

// ==================== PAYMENTS ====================

export interface CreatePaymentRequest {
    bookingReference: string;
    amount: number;
    paymentMethod: PaymentMethod;
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string; // MM/YY
    cvv?: string;
    idempotencyKey?: string;
}

export interface PaymentResponse {
    id: number;
    transactionId: string;
    bookingReference: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    createdAt: string;
    processedAt?: string;
    failureReason?: string;
    changeAmount?: number;
    message?: string;
}

export interface PaymentStatusResponse {
    transactionId: string;
    status: PaymentStatus;
    message: string;
}

export interface ReceiptResponse {
    id: number;
    receiptNumber: string;
    transactionId: string;
    bookingReference: string;
    passengerName: string;
    flightDetails: string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
}

// ==================== PRICING ====================

export interface DynamicPriceResponse {
    flightId: number;
    cabinClass: CabinClass;
    basePrice: number;
    dynamicPrice: number;
    occupancyMultiplier: number;
    timeMultiplier: number;
    dayOfWeekMultiplier: number;
    totalMultiplier: number;
    priceIncrease: number;
    percentageIncrease: number;
    bookingDate: string;
}

export interface CalendarPriceResponse {
    from: string;
    to: string;
    month: string;
    cabinClass: CabinClass;
    prices: Record<string, number>; // date -> price
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
}

export interface RoundTripDiscountResponse {
    outboundFlightId: number;
    returnFlightId: number;
    cabinClass: CabinClass;
    outboundPrice: number;
    returnPrice: number;
    totalPriceWithoutDiscount: number;
    discount: number;
    discountAmount: number;
    totalPriceWithDiscount: number;
    savings: number;
    bookingDate: string;
}

// ==================== AUTH ====================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'ADMIN';
}

// ==================== PAGINATION ====================

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // current page
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ==================== ERROR RESPONSE ====================

export interface ErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
    validationErrors?: Record<string, string>;
}

// ==================== UI STATE ====================

export interface SearchFilters {
    priceRange: [number, number];
    airlines: string[];
    departureTime: 'morning' | 'afternoon' | 'evening' | 'night' | null;
    stops: 'direct' | 'one-stop' | 'any';
}
