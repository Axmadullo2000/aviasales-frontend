import { apiClient } from '@/lib/api/Сlient';

import type {
    CreateBookingRequest,
    BookingResponse,
    BookingDetailResponse,
    CancelBookingRequest,
    Page,
} from '@/types';

export const bookingsApi = {
    create: async (request: CreateBookingRequest): Promise<BookingResponse> => {
        const response = await apiClient.post<BookingResponse>('/bookings', request);
        return response.data;
    },

    getByReference: async (reference: string): Promise<BookingDetailResponse> => {
        const response = await apiClient.get<BookingDetailResponse>(`/bookings/${reference}`);
        return response.data;
    },

    getUserBookings: async (page = 0, size = 10): Promise<Page<BookingResponse>> => {
        const response = await apiClient.get<Page<BookingResponse>>('/bookings', {
            params: { page, size },
        });
        return response.data;
    },

    confirm: async (reference: string): Promise<BookingResponse> => {
        const response = await apiClient.post<BookingResponse>(`/bookings/${reference}/confirm`);
        return response.data;
    },

    cancel: async (
        reference: string,
        request?: CancelBookingRequest
    ): Promise<BookingResponse> => {
        const response = await apiClient.delete<BookingResponse>(`/bookings/${reference}/cancel`, {
            data: request,
        });
        return response.data;
    },

    downloadTicket: async (reference: string): Promise<Blob> => {
        const response = await apiClient.get(`/bookings/${reference}/ticket`, {
            responseType: 'blob',
        });
        return response.data;
    },
};