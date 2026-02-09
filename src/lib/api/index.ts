import { authApi } from './endpoints/Auth';
import { flightsApi } from './endpoints/Flights';
import { bookingsApi } from './endpoints/Bookings';
import { paymentsApi, pricingApi } from './endpoints/Payments';

/**
 * Unified API object
 *
 * Usage:
 * import { api } from '@/lib/api';
 * const flights = await api.flights.search(params);
 * const booking = await api.bookings.create(data);
 */
export const api = {
    auth: authApi,
    flights: flightsApi,
    bookings: bookingsApi,
    payments: paymentsApi,
    pricing: pricingApi,
};

// Export individual APIs for flexibility
export { authApi, flightsApi, bookingsApi, paymentsApi, pricingApi };
