package com.hyperlocal.category.internal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class CategoryDtos {

    private CategoryDtos() {
    }

    /** Matches the frontend ServiceCategory interface. */
    public record CategoryResponse(
            UUID id,
            String name,
            String slug,
            String description,
            String icon,
            BigDecimal basePrice,
            boolean active,
            String longDescription,
            List<String> includes,
            String estimatedDuration,
            List<String> whyUs,
            String tips) {
    }

    /** Matches CategoryPayload — used for create (all fields required). */
    public record CreateCategoryRequest(
            @NotBlank(message = "Enter a category name") String name,
            @NotNull(message = "Enter a description") String description,
            @NotBlank(message = "Choose an icon") String icon,
            @NotNull(message = "Enter a base price") @PositiveOrZero(message = "Base price cannot be negative") BigDecimal basePrice,
            @NotNull(message = "Set whether the category is active") Boolean active,
            String longDescription,
            List<String> includes,
            String estimatedDuration,
            List<String> whyUs,
            String tips) {
    }

    /** Matches Partial&lt;CategoryPayload&gt; — every field optional on update. */
    public record UpdateCategoryRequest(
            String name,
            String description,
            String icon,
            @PositiveOrZero(message = "Base price cannot be negative") BigDecimal basePrice,
            Boolean active,
            String longDescription,
            List<String> includes,
            String estimatedDuration,
            List<String> whyUs,
            String tips) {
    }
}
