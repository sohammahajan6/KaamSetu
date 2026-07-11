package com.hyperlocal.payment.internal.web;

import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.payment.internal.PaymentService;
import com.hyperlocal.payment.internal.PaymentService.CreateOrderResult;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
class PaymentController {

    private final PaymentService paymentService;

    PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    record CreateOrderRequest(@NotNull(message = "bookingId is required") UUID bookingId) {
    }

    record VerifyRequest(
            @NotBlank(message = "razorpayOrderId is required") String razorpayOrderId,
            @NotBlank(message = "razorpayPaymentId is required") String razorpayPaymentId,
            @NotBlank(message = "razorpaySignature is required") String razorpaySignature) {
    }

    @PostMapping("/create-order")
    CreateOrderResult createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return paymentService.createOrder(CurrentUser.require(), request.bookingId());
    }

    @PostMapping("/verify")
    Map<String, Object> verify(@Valid @RequestBody VerifyRequest request) {
        UUID bookingId = paymentService.verify(
                request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());
        return Map.of("status", "PAID", "bookingId", bookingId);
    }
}
