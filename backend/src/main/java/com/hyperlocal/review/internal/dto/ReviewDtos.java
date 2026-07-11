package com.hyperlocal.review.internal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class ReviewDtos {

    private ReviewDtos() {
    }

    /** Matches the frontend Review interface exactly. */
    public record ReviewResponse(
            UUID id,
            UUID bookingId,
            UUID providerId,
            UUID customerId,
            String customerName,
            int rating,
            String comment,
            Instant createdAt) {
    }

    /** Matches CreateReviewPayload. */
    public record CreateReviewRequest(
            @NotNull(message = "bookingId is required") UUID bookingId,
            @Min(value = 1, message = "Rating must be between 1 and 5") @Max(value = 5, message = "Rating must be between 1 and 5") int rating,
            @NotNull(message = "Leave a comment") String comment) {
    }
}
