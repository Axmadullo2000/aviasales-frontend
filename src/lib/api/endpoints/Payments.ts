import { apiClient } from '@/lib/api/Сlient';

import type {
    CreatePaymentRequest,
    PaymentResponse,
    PaymentStatusResponse,
    ReceiptResponse,
    DynamicPriceResponse,
    CalendarPriceResponse,
    CabinClass,
} from '@/types';

export const paymentsApi = {
    create: async (request: CreatePaymentRequest): Promise<PaymentResponse> => {
        const response = await apiClient.post<PaymentResponse>('/payments', request);
        return response.data;
    },

    getStatus: async (transactionId: string): Promise<PaymentStatusResponse> => {
        const response = await apiClient.get<PaymentStatusResponse>(`/payments/status/${transactionId}`);
        return response.data;
    },

    getByBooking: async (bookingReference: string): Promise<PaymentResponse> => {
        const response = await apiClient.get<PaymentResponse>(`/payments/booking/${bookingReference}`);
        return response.data;
    },

    getReceipt: async (bookingReference: string): Promise<ReceiptResponse> => {
        const response = await apiClient.get<ReceiptResponse>(`/payments/receipt/${bookingReference}`);
        return response.data;
    },

    downloadReceipt: async (bookingReference: string): Promise<Blob> => {
        const response = await apiClient.get(`/payments/receipt/${bookingReference}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
};

export const pricingApi = {
    getDynamicPrice: async (
        flightId: number,
        cabinClass: CabinClass,
        bookingDate?: string
    ): Promise<DynamicPriceResponse> => {
        const response = await apiClient.get<DynamicPriceResponse>(`/pricing/flights/${flightId}`, {
            params: { cabinClass, bookingDate },
        });
        return response.data;
    },

    getCalendar: async (
        from: string,
        to: string,
        month: string, // YYYY-MM
        cabinClass: CabinClass
    ): Promise<CalendarPriceResponse> => {
        const response = await apiClient.get<CalendarPriceResponse>('/pricing/calendar', {
            params: { from, to, month, cabinClass },
        });
        return response.data;
    },

    getBestPrices: async (
        from: string,
        to: string,
        cabinClass: CabinClass
    ): Promise<{
        currentMonth: CalendarPriceResponse;
        nextMonth: CalendarPriceResponse;
        twoMonthsAhead: CalendarPriceResponse;
    }> => {
        const response = await apiClient.get('/pricing/best-prices', {
            params: { from, to, cabinClass },
        });
        return response.data;
    },
};
