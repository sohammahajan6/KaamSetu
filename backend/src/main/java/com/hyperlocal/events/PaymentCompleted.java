package com.hyperlocal.events;

import java.math.BigDecimal;
import java.util.UUID;

/** Published by the payment module after Razorpay signature verification succeeds. */
public record PaymentCompleted(UUID paymentId, UUID bookingId, BigDecimal amount) {
}
