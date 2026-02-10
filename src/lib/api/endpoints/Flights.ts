import { apiClient } from '@/lib/api/Сlient';

import type {
    FlightSearchRequest,
    FlightResponse,
    FlightDetailResponse,
    Airport,
    Airline,
    PopularDestinationResponse,
    RoundTripSearchRequest,
    RoundTripSearchResponse,
    RoundTripDiscountResponse,
    AvailableSeatsResponse,
    Page,
    CabinClass,
} from '@/types';

export const flightsApi = {
    search: async (
        params: FlightSearchRequest & { page?: number; size?: number }
    ): Promise<Page<FlightResponse>> => {
        const response = await apiClient.get<Page<FlightResponse>>('/flights/search', {
            params: {
                from: params.originCode,
                to: params.destinationCode,
                date: params.departureDate,
                passengers: params.passengers,
                cabinClass: params.cabinClass,
                sortBy: params.sortBy || 'PRICE',
                page: params.page || 0,
                size: params.size || 10,
            },
        });
        return response.data;
    },

    getById: async (id: number): Promise<FlightDetailResponse> => {
        const response = await apiClient.get<FlightDetailResponse>(`/flights/${id}`);
        return response.data;
    },

    getByNumber: async (flightNumber: string): Promise<FlightDetailResponse> => {
        const response = await apiClient.get<FlightDetailResponse>(`/flights/number/${flightNumber}`);
        return response.data;
    },

    getAirports: async (): Promise<Airport[]> => {
        const response = await apiClient.get<Airport[]>('/flights/airports');
        return response.data;
    },

    searchAirports: async (query: string): Promise<Airport[]> => {
        const response = await apiClient.get<Airport[]>('/flights/airports/search', {
            params: { query },
        });
        return response.data;
    },

    getAirport: async (iataCode: string): Promise<Airport> => {
        const response = await apiClient.get<Airport>(`/flights/airports/${iataCode}`);
        return response.data;
    },

    getAirlines: async (): Promise<Airline[]> => {
        const response = await apiClient.get<Airline[]>('/flights/airlines');
        return response.data;
    },

    getAirline: async (iataCode: string): Promise<Airline> => {
        const response = await apiClient.get<Airline>(`/flights/airlines/${iataCode}`);
        return response.data;
    },

    getPopularDestinations: async (limit = 5): Promise<PopularDestinationResponse[]> => {
        const response = await apiClient.get<PopularDestinationResponse[]>(
            '/flights/popular-destinations',
            { params: { limit } }
        );
        return response.data;
    },

    getAvailableSeats: async (
        flightId: number,
        cabinClass: CabinClass
    ): Promise<AvailableSeatsResponse> => {
        const response = await apiClient.get<AvailableSeatsResponse>(
            `/flights/${flightId}/seats`,
            { params: { cabinClass } }
        );
        return response.data;
    },

    // Round trip
    searchRoundTrip: async (request: RoundTripSearchRequest): Promise<RoundTripSearchResponse> => {
        const response = await apiClient.post<RoundTripSearchResponse>(
            '/flights/round-trip/search',
            request
        );
        return response.data;
    },

    getRoundTripDiscount: async (
        outboundFlightId: number,
        returnFlightId: number,
        cabinClass: CabinClass,
        bookingDate?: string
    ): Promise<RoundTripDiscountResponse> => {
        const response = await apiClient.get<RoundTripDiscountResponse>(
            '/flights/round-trip/discount',
            {
                params: {
                    outboundFlightId,
                    returnFlightId,
                    cabinClass,
                    bookingDate,
                },
            }
        );
        return response.data;
    },
};