package com.hyperlocal.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Exactly the frontend's {@code Booking} interface (src/types/index.ts) — field
 * names and casing included. Used as the REST response body of the booking
 * endpoints, as the event payload, and as the SSE frame body, so all three can
 * never drift apart.
 */
public record BookingPayload(
        UUID id,
        UUID customerId,
        String customerName,
        UUID providerId,
        String providerName,
        UUID categoryId,
        String categoryName,
        BookingStatus status,
        Instant scheduledAt,
        String address,
        String notes,
        BigDecimal price,
        boolean paymentReceived,
        Instant createdAt,
        Instant updatedAt) {
}
