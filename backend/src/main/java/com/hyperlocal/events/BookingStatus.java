package com.hyperlocal.events;

/** Mirrors the frontend's BookingStatus union exactly (src/types/index.ts). */
public enum BookingStatus {
    REQUESTED,
    ACCEPTED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    RATED
}
