package com.hyperlocal.events;

import java.util.UUID;

/**
 * Published by the review module when a customer submits a review.
 * provider updates its rating aggregate; booking moves COMPLETED → RATED.
 */
public record ReviewSubmitted(
        UUID reviewId,
        UUID bookingId,
        UUID providerId,
        UUID customerId,
        int rating) {
}
