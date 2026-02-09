import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../api';
import { useBookingStore } from '@/lib/store';
import type { CreateBookingRequest } from '@/types';

export function useCreateBooking() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const setBookingReference = useBookingStore((state) => state.setBookingReference);

    return useMutation({
        mutationFn: (data: CreateBookingRequest) => api.bookings.create(data),
        onSuccess: (response) => {
            setBookingReference(response.bookingReference);
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Booking created successfully!');
            router.push(`/payment?ref=${response.bookingReference}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        },
    });
}

export function useBookingDetail(reference?: string) {
    return useQuery({
        queryKey: ['bookings', reference],
        queryFn: () => api.bookings.getByReference(reference!),
        enabled: !!reference,
    });
}

export function useUserBookings(page = 0, size = 10) {
    return useQuery({
        queryKey: ['bookings', 'user', page, size],
        queryFn: () => api.bookings.getUserBookings(page, size),
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reference, reason }: { reference: string; reason?: string }) =>
            api.bookings.cancel(reference, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Booking cancelled successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        },
    });
}

export function useDownloadTicket(reference: string) {
    return useMutation({
        mutationFn: () => api.bookings.downloadTicket(reference),
        onSuccess: (blob) => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${reference}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Ticket downloaded successfully');
        },
        onError: () => {
            toast.error('Failed to download ticket');
        },
    });
}
