package com.hyperlocal.review.internal;

import com.hyperlocal.common.ApiException;
import com.hyperlocal.common.AuthenticatedUser;
import com.hyperlocal.events.BookingCompleted;
import com.hyperlocal.events.ReviewSubmitted;
import com.hyperlocal.review.internal.dto.ReviewDtos.CreateReviewRequest;
import com.hyperlocal.review.internal.dto.ReviewDtos.ReviewResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviews;
    private final ReviewableBookingRepository reviewableBookings;
    private final ApplicationEventPublisher events;

    ReviewService(ReviewRepository reviews, ReviewableBookingRepository reviewableBookings,
            ApplicationEventPublisher events) {
        this.reviews = reviews;
        this.reviewableBookings = reviewableBookings;
        this.events = events;
    }

    /** BookingCompleted unlocks the booking for review. Synchronous. */
    @EventListener
    void unlockForReview(BookingCompleted event) {
        var b = event.snapshot().booking();
        if (reviewableBookings.findById(b.id()).isEmpty()) {
            reviewableBookings.save(new ReviewableBooking(
                    b.id(), b.customerId(), b.customerName(), b.providerId()));
        }
    }

    @Transactional
    public ReviewResponse create(AuthenticatedUser caller, CreateReviewRequest request) {
        ReviewableBooking rvb = reviewableBookings.findById(request.bookingId())
                .orElseThrow(() -> ApiException.badRequest("This booking can't be reviewed yet."));
        if (!rvb.getCustomerId().equals(caller.id())) {
            throw ApiException.forbidden("Only the booking's customer can review this job.");
        }
        if (rvb.isReviewed()) {
            throw ApiException.conflict("You have already reviewed this booking.");
        }
        if (reviews.existsByBookingId(request.bookingId())) {
            throw ApiException.conflict("A review already exists for this booking.");
        }

        Review review = new Review(
                UUID.randomUUID(),
                request.bookingId(),
                caller.id(),
                caller.name(),
                rvb.getProviderId(),
                request.rating(),
                request.comment());
        reviews.save(review);

        rvb.markReviewed();
        reviewableBookings.save(rvb);

        events.publishEvent(new ReviewSubmitted(
                review.getId(), review.getBookingId(), review.getProviderId(),
                caller.id(), review.getRating()));

        return toResponse(review, caller.name());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> byProvider(UUID providerId) {
        return reviews.findByProviderIdOrderByCreatedAtDesc(providerId).stream()
                .map(r -> toResponse(r, null))
                .toList();
    }

    private static ReviewResponse toResponse(Review review, String nameOverride) {
        return new ReviewResponse(
                review.getId(), review.getBookingId(), review.getProviderId(), review.getCustomerId(),
                nameOverride != null ? nameOverride : review.getCustomerName(),
                review.getRating(), review.getComment(), review.getCreatedAt());
    }
}
