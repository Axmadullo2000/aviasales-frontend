import { create } from 'zustand';
import type { FlightResponse, PassengerInfo, ContactInfo, CabinClass } from '../../types';

type BookingStep = 'search' | 'flight-select' | 'passengers' | 'payment' | 'confirmation';

interface BookingState {
    // Flow state
    step: BookingStep;

    // Search params
    searchParams: {
        from: string;
        to: string;
        date: string;
        passengers: number;
        cabinClass: CabinClass;
    } | null;

    // Selected flight
    selectedFlight: FlightResponse | null;

    // Passenger data
    passengers: PassengerInfo[];
    contactInfo: ContactInfo | null;
    specialRequests: string;

    // Booking reference after creation
    bookingReference: string | null;

    // Actions
    setStep: (step: BookingStep) => void;
    setSearchParams: (params: BookingState['searchParams']) => void;
    setSelectedFlight: (flight: FlightResponse) => void;
    setPassengers: (passengers: PassengerInfo[]) => void;
    setContactInfo: (contact: ContactInfo) => void;
    setSpecialRequests: (requests: string) => void;
    setBookingReference: (reference: string) => void;
    resetBooking: () => void;
}

const initialState = {
    step: 'search' as BookingStep,
    searchParams: null,
    selectedFlight: null,
    passengers: [],
    contactInfo: null,
    specialRequests: '',
    bookingReference: null,
};

export const useBookingStore = create<BookingState>((set) => ({
    ...initialState,

    setStep: (step) => set({ step }),

    setSearchParams: (searchParams) => set({ searchParams }),

    setSelectedFlight: (selectedFlight) => set({ selectedFlight, step: 'passengers' }),

    setPassengers: (passengers) => set({ passengers }),

    setContactInfo: (contactInfo) => set({ contactInfo }),

    setSpecialRequests: (specialRequests) => set({ specialRequests }),

    setBookingReference: (bookingReference) => set({ bookingReference }),

    resetBooking: () => set(initialState),
}));
