/**
 * Post-completion reviews: submission (validates the booking is COMPLETED,
 * belongs to the caller, and has not already been reviewed), publication of
 * {@link com.hyperlocal.events.ReviewSubmitted}, and the public reviews
 * endpoint per provider. Listens to {@link com.hyperlocal.events.BookingCompleted}
 * to unlock the booking for review.
 */
package com.hyperlocal.review;
