package com.hyperlocal.payment.internal;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RazorpaySignatureTests {

    private RazorpayGateway gateway;

    @BeforeEach
    void setUp() {
        gateway = new RazorpayGateway("rzp_test_xxx", "rzp_test_secret_yyy");
    }

    @Test
    void acceptKnownSignature() {
        String orderId = "order_OIabc123def";
        String paymentId = "pay_XYZ789ghi";
        String expectedSig = computeHmac(orderId + "|" + paymentId, "rzp_test_secret_yyy");

        assertThat(gateway.verifySignature(orderId, paymentId, expectedSig)).isTrue();
    }

    @Test
    void rejectBadSignature() {
        assertThat(gateway.verifySignature("order_1", "pay_1", "this_is_not_valid")).isFalse();
    }

    @Test
    void rejectWrongKey() {
        String orderId = "order_OIabc123def";
        String paymentId = "pay_XYZ789ghi";
        String sigWithWrongSecret = computeHmac(orderId + "|" + paymentId, "different_secret");

        assertThat(gateway.verifySignature(orderId, paymentId, sigWithWrongSecret)).isFalse();
    }

    @Test
    void rejectNullInput() {
        assertThat(gateway.verifySignature(null, "pay_1", "sig")).isFalse();
        assertThat(gateway.verifySignature("order_1", null, "sig")).isFalse();
    }

    /** HMAC-SHA256 in hex — exactly how Razorpay signs. */
    private static String computeHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
