import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api';
import type { FlightSearchRequest, CabinClass } from '@/types';

export function useFlightSearch(params: FlightSearchRequest & { page?: number; size?: number }) {
    return useQuery({
        queryKey: ['flights', 'search', params],
        queryFn: () => api.flights.search(params),
        enabled: !!params.originCode && !!params.destinationCode && !!params.departureDate,
    });
}

export function useFlightDetail(flightId?: number) {
    return useQuery({
        queryKey: ['flights', flightId],
        queryFn: () => api.flights.getById(flightId!),
        enabled: !!flightId,
    });
}

export function useAirports() {
    return useQuery({
        queryKey: ['airports'],
        queryFn: () => api.flights.getAirports(),
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useAirportSearch(query: string) {
    return useQuery({
        queryKey: ['airports', 'search', query],
        queryFn: () => api.flights.searchAirports(query),
        enabled: query.length >= 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function usePopularDestinations(limit = 5) {
    return useQuery({
        queryKey: ['destinations', 'popular', limit],
        queryFn: () => api.flights.getPopularDestinations(limit),
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useAvailableSeats(flightId: number, cabinClass: CabinClass) {
    return useQuery({
        queryKey: ['flights', flightId, 'seats', cabinClass],
        queryFn: () => api.flights.getAvailableSeats(flightId, cabinClass),
    });
}

export function useDynamicPrice(
    flightId: number,
    cabinClass: CabinClass,
    bookingDate?: string
) {
    return useQuery({
        queryKey: ['pricing', 'dynamic', flightId, cabinClass, bookingDate],
        queryFn: () => api.pricing.getDynamicPrice(flightId, cabinClass, bookingDate),
    });
}
