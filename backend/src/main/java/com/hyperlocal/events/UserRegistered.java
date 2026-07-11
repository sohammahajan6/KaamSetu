package com.hyperlocal.events;

import java.util.UUID;

/**
 * Published by the user module on successful registration.
 *
 * @param categoryId the service category chosen at sign-up; only present when
 *                   {@code role} is PROVIDER (drives automatic profile creation)
 * @param areaLabel  the provider's service area (e.g. "Kothrud, Pune")
 * @param lat        provider's location latitude
 * @param lng        provider's location longitude
 */
public record UserRegistered(
        UUID userId,
        String name,
        String email,
        String phone,
        String role,
        UUID categoryId,
        String areaLabel,
        Double lat,
        Double lng) {
}
