package com.hyperlocal.events;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Published by the provider module whenever a profile is created or changed.
 * Carries everything downstream snapshots (booking module) need to price and
 * label bookings without querying provider tables.
 */
public record ProviderUpserted(
        UUID id,
        UUID userId,
        String name,
        String email,
        UUID categoryId,
        BigDecimal hourlyRate,
        boolean available,
        String verificationStatus) {
}
