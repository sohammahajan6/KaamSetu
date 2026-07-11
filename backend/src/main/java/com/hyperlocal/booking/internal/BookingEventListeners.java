package com.hyperlocal.booking.internal;

import com.hyperlocal.booking.internal.snapshot.CategorySnapshot;
import com.hyperlocal.booking.internal.snapshot.CategorySnapshotRepository;
import com.hyperlocal.booking.internal.snapshot.ProviderSnapshot;
import com.hyperlocal.booking.internal.snapshot.ProviderSnapshotRepository;
import com.hyperlocal.events.CategoryDeleted;
import com.hyperlocal.events.CategoryUpserted;
import com.hyperlocal.events.PaymentCompleted;
import com.hyperlocal.events.ProviderUpserted;
import com.hyperlocal.events.ReviewSubmitted;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class BookingEventListeners {

    private static final Logger log = LoggerFactory.getLogger(BookingEventListeners.class);

    private final ProviderSnapshotRepository providerSnapshots;
    private final CategorySnapshotRepository categorySnapshots;
    private final BookingService bookingService;

    BookingEventListeners(ProviderSnapshotRepository providerSnapshots,
            CategorySnapshotRepository categorySnapshots, BookingService bookingService) {
        this.providerSnapshots = providerSnapshots;
        this.categorySnapshots = categorySnapshots;
        this.bookingService = bookingService;
    }

    /**
     * Snapshot projections update synchronously (same transaction as the
     * source change) so a just-registered provider or just-created category is
     * bookable the instant the originating request returns.
     */
    @EventListener
    void on(ProviderUpserted event) {
        providerSnapshots.save(new ProviderSnapshot(event.id(), event.userId(), event.name(),
                event.email(), event.categoryId(), event.hourlyRate(), event.available(),
                event.verificationStatus()));
    }

    @EventListener
    void on(CategoryUpserted event) {
        categorySnapshots.save(new CategorySnapshot(event.id(), event.name(), event.active()));
    }

    @EventListener
    void on(CategoryDeleted event) {
        categorySnapshots.deleteById(event.id());
    }

    /** Synchronous so the frontend's refetch right after createReview sees RATED. */
    @EventListener
    void on(ReviewSubmitted event) {
        bookingService.markRated(event.bookingId());
    }

    /**
     * When a customer's payment succeeds, record that on the booking so
     * the provider is allowed to mark the job COMPLETED.
     */
    @ApplicationModuleListener
    void on(PaymentCompleted event) {
        log.info("Payment {} completed for booking {} (amount {}). Marking booking as payment-received.",
                event.paymentId(), event.bookingId(), event.amount());
        bookingService.markPaymentReceived(event.bookingId());
    }
}
