package com.hyperlocal.payment.internal;

import com.hyperlocal.common.ApiException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Thin gateway around the Razorpay SDK. Without keys it degrades to a local
 * order id (order_local_*) so dev flows don't 500; signature verification then
 * only accepts HMACs computed with the placeholder secret.
 */
@Component
class RazorpayGateway {

    private static final Logger log = LoggerFactory.getLogger(RazorpayGateway.class);

    private final String keyId;
    private final String keySecret;

    RazorpayGateway(
            @Value("${app.razorpay.key-id}") String keyId,
            @Value("${app.razorpay.key-secret}") String keySecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        if (!isConfigured()) {
            log.warn("RAZORPAY_KEY_ID/SECRET not set — payment orders will use local placeholders.");
        }
    }

    boolean isConfigured() {
        return !keyId.isBlank() && !keySecret.isBlank();
    }

    String keyId() {
        return keyId;
    }

    /** @return the razorpay order id; amount is rupees, converted to paise here. */
    String createOrder(BigDecimal amountRupees, UUID bookingId) {
        long paise = amountRupees.multiply(BigDecimal.valueOf(100)).longValueExact();
        if (!isConfigured()) {
            return "order_local_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject request = new JSONObject();
            request.put("amount", paise);
            request.put("currency", "INR");
            request.put("receipt", bookingId.toString());
            Order order = client.orders.create(request);
            return order.get("id");
        } catch (Exception e) {
            log.error("Razorpay order creation failed", e);
            throw ApiException.conflict("Could not create the payment order. Please try again.");
        }
    }

    /** Razorpay checkout signature: HMAC-SHA256(orderId + "|" + paymentId, keySecret) in hex. */
    boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(effectiveSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            return constantTimeEquals(HexFormat.of().formatHex(expected), signature);
        } catch (Exception e) {
            log.error("Signature verification errored", e);
            return false;
        }
    }

    private String effectiveSecret() {
        return isConfigured() ? keySecret : "local-dev-secret";
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
