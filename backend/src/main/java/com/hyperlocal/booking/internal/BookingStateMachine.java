package com.hyperlocal.booking.internal;

import com.hyperlocal.events.BookingStatus;
import java.util.Map;
import java.util.Set;

/**
 * Transition rules for the booking lifecycle:
 *
 * <pre>
 * REQUESTED ──→ ACCEPTED ──→ IN_PROGRESS ──→ COMPLETED ──→ RATED
 *     │             │
 *     └──→ CANCELLED ←┘
 * </pre>
 *
 * Cancellation is allowed while the job hasn't started (REQUESTED by either
 * party, ACCEPTED); the mock UI offers customer-cancel at REQUESTED and
 * provider-decline at REQUESTED. Who may trigger which transition is enforced
 * here as well, from the caller's role.
 */
public final class BookingStateMachine {

    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED = Map.of(
            BookingStatus.REQUESTED, Set.of(BookingStatus.ACCEPTED, BookingStatus.CANCELLED),
            BookingStatus.ACCEPTED, Set.of(BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED),
            BookingStatus.IN_PROGRESS, Set.of(BookingStatus.COMPLETED),
            BookingStatus.COMPLETED, Set.of(BookingStatus.RATED),
            BookingStatus.CANCELLED, Set.of(),
            BookingStatus.RATED, Set.of());

    private BookingStateMachine() {
    }

    public static boolean canTransition(BookingStatus from, BookingStatus to) {
        return ALLOWED.getOrDefault(from, Set.of()).contains(to);
    }

    /**
     * Role gate per target status. RATED is deliberately absent: it is never
     * set through the status endpoint, only via the review flow.
     */
    public static boolean roleMayTrigger(BookingStatus target, boolean isCustomer, boolean isProvider) {
        return switch (target) {
            case ACCEPTED, IN_PROGRESS, COMPLETED -> isProvider;
            case CANCELLED -> isCustomer || isProvider;
            default -> false;
        };
    }

    public static String describeInvalid(BookingStatus from, BookingStatus to) {
        return "A booking can't go from " + from + " to " + to + ".";
    }
}
