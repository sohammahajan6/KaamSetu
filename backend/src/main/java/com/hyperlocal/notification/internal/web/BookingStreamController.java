package com.hyperlocal.notification.internal.web;

import com.hyperlocal.common.ApiException;
import com.hyperlocal.common.AuthenticatedUser;
import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.notification.internal.BookingParty;
import com.hyperlocal.notification.internal.BookingPartyRepository;
import com.hyperlocal.notification.internal.SseHub;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Live booking updates. EventSource can't set headers, so the JWT filter also
 * accepts ?token= on exactly this path. Only the booking's customer, its
 * provider, or an admin may subscribe.
 */
@RestController
class BookingStreamController {

    private final BookingPartyRepository parties;
    private final SseHub sseHub;

    BookingStreamController(BookingPartyRepository parties, SseHub sseHub) {
        this.parties = parties;
        this.sseHub = sseHub;
    }

    @GetMapping(value = "/api/bookings/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter stream(@PathVariable UUID id) {
        AuthenticatedUser caller = CurrentUser.require();
        BookingParty party = parties.findById(id)
                .orElseThrow(() -> ApiException.notFound("Booking not found."));
        boolean allowed = caller.isAdmin()
                || party.getCustomerId().equals(caller.id())
                || party.getProviderUserId().equals(caller.id());
        if (!allowed) {
            throw ApiException.forbidden("You don't have access to this booking.");
        }
        return sseHub.subscribe(id);
    }
}
