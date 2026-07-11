/**
 * Razorpay payments (test/sandbox mode): order creation and signature
 * verification. Publishes {@link com.hyperlocal.events.PaymentCompleted};
 * listens to {@link com.hyperlocal.events.BookingRequested} to open a pending
 * payment record per booking. Runs in a keyless "local order" mode when
 * RAZORPAY_KEY_ID/SECRET are absent so the rest of the app works in dev.
 */
package com.hyperlocal.payment;
