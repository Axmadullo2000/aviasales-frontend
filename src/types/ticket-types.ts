// Add this to your existing types file or create if missing

import {BookingStatus, PaymentStatus} from "@/types/index";

export interface TicketResponse {
    id: number;
    ticketNumber: string;
    flightNumber: string;
    passengerName: string;
    seatNumber?: string;
    cabinClass: string;
    price: number;
    origin?: {
        iataCode: string;
        city: string;
        name: string;
    };
    destination?: {
        iataCode: string;
        city: string;
        name: string;
    };
    departureTime?: string;
    arrivalTime?: string;
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
    expiresAt?: string;
    confirmedAt?: string;
    contactInfo: {
        email: string;
        phone: string;
    };
    specialRequests?: string;
    tickets: TicketResponse[];
}
