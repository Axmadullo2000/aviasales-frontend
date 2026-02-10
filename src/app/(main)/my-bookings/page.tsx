'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Calendar, Clock, ChevronRight, Download, X, RefreshCw } from 'lucide-react';
import { Card, Badge, Button, Spinner } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { useUserBookings, useCancelBooking, useDownloadTicket } from '@/lib/hooks';
import { formatDate, formatPrice } from '@/lib/utils/Format';
import { BookingStatus, PaymentStatus } from '@/types';
import type { BookingResponse } from '@/types';

const statusVariant: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    [BookingStatus.CONFIRMED]: 'success',
    [BookingStatus.PENDING]: 'warning',
    [BookingStatus.COMPLETED]: 'info',
    [BookingStatus.CANCELLED]: 'danger',
    [BookingStatus.EXPIRED]: 'default',
};

const statusLabel: Record<BookingStatus, string> = {
    [BookingStatus.CONFIRMED]: 'Confirmed',
    [BookingStatus.PENDING]: 'Pending',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.CANCELLED]: 'Cancelled',
    [BookingStatus.EXPIRED]: 'Expired',
};

const paymentLabel: Record<PaymentStatus, string> = {
    [PaymentStatus.COMPLETED]: 'Paid',
    [PaymentStatus.PENDING]: 'Unpaid',
    [PaymentStatus.PROCESSING]: 'Processing',
    [PaymentStatus.FAILED]: 'Failed',
    [PaymentStatus.REFUNDED]: 'Refunded',
};

function BookingCard({ booking }: { booking: BookingResponse }) {
    const router = useRouter();
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
    const { mutate: downloadTicket, isPending: isDownloading } = useDownloadTicket(booking.bookingReference);

    const canCancel = booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED;
    const canDownload = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED;
    const canPay = booking.status === BookingStatus.PENDING && booking.paymentStatus === PaymentStatus.PENDING;

    return (
        <Card className="hover:shadow-md transition-shadow" padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left: booking info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg">
                  {booking.bookingReference}
                </span>
                                <Badge variant={statusVariant[booking.status]} size="sm">
                                    {statusLabel[booking.status]}
                                </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                                {booking.totalPassengers} passenger{booking.totalPassengers > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(booking.createdAt, 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>
                {booking.status === BookingStatus.PENDING
                    ? `Expires: ${formatDate(booking.expiresAt, 'HH:mm, MMM dd')}`
                    : `Created: ${formatDate(booking.createdAt, 'HH:mm')}`}
              </span>
                        </div>
                        <div className="text-gray-600">
                            Payment:{' '}
                            <span
                                className={
                                    booking.paymentStatus === PaymentStatus.COMPLETED
                                        ? 'text-green-600 font-medium'
                                        : 'text-orange-600 font-medium'
                                }
                            >
                {paymentLabel[booking.paymentStatus]}
              </span>
                        </div>
                    </div>
                </div>

                {/* Right: price + actions */}
                <div className="flex flex-col items-end gap-3 sm:min-w-[160px]">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(booking.totalAmount)}
                        </div>
                        {booking.amountDue > 0 && (
                            <div className="text-sm text-orange-600">
                                Due: {formatPrice(booking.amountDue)}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        {canPay && (
                            <Button
                                size="sm"
                                onClick={() => router.push(`/payment?ref=${booking.bookingReference}`)}
                            >
                                Pay Now
                            </Button>
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/my-bookings/${booking.bookingReference}`)}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            Details
                        </Button>

                        {canDownload && (
                            <Button
                                size="sm"
                                variant="ghost"
                                isLoading={isDownloading}
                                onClick={() => downloadTicket()}
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        )}

                        {canCancel && (
                            <Button
                                size="sm"
                                variant="danger"
                                isLoading={isCancelling}
                                onClick={() =>
                                    cancelBooking({ reference: booking.bookingReference, reason: 'User cancelled' })
                                }
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function MyBookingsPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading, error, refetch } = useUserBookings(page, 10);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                            <p className="text-gray-500 mt-1">View and manage your flight bookings</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => refetch()}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <Spinner size="lg" />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <Card className="p-8 text-center">
                            <p className="text-red-600 font-medium mb-4">Failed to load bookings</p>
                            <Button onClick={() => refetch()}>Try Again</Button>
                        </Card>
                    )}

                    {/* Empty */}
                    {!isLoading && !error && data?.content.length === 0 && (
                        <Card className="p-12 text-center">
                            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h2>
                            <p className="text-gray-500 mb-6">Start by searching for flights</p>
                            <Button onClick={() => (window.location.href = '/')}>Search Flights</Button>
                        </Card>
                    )}

                    {/* Bookings list */}
                    {!isLoading && data && data.content.length > 0 && (
                        <>
                            <div className="space-y-4">
                                {data.content.map((booking: BookingResponse) => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={data.first}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-gray-600">
                    Page {data.number + 1} of {data.totalPages}
                  </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={data.last}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}