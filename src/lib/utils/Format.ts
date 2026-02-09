import { format, parseISO, differenceInMinutes } from 'date-fns';

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string, formatStr = 'MMM dd, yyyy'): string {
    return format(parseISO(dateString), formatStr);
}

/**
 * Format time
 */
export function formatTime(dateString: string): string {
    return format(parseISO(dateString), 'HH:mm');
}

/**
 * Format date and time
 */
export function formatDateTime(dateString: string): string {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
}

/**
 * Calculate flight duration
 */
export function calculateDuration(departure: string, arrival: string): string {
    const minutes = differenceInMinutes(parseISO(arrival), parseISO(departure));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

/**
 * Format flight route
 */
export function formatRoute(origin: string, destination: string): string {
    return `${origin} → ${destination}`;
}

/**
 * Format passenger count
 */
export function formatPassengerCount(count: number): string {
    return count === 1 ? '1 passenger' : `${count} passengers`;
}

/**
 * Format cabin class
 */
export function formatCabinClass(cabinClass: string): string {
    return cabinClass
        .replace('_', ' ')
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Mask card number
 */
export function maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(value: string): string {
    return value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
}

/**
 * Format phone number
 */
export function formatPhoneNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
        return `+${match[1]} ${match[2]} ${match[3]}-${match[4]}-${match[5]}`;
    }
    return value;
}

/**
 * Get relative time (e.g., "in 2 hours", "3 days ago")
 */
export function getRelativeTime(dateString: string): string {
    const date = parseISO(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) {
        const absMins = Math.abs(diffMins);
        if (absMins < 60) return `${absMins} minutes ago`;
        if (absMins < 1440) return `${Math.floor(absMins / 60)} hours ago`;
        return `${Math.floor(absMins / 1440)} days ago`;
    } else {
        if (diffMins < 60) return `in ${diffMins} minutes`;
        if (diffMins < 1440) return `in ${Math.floor(diffMins / 60)} hours`;
        return `in ${Math.floor(diffMins / 1440)} days`;
    }
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}