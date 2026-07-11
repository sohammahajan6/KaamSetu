package com.hyperlocal.provider.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * The location geography column is written by native SQL in the repository
 * (JPA never binds spatial types); lat/lng are database-generated projections
 * of it, read-only here. That keeps PostGIS entirely behind this module.
 */
@Entity
@Table(name = "provider_profile")
public class ProviderProfile {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String name;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(nullable = false)
    private String bio;

    @Column(name = "years_experience", nullable = false)
    private int yearsExperience;

    @Column(name = "hourly_rate", nullable = false)
    private BigDecimal hourlyRate;

    @Column(insertable = false, updatable = false)
    private Double lat;

    @Column(insertable = false, updatable = false)
    private Double lng;

    @Column(name = "area_label", nullable = false)
    private String areaLabel;

    @Column(nullable = false)
    private double rating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    @Column(nullable = false)
    private boolean available;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus;

    @Column(name = "completed_jobs", nullable = false)
    private int completedJobs;

    protected ProviderProfile() {
        // JPA
    }

    public ProviderProfile(UUID id, UUID userId, String userEmail, String name, UUID categoryId) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.name = name;
        this.categoryId = categoryId;
        this.bio = "";
        this.yearsExperience = 0;
        this.hourlyRate = new BigDecimal("300");
        this.areaLabel = "Pune";
        this.rating = 0;
        this.reviewCount = 0;
        this.available = false;
        this.verificationStatus = "PENDING";
        this.completedJobs = 0;
    }

    public void applyUpdate(String bio, UUID categoryId, BigDecimal hourlyRate, Boolean available,
            Integer yearsExperience, String areaLabel) {
        if (bio != null) {
            this.bio = bio;
        }
        if (categoryId != null) {
            this.categoryId = categoryId;
        }
        if (hourlyRate != null) {
            this.hourlyRate = hourlyRate;
        }
        if (available != null) {
            this.available = available;
        }
        if (yearsExperience != null) {
            this.yearsExperience = yearsExperience;
        }
        if (areaLabel != null) {
            this.areaLabel = areaLabel;
        }
    }

    public void verify(boolean approved) {
        this.verificationStatus = approved ? "VERIFIED" : "REJECTED";
        if (approved) {
            this.available = true; // mirrors the mock's verifyProvider behaviour
        }
    }

    public void recordCompletedJob() {
        this.completedJobs++;
    }

    public void updateRating(double rating, int reviewCount) {
        this.rating = rating;
        this.reviewCount = reviewCount;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getName() {
        return name;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public String getBio() {
        return bio;
    }

    public int getYearsExperience() {
        return yearsExperience;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public Double getLat() {
        return lat;
    }

    public Double getLng() {
        return lng;
    }

    public String getAreaLabel() {
        return areaLabel;
    }

    public double getRating() {
        return rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public boolean isAvailable() {
        return available;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public int getCompletedJobs() {
        return completedJobs;
    }
}
