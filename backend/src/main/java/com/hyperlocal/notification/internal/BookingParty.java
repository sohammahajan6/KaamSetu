package com.hyperlocal.notification.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/** Who belongs to a booking — projected synchronously from BookingRequested. */
@Entity
@Table(name = "notification_booking_party")
public class BookingParty {

    @Id
    @Column(name = "booking_id")
    private UUID bookingId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "provider_user_id", nullable = false)
    private UUID providerUserId;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "provider_email", nullable = false)
    private String providerEmail;

    protected BookingParty() {
        // JPA
    }

    public BookingParty(UUID bookingId, UUID customerId, String customerName, String customerEmail,
            UUID providerUserId, String providerName, String providerEmail) {
        this.bookingId = bookingId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.providerUserId = providerUserId;
        this.providerName = providerName;
        this.providerEmail = providerEmail;
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

    public String getCustomerEmail() {
        return customerEmail;
    }

    public UUID getProviderUserId() {
        return providerUserId;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getProviderEmail() {
        return providerEmail;
    }
}
