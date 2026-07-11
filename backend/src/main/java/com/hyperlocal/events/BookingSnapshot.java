package com.hyperlocal.events;

import java.util.UUID;

/**
 * A booking event envelope: the API-shaped payload plus the routing data other
 * modules need (the provider's user id and both parties' emails) so listeners
 * never have to query another module's tables.
 */
public record BookingSnapshot(
        BookingPayload booking,
        UUID providerUserId,
        String customerEmail,
        String providerEmail) {
}
