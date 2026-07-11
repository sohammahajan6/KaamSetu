package com.hyperlocal.booking.internal;

import com.hyperlocal.events.BookingPayload;
import com.hyperlocal.events.BookingStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Party names/emails are copied in at creation (event-carried state) — they
 * are what the frontend Booking interface exposes, and they freeze the booking
 * as it was made even if profiles change later.
 */
@Entity
@Table(name = "booking")
public class Booking {

    @Id
    private UUID id;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "provider_id", nullable = false)
    private UUID providerId;

    @Column(name = "provider_user_id", nullable = false)
    private UUID providerUserId;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "provider_email", nullable = false)
    private String providerEmail;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String notes;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "payment_received", nullable = false)
    private boolean paymentReceived;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Booking() {
        // JPA
    }

    public Booking(UUID id, UUID customerId, String customerName, String customerEmail,
            UUID providerId, UUID providerUserId, String providerName, String providerEmail,
            UUID categoryId, String categoryName, Instant scheduledAt, String address,
            String notes, BigDecimal price) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.providerId = providerId;
        this.providerUserId = providerUserId;
        this.providerName = providerName;
        this.providerEmail = providerEmail;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.status = BookingStatus.REQUESTED;
        this.scheduledAt = scheduledAt;
        this.address = address;
        this.notes = notes;
        this.price = price;
        this.paymentReceived = false;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void moveTo(BookingStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = Instant.now();
    }

    public BookingPayload toPayload() {
        return new BookingPayload(id, customerId, customerName, providerId, providerName,
                categoryId, categoryName, status, scheduledAt, address, notes, price,
                paymentReceived, createdAt, updatedAt);
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public UUID getProviderId() {
        return providerId;
    }

    public UUID getProviderUserId() {
        return providerUserId;
    }

    public String getProviderEmail() {
        return providerEmail;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public boolean isPaymentReceived() {
        return paymentReceived;
    }

    public void markPaymentReceived() {
        this.paymentReceived = true;
        this.updatedAt = Instant.now();
    }
}
