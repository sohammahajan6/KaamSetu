package com.hyperlocal.review.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/**
 * Event-fed projection of bookings that are unlocked for review. A row is
 * inserted by the {@link com.hyperlocal.events.BookingCompleted} listener;
 * {@code reviewed} flips to true when a review is submitted.
 */
@Entity
@Table(name = "review_booking_snapshot")
public class ReviewableBooking {

    @Id
    @Column(name = "booking_id")
    private UUID bookingId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "provider_id", nullable = false)
    private UUID providerId;

    @Column(nullable = false)
    private boolean reviewed;

    protected ReviewableBooking() {
        // JPA
    }

    public ReviewableBooking(UUID bookingId, UUID customerId, String customerName, UUID providerId) {
        this.bookingId = bookingId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.providerId = providerId;
        this.reviewed = false;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public UUID getProviderId() {
        return providerId;
    }

    public boolean isReviewed() {
        return reviewed;
    }

    public void markReviewed() {
        this.reviewed = true;
    }
}
