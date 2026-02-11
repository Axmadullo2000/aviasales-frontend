'use client';

import {Suspense, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {ArrowLeft, CreditCard, Download, Plane, X} from 'lucide-react';
import {Badge, Button, Card, Modal, Spinner, Textarea} from '@/components/ui';
import {Header} from '@/components/layout/Header';
import {useBookingDetail, useCancelBooking, useDownloadTicket} from '@/lib/hooks';
import {formatPrice} from '@/lib/utils/Format';
import type {TicketResponse} from '@/types';
import {BookingStatus, PaymentStatus} from '@/types';

const statusVariant: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    [BookingStatus.CONFIRMED]: 'success',
    [BookingStatus.PENDING]: 'warning',
    [BookingStatus.COMPLETED]: 'info',
    [BookingStatus.CANCELLED]: 'danger',
    [BookingStatus.EXPIRED]: 'default',
};

const statusLabel: Record<BookingStatus, string> = {
    [BookingStatus.CONFIRMED]: 'Confirmed',
    [BookingStatus.PENDING]: 'Pending Payment',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.CANCELLED]: 'Cancelled',
    [BookingStatus.EXPIRED]: 'Expired',
};

function BookingDetailContent() {
    const params = useParams();
    const router = useRouter();
    const reference = params.reference as string;

    const { data: booking, isLoading, error } = useBookingDetail(reference);
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
    const { mutate: downloadTicket, isPending: isDownloading } = useDownloadTicket(reference);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    const canCancel = booking?.status === BookingStatus.PENDING || booking?.status === BookingStatus.CONFIRMED;
    const canDownload = booking?.status === BookingStatus.CONFIRMED || booking?.status === BookingStatus.COMPLETED;
    const canPay = booking?.status === BookingStatus.PENDING && booking?.paymentStatus === PaymentStatus.PENDING;

    const handleCancelBooking = () => {
        if (!booking) return;
        if (cancellationReason.trim()) {
            cancelBooking({ reference: booking.bookingReference, reason: cancellationReason });
            setIsModalOpen(false);
        } else {
            alert("Please provide a reason for cancellation.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
                <p className="ml-4 text-gray-600">Loading booking details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <p className="text-red-600 font-medium mb-2">Failed to load booking</p>
                <p className="text-sm text-gray-500 mb-4">
                    {(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error'}
                </p>
                <Button onClick={() => router.push('/my-bookings')}>Back to Bookings</Button>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <p className="text-red-600 font-medium mb-4">Booking not found</p>
                <Button onClick={() => router.push('/my-bookings')}>Back to Bookings</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/my-bookings')}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                        className="mb-4"
                    >
                        Back to Bookings
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                            <p className="text-gray-500 mt-1">Reference: {booking.bookingReference}</p>
                        </div>
                        <Badge variant={statusVariant[booking.status]} size="md">
                            {statusLabel[booking.status]}
                        </Badge>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {booking.tickets && booking.tickets.length > 0 ? (
                            booking.tickets.map((ticket: TicketResponse, index: number) => (
                                <Card key={ticket.id || index} className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Plane className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Flight {index + 1}</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Passenger</p>
                                                <p className="font-semibold">
                                                    {ticket.passenger?.firstName} {ticket.passenger?.lastName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Seat</p>
                                                <p className="font-semibold">{ticket.seatNumber || 'Not assigned'}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t">
                                            {ticket.ticketNumber && (
                                                <div className="flex justify-between text-sm mt-2">
                                                    <span className="text-gray-600">Ticket Number:</span>
                                                    <span className="font-mono text-xs">{ticket.ticketNumber}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm mt-2">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-medium">{formatPrice(ticket.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Card className="p-6">
                                <p className="text-gray-500 text-center">No ticket information available</p>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 sticky top-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Payment Summary
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-bold text-blue-600 text-lg">
                                        {formatPrice(booking.totalAmount)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                {canPay && (
                                    <Button className="w-full" onClick={() => router.push(`/payment?ref=${booking.bookingReference}`)}>
                                        Pay Now
                                    </Button>
                                )}
                                {canDownload && (
                                    <Button variant="outline" className="w-full" isLoading={isDownloading} onClick={() => downloadTicket()} leftIcon={<Download className="w-4 h-4" />}>
                                        Download Ticket
                                    </Button>
                                )}
                                {canCancel && (
                                    <Button variant="danger" className="w-full" isLoading={isCancelling} onClick={() => setIsModalOpen(true)} leftIcon={<X className="w-4 h-4" />}>
                                        Cancel Booking
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Reason for Cancellation</h3>
                        <Textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Please enter the reason for cancellation"
                            rows={4}
                        />
                        <div className="mt-4 flex justify-end space-x-4">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleCancelBooking} isLoading={isCancelling}>Confirm Cancellation</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default function BookingDetailPage() {
    return (
        <div>
            <Header />
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>}>
                <BookingDetailContent />
            </Suspense>
        </div>
    );
}
