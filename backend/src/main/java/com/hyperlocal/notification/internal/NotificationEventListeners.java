package com.hyperlocal.notification.internal;

import com.hyperlocal.events.BookingPayload;
import com.hyperlocal.events.BookingRequested;
import com.hyperlocal.events.BookingSnapshot;
import com.hyperlocal.events.BookingStatusChanged;
import com.hyperlocal.events.PaymentCompleted;
import com.hyperlocal.events.ProviderVerified;
import org.springframework.context.event.EventListener;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class NotificationEventListeners {

    private final BookingPartyRepository parties;
    private final EmailSender email;
    private final SseHub sse;
    private final com.hyperlocal.notification.internal.push.WebPushService pushService;

    NotificationEventListeners(BookingPartyRepository parties, EmailSender email, SseHub sse, com.hyperlocal.notification.internal.push.WebPushService pushService) {
        this.parties = parties;
        this.email = email;
        this.sse = sse;
        this.pushService = pushService;
    }

    /**
     * Party projection is synchronous (commits with the booking) so a client
     * can open the SSE stream the instant POST /api/bookings returns.
     */
    @EventListener
    void projectParties(BookingRequested event) {
        BookingSnapshot s = event.snapshot();
        BookingPayload b = s.booking();
        parties.save(new BookingParty(b.id(), b.customerId(), b.customerName(),
                s.customerEmail(), s.providerUserId(), b.providerName(), s.providerEmail()));
    }

    @ApplicationModuleListener
    void onRequested(BookingRequested event) {
        BookingPayload b = event.snapshot().booking();
        
        // Notify the provider about the new request
        email.send(event.snapshot().providerEmail(), b.providerName(),
                "New booking request — " + b.categoryName(),
                "<p>" + b.customerName() + " requested <b>" + b.categoryName() + "</b> on "
                        + b.scheduledAt() + ".</p><p>Address: " + b.address() + "</p>"
                        + "<p>Open your dashboard to accept the job.</p>");
        pushService.sendToUser(event.snapshot().providerUserId(), "New Booking Request", b.customerName() + " requested " + b.categoryName());
                        
        // Send a confirmation to the customer
        email.send(event.snapshot().customerEmail(), b.customerName(),
                "Booking request sent — " + b.categoryName(),
                "<p>Your booking request for <b>" + b.categoryName() + "</b> on " 
                        + b.scheduledAt() + " has been sent to " + b.providerName() + ".</p>"
                        + "<p>We will notify you once they accept the job.</p>");
                        
        sse.push(b);
    }

    @ApplicationModuleListener
    void onStatusChanged(BookingStatusChanged event) {
        BookingPayload b = event.snapshot().booking();
        String customerEmail = event.snapshot().customerEmail();
        String providerEmail = event.snapshot().providerEmail();
        switch (b.status()) {
            case ACCEPTED -> {
                email.send(customerEmail, b.customerName(),
                        "Booking accepted — " + b.categoryName(),
                        "<p>" + b.providerName() + " accepted your booking scheduled for "
                                + b.scheduledAt() + ".</p>");
                pushService.sendToUser(b.customerId(), "Booking Accepted", b.providerName() + " accepted your booking.");
            }
            case IN_PROGRESS -> {
                email.send(customerEmail, b.customerName(),
                        "Job started — " + b.categoryName(),
                        "<p>" + b.providerName() + " has started the job.</p>");
                pushService.sendToUser(b.customerId(), "Job Started", b.providerName() + " has started the job.");
            }
            case COMPLETED -> {
                email.send(customerEmail, b.customerName(),
                        "Job completed — " + b.categoryName(),
                        "<p>" + b.providerName() + " marked the job complete. "
                                + "Please rate your experience in the app.</p>");
                pushService.sendToUser(b.customerId(), "Job Completed", b.providerName() + " marked the job complete.");
            }
            case CANCELLED -> {
                email.send(customerEmail, b.customerName(),
                        "Booking cancelled — " + b.categoryName(),
                        "<p>Your booking with " + b.providerName() + " was cancelled.</p>");
                email.send(providerEmail, b.providerName(),
                        "Booking cancelled — " + b.categoryName(),
                        "<p>The booking with " + b.customerName() + " was cancelled.</p>");
                pushService.sendToUser(b.customerId(), "Booking Cancelled", "Your booking was cancelled.");
                pushService.sendToUser(event.snapshot().providerUserId(), "Booking Cancelled", "Booking with " + b.customerName() + " cancelled.");
            }
            case RATED -> {
                email.send(providerEmail, b.providerName(),
                        "You received a new rating",
                        "<p>" + b.customerName() + " rated your " + b.categoryName() + " job.</p>");
                pushService.sendToUser(event.snapshot().providerUserId(), "New Rating", "You received a new rating from " + b.customerName());
            }
            default -> {
                // REQUESTED is announced by onRequested
            }
        }
        sse.push(b);
    }

    @ApplicationModuleListener
    void onPaymentCompleted(PaymentCompleted event) {
        parties.findById(event.bookingId()).ifPresent(party ->
                email.send(party.getCustomerEmail(), party.getCustomerName(),
                        "Payment received",
                        "<p>We received your payment of ₹" + event.amount()
                                + " for booking " + event.bookingId() + ". Thank you!</p>"));
    }

    @ApplicationModuleListener
    void onProviderVerified(ProviderVerified event) {
        if (event.approved()) {
            email.send(event.email(), event.name(),
                    "You're verified 🎉",
                    "<p>Your provider profile has been approved. "
                            + "You now appear in customer search — go available to start receiving jobs.</p>");
        } else {
            email.send(event.email(), event.name(),
                    "Verification update",
                    "<p>Your provider profile was not approved. "
                            + "Please update your details and contact support.</p>");
        }
    }

}
