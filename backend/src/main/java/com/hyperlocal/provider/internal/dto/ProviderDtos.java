package com.hyperlocal.provider.internal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public final class ProviderDtos {

    private ProviderDtos() {
    }

    /**
     * Matches the frontend ProviderProfile interface exactly — flat lat/lng
     * numbers, not a nested location object (frontend contract wins over the
     * build doc's {lat,lng} object; flagged in the README).
     */
    public record ProviderResponse(
            UUID id,
            UUID userId,
            String name,
            UUID categoryId,
            String bio,
            int yearsExperience,
            BigDecimal hourlyRate,
            double lat,
            double lng,
            String areaLabel,
            double rating,
            int reviewCount,
            boolean available,
            String verificationStatus,
            int completedJobs) {
    }

    /**
     * Matches UpdateProviderProfilePayload plus optional fields the entity
     * supports (yearsExperience, areaLabel, lat/lng) for forward compatibility.
     */
    public record UpdateProviderRequest(
            String bio,
            UUID categoryId,
            @Positive(message = "Hourly rate must be positive") BigDecimal hourlyRate,
            Boolean available,
            @Min(value = 0, message = "Experience cannot be negative") Integer yearsExperience,
            String areaLabel,
            @Min(value = -90, message = "Invalid latitude") @Max(value = 90, message = "Invalid latitude") Double lat,
            @Min(value = -180, message = "Invalid longitude") @Max(value = 180, message = "Invalid longitude") Double lng) {
    }

    /** Body of PATCH /api/admin/providers/{id}/verify. */
    public record VerifyRequest(@jakarta.validation.constraints.NotNull(message = "Approve flag is required") Boolean approve) {
    }
}
