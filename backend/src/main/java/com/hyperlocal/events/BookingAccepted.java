package com.hyperlocal.events;

/** Published by the booking module when the provider accepts a request. */
public record BookingAccepted(BookingSnapshot snapshot) {
}
