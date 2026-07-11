package com.hyperlocal.events;

/**
 * Published by the booking module when the provider marks the job complete.
 * review unlocks rating for it; provider increments its completed-jobs count.
 */
public record BookingCompleted(BookingSnapshot snapshot) {
}
