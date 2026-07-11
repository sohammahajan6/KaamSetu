package com.hyperlocal.payment.internal;

import com.hyperlocal.common.ApiException;
import com.hyperlocal.common.AuthenticatedUser;
import com.hyperlocal.events.BookingRequested;
import com.hyperlocal.events.PaymentCompleted;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PaymentRepository payments;
    private final RazorpayGateway gateway;
    private final ApplicationEventPublisher events;

    PaymentService(PaymentRepository payments, RazorpayGateway gateway, ApplicationEventPublisher events) {
        this.payments = payments;
        this.gateway = gateway;
        this.events = events;
    }

    /** BookingRequested → open a pending payment record (async via outbox). */
    @ApplicationModuleListener
    void on(BookingRequested event) {
        UUID bookingId = event.snapshot().booking().id();
        if (payments.findByBookingId(bookingId).isEmpty()) {
            payments.save(new Payment(UUID.randomUUID(), bookingId,
                    event.snapshot().booking().customerId(),
                    event.snapshot().booking().price()));
        }
    }

    public record CreateOrderResult(String razorpayOrderId, long amount, String keyId) {
    }

    /**
     * Idempotent: reuses an existing Razorpay order if one was already created.
     * amount is in paise, ready for Razorpay Checkout options.
     */
    @Transactional
    public CreateOrderResult createOrder(AuthenticatedUser caller, UUID bookingId) {
        Payment payment = awaitPayment(bookingId);
        if (!caller.isAdmin() && !payment.getCustomerId().equals(caller.id())) {
            throw ApiException.forbidden("Only the booking's customer can pay for it.");
        }
        if ("PAID".equals(payment.getStatus())) {
            throw ApiException.conflict("This booking is already paid.");
        }
        if (payment.getRazorpayOrderId() == null) {
            payment.attachOrder(gateway.createOrder(payment.getAmount(), bookingId));
            payments.save(payment);
        }
        long paise = payment.getAmount().multiply(BigDecimal.valueOf(100)).longValueExact();
        return new CreateOrderResult(payment.getRazorpayOrderId(), paise, gateway.keyId());
    }

    @Transactional
    public UUID verify(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        Payment payment = payments.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> ApiException.notFound("No payment found for this order."));
        if ("PAID".equals(payment.getStatus())) {
            return payment.getBookingId(); // idempotent re-verify
        }
        if (!gateway.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            throw ApiException.badRequest("Payment signature verification failed.");
        }
        payment.markPaid(razorpayPaymentId);
        payments.save(payment);
        events.publishEvent(new PaymentCompleted(payment.getId(), payment.getBookingId(), payment.getAmount()));
        return payment.getBookingId();
    }

    /**
     * The payment row is created by an async listener moments after the
     * booking; tolerate that tiny window instead of failing the customer.
     */
    private Payment awaitPayment(UUID bookingId) {
        for (int attempt = 0; attempt < 10; attempt++) {
            var found = payments.findByBookingId(bookingId);
            if (found.isPresent()) {
                return found.get();
            }
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        throw ApiException.conflict("Payment for this booking is still being set up. Try again in a moment.");
    }
}
