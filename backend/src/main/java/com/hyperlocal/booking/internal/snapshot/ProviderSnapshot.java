package com.hyperlocal.booking.internal.snapshot;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Local, event-fed copy of the provider facts the booking module needs at
 * creation time (ProviderUpserted keeps it current). This is how the module
 * prices and labels bookings without ever touching provider tables.
 */
@Entity
@Table(name = "booking_provider_snapshot")
public class ProviderSnapshot {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "hourly_rate", nullable = false)
    private BigDecimal hourlyRate;

    @Column(nullable = false)
    private boolean available;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus;

    protected ProviderSnapshot() {
        // JPA
    }

    public ProviderSnapshot(UUID id, UUID userId, String name, String email, UUID categoryId,
            BigDecimal hourlyRate, boolean available, String verificationStatus) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.categoryId = categoryId;
        this.hourlyRate = hourlyRate;
        this.available = available;
        this.verificationStatus = verificationStatus;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public boolean isAvailable() {
        return available;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }
}
