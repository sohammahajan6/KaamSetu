package com.hyperlocal.events;

/**
 * Published by the booking module on every status transition (including the
 * ones that also emit a dedicated event). notification fans this out as email
 * and as an SSE push of {@link BookingSnapshot#booking()}.
 */
public record BookingStatusChanged(BookingSnapshot snapshot, BookingStatus previousStatus) {
}
