/**
 * Booking lifecycle: creation, the status state machine, and per-role access.
 * Publishes {@link com.hyperlocal.events.BookingRequested},
 * {@link com.hyperlocal.events.BookingAccepted},
 * {@link com.hyperlocal.events.BookingStatusChanged} and
 * {@link com.hyperlocal.events.BookingCompleted}; listens to
 * {@link com.hyperlocal.events.ProviderUpserted}/{@link com.hyperlocal.events.CategoryUpserted}
 * (feeding its local snapshots), {@link com.hyperlocal.events.PaymentCompleted}
 * and {@link com.hyperlocal.events.ReviewSubmitted} (moves COMPLETED → RATED).
 */
package com.hyperlocal.booking;
