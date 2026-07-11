package com.hyperlocal.provider.internal;

import com.hyperlocal.events.BookingCompleted;
import com.hyperlocal.events.ReviewSubmitted;
import com.hyperlocal.events.UserRegistered;
import org.springframework.context.event.EventListener;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class ProviderEventListeners {

    private final ProviderService providerService;

    ProviderEventListeners(ProviderService providerService) {
        this.providerService = providerService;
    }

    /**
     * Synchronous (same transaction as registration): the frontend fetches
     * the provider profile immediately after register() returns, so the
     * profile must exist the moment the registration response is sent.
     */
    @EventListener
    void on(UserRegistered event) {
        if ("PROVIDER".equals(event.role())) {
            providerService.createForNewUser(
                    event.userId(), event.name(), event.email(), event.categoryId(),
                    event.areaLabel(), event.lat(), event.lng());
        }
    }

    /** Async via the Modulith outbox — aggregate counters tolerate a moment's lag. */
    @ApplicationModuleListener
    void on(BookingCompleted event) {
        providerService.recordCompletedJob(event.snapshot().booking().providerId());
    }

    @ApplicationModuleListener
    void on(ReviewSubmitted event) {
        providerService.applyReview(event.providerId(), event.rating());
    }
}
