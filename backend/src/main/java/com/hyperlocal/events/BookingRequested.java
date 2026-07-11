package com.hyperlocal.events;

/**
 * Published by the booking module when a customer creates a booking.
 * payment reacts by creating a pending order; notification projects the
 * booking parties and notifies the provider.
 */
public record BookingRequested(BookingSnapshot snapshot) {
}
