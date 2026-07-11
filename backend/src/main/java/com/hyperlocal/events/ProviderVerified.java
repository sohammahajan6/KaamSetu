package com.hyperlocal.events;

import java.util.UUID;

/** Published by the provider module when an admin approves or rejects a provider. */
public record ProviderVerified(
        UUID providerId,
        UUID userId,
        String name,
        String email,
        boolean approved) {
}
