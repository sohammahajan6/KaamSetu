package com.hyperlocal.booking.internal.snapshot;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/** Event-fed copy of category id/name/active (CategoryUpserted/CategoryDeleted). */
@Entity
@Table(name = "booking_category_snapshot")
public class CategorySnapshot {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean active;

    protected CategorySnapshot() {
        // JPA
    }

    public CategorySnapshot(UUID id, String name, boolean active) {
        this.id = id;
        this.name = name;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isActive() {
        return active;
    }
}
