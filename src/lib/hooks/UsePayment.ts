import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../api';
import type { CreatePaymentRequest } from '@/types';

export function useCreatePayment() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePaymentRequest) => api.payments.create(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['bookings', response.bookingReference] });
            toast.success('Payment processed successfully!');
            router.push(`/confirmation?ref=${response.bookingReference}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
        },
    });
}

export function usePaymentStatus(transactionId?: string) {
    return useQuery({
        queryKey: ['payments', 'status', transactionId],
        queryFn: () => api.payments.getStatus(transactionId!),
        enabled: !!transactionId,
        refetchInterval: 3000, // Poll every 3 seconds while pending
    });
}

export function usePaymentByBooking(bookingReference?: string) {
    return useQuery({
        queryKey: ['payments', 'booking', bookingReference],
        queryFn: () => api.payments.getByBooking(bookingReference!),
        enabled: !!bookingReference,
    });
}

export function useDownloadReceipt(bookingReference: string) {
    return useMutation({
        mutationFn: () => api.payments.downloadReceipt(bookingReference),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-${bookingReference}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Receipt downloaded successfully');
        },
        onError: () => {
            toast.error('Failed to download receipt');
        },
    });
}
