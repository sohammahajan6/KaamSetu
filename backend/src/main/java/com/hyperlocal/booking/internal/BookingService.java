package com.hyperlocal.booking.internal;

import com.hyperlocal.booking.internal.snapshot.CategorySnapshot;
import com.hyperlocal.booking.internal.snapshot.CategorySnapshotRepository;
import com.hyperlocal.booking.internal.snapshot.ProviderSnapshot;
import com.hyperlocal.booking.internal.snapshot.ProviderSnapshotRepository;
import com.hyperlocal.common.ApiException;
import com.hyperlocal.common.AuthenticatedUser;
import com.hyperlocal.events.BookingAccepted;
import com.hyperlocal.events.BookingCompleted;
import com.hyperlocal.events.BookingPayload;
import com.hyperlocal.events.BookingRequested;
import com.hyperlocal.events.BookingSnapshot;
import com.hyperlocal.events.BookingStatus;
import com.hyperlocal.events.BookingStatusChanged;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookings;
    private final ProviderSnapshotRepository providerSnapshots;
    private final CategorySnapshotRepository categorySnapshots;
    private final ApplicationEventPublisher events;

    BookingService(BookingRepository bookings, ProviderSnapshotRepository providerSnapshots,
            CategorySnapshotRepository categorySnapshots, ApplicationEventPublisher events) {
        this.bookings = bookings;
        this.providerSnapshots = providerSnapshots;
        this.categorySnapshots = categorySnapshots;
        this.events = events;
    }

    @Transactional
    public BookingPayload create(AuthenticatedUser customer, UUID providerId, Instant scheduledAt,
            String address, String notes) {
        // Validate provider exists
        ProviderSnapshot provider = providerSnapshots.findById(providerId)
                .orElseThrow(() -> ApiException.badRequest("Invalid booking request."));

        // Validate provider is verified
        if (!"VERIFIED".equals(provider.getVerificationStatus())) {
            throw ApiException.badRequest("This provider is not yet verified and cannot accept bookings.");
        }

        // Validate provider is available
        if (!provider.isAvailable()) {
            throw ApiException.badRequest("This provider is currently not accepting new bookings.");
        }

        // Validate not booking yourself
        if (provider.getUserId().equals(customer.id())) {
            throw ApiException.badRequest("You can't book yourself.");
        }

        // Validate schedule is in the future (at least 1 hour from now)
        Instant now = Instant.now();
        if (scheduledAt.isBefore(now.plusSeconds(3600))) {
            throw ApiException.badRequest("Bookings must be scheduled at least 1 hour in advance.");
        }

        // Validate schedule is within reasonable hours (6 AM – 10 PM IST)
        LocalTime time = scheduledAt.atZone(ZoneId.of("Asia/Kolkata")).toLocalTime();
        if (time.isBefore(LocalTime.of(6, 0)) || time.isAfter(LocalTime.of(22, 0))) {
            throw ApiException.badRequest("Bookings can only be scheduled between 6:00 AM and 10:00 PM.");
        }

        // Validate no duplicate active booking with same provider
        if (bookings.existsByCustomerIdAndProviderIdAndStatusIn(
                customer.id(),
                provider.getId(),
                List.of(BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS))) {
            throw ApiException.conflict(
                    "You already have an active booking with this provider. Complete or cancel it first.");
        }

        // Prevent double booking: check if provider already has a booking within 2 hours of scheduledAt
        if (bookings.existsConflictingBooking(
                provider.getId(),
                List.of(BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS),
                scheduledAt.minusSeconds(7200),
                scheduledAt.plusSeconds(7200))) {
            throw ApiException.conflict("This technician is already booked during this time. Please select another time or another technician.");
        }

        String categoryName = categorySnapshots.findById(provider.getCategoryId())
                .map(CategorySnapshot::getName)
                .orElse("Service");

        Booking booking = new Booking(
                UUID.randomUUID(),
                customer.id(), customer.name(), customer.email(),
                provider.getId(), provider.getUserId(), provider.getName(), provider.getEmail(),
                provider.getCategoryId(), categoryName,
                scheduledAt, address, notes == null ? "" : notes,
                provider.getHourlyRate());
        bookings.save(booking);

        events.publishEvent(new BookingRequested(snapshotOf(booking)));
        return booking.toPayload();
    }

    /**
     * Auto-assign: the system picks the best available provider for the given
     * category based on distance, rating, and current workload.
     */
    @Transactional
    public BookingPayload createAutoAssign(AuthenticatedUser customer, UUID categoryId,
            Instant scheduledAt, String address, String notes, Double lat, Double lng) {

        // Validate schedule is in the future (at least 1 hour from now)
        Instant now = Instant.now();
        if (scheduledAt.isBefore(now.plusSeconds(3600))) {
            throw ApiException.badRequest("Bookings must be scheduled at least 1 hour in advance.");
        }

        // Validate schedule is within reasonable hours (6 AM – 10 PM IST)
        LocalTime time = scheduledAt.atZone(ZoneId.of("Asia/Kolkata")).toLocalTime();
        if (time.isBefore(LocalTime.of(6, 0)) || time.isAfter(LocalTime.of(22, 0))) {
            throw ApiException.badRequest("Bookings can only be scheduled between 6:00 AM and 10:00 PM.");
        }

        // Fall back to Pune city centre if no coordinates provided
        double customerLat = lat != null ? lat : 18.5204;
        double customerLng = lng != null ? lng : 73.8567;

        List<ProviderSnapshot> best = providerSnapshots.findBestAvailable(
                categoryId, customerLat, customerLng, customer.id());

        if (best.isEmpty()) {
            throw ApiException.notFound(
                    "No available technicians found for this service right now. Please try again later.");
        }

        ProviderSnapshot provider = null;
        for (ProviderSnapshot candidate : best) {
            // Check if this candidate is double booked for the requested time
            boolean hasConflict = bookings.existsConflictingBooking(
                    candidate.getId(),
                    List.of(BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS),
                    scheduledAt.minusSeconds(7200),
                    scheduledAt.plusSeconds(7200));
            if (!hasConflict) {
                provider = candidate;
                break;
            }
        }

        if (provider == null) {
            throw ApiException.notFound(
                    "All available technicians are busy at that time. Please pick another time.");
        }

        // Validate no duplicate active booking with the chosen provider
        if (bookings.existsByCustomerIdAndProviderIdAndStatusIn(
                customer.id(),
                provider.getId(),
                List.of(BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS))) {
            throw ApiException.conflict(
                    "You already have an active booking with the assigned provider. Complete or cancel it first.");
        }

        String categoryName = categorySnapshots.findById(provider.getCategoryId())
                .map(CategorySnapshot::getName)
                .orElse("Service");

        Booking booking = new Booking(
                UUID.randomUUID(),
                customer.id(), customer.name(), customer.email(),
                provider.getId(), provider.getUserId(), provider.getName(), provider.getEmail(),
                provider.getCategoryId(), categoryName,
                scheduledAt, address, notes == null ? "" : notes,
                provider.getHourlyRate());
        bookings.save(booking);

        events.publishEvent(new BookingRequested(snapshotOf(booking)));
        return booking.toPayload();
    }

    @Transactional(readOnly = true)
    public List<BookingPayload> mine(AuthenticatedUser caller) {
        List<Booking> list = switch (caller.role()) {
            case "PROVIDER" -> bookings.findByProviderUserIdOrderByCreatedAtDesc(caller.id());
            case "ADMIN" -> bookings.findAllByOrderByCreatedAtDesc();
            default -> bookings.findByCustomerIdOrderByCreatedAtDesc(caller.id());
        };
        return list.stream().map(Booking::toPayload).toList();
    }

    @Transactional(readOnly = true)
    public BookingPayload get(AuthenticatedUser caller, UUID id) {
        return requireParty(caller, id).toPayload();
    }

    @Transactional
    public BookingPayload updateStatus(AuthenticatedUser caller, UUID id, BookingStatus target) {
        Booking booking = requireParty(caller, id);
        boolean isCustomer = booking.getCustomerId().equals(caller.id());
        boolean isProvider = booking.getProviderUserId().equals(caller.id());

        if (target == BookingStatus.RATED) {
            throw ApiException.badRequest("A booking becomes RATED by submitting a review.");
        }
        if (!caller.isAdmin() && !BookingStateMachine.roleMayTrigger(target, isCustomer, isProvider)) {
            throw ApiException.forbidden(switch (target) {
                case ACCEPTED -> "Only the provider can accept a booking.";
                case IN_PROGRESS, COMPLETED -> "Only the provider can update job progress.";
                default -> "You can't make this change.";
            });
        }
        if (!BookingStateMachine.canTransition(booking.getStatus(), target)) {
            throw ApiException.conflict(BookingStateMachine.describeInvalid(booking.getStatus(), target));
        }

        // Require payment before the provider can mark the job complete
        if (target == BookingStatus.COMPLETED && !booking.isPaymentReceived()) {
            throw ApiException.conflict(
                    "The customer must complete payment before the job can be marked as done.");
        }

        // Prevent cancellation of a booking that has already been paid for
        if (target == BookingStatus.CANCELLED && booking.isPaymentReceived()) {
            throw ApiException.conflict("You cannot cancel a booking that has already been paid for. Please contact support for a refund.");
        }

        BookingStatus previous = booking.getStatus();
        booking.moveTo(target);
        bookings.save(booking);

        BookingSnapshot snapshot = snapshotOf(booking);
        events.publishEvent(new BookingStatusChanged(snapshot, previous));
        if (target == BookingStatus.ACCEPTED) {
            events.publishEvent(new BookingAccepted(snapshot));
        }
        if (target == BookingStatus.COMPLETED) {
            events.publishEvent(new BookingCompleted(snapshot));
        }
        return booking.toPayload();
    }

    @Transactional
    public void markRated(UUID bookingId) {
        bookings.findById(bookingId).ifPresent(booking -> {
            if (BookingStateMachine.canTransition(booking.getStatus(), BookingStatus.RATED)) {
                BookingStatus previous = booking.getStatus();
                booking.moveTo(BookingStatus.RATED);
                bookings.save(booking);
                events.publishEvent(new BookingStatusChanged(snapshotOf(booking), previous));
            }
        });
    }

    /**
     * Called when the payment module confirms a successful payment.
     * Sets the paymentReceived flag so the provider can later mark the job
     * as COMPLETED.
     */
    @Transactional
    public void markPaymentReceived(UUID bookingId) {
        bookings.findById(bookingId).ifPresent(booking -> {
            if (!booking.isPaymentReceived()) {
                booking.markPaymentReceived();
                bookings.save(booking);
            }
        });
    }

    private Booking requireParty(AuthenticatedUser caller, UUID id) {
        Booking booking = bookings.findById(id)
                .orElseThrow(() -> ApiException.notFound("Booking not found."));
        boolean party = booking.getCustomerId().equals(caller.id())
                || booking.getProviderUserId().equals(caller.id());
        if (!party && !caller.isAdmin()) {
            throw ApiException.forbidden("You don't have access to this booking.");
        }
        return booking;
    }

    private static BookingSnapshot snapshotOf(Booking booking) {
        return new BookingSnapshot(booking.toPayload(), booking.getProviderUserId(),
                booking.getCustomerEmail(), booking.getProviderEmail());
    }
}
