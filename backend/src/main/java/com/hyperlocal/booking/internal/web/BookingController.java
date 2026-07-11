package com.hyperlocal.booking.internal.web;

import com.hyperlocal.booking.internal.BookingService;
import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.events.BookingPayload;
import com.hyperlocal.events.BookingStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
class BookingController {

    private final BookingService bookingService;

    BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** Matches CreateBookingPayload; scheduledAt arrives as an ISO instant. */
    record CreateBookingRequest(
            @NotNull(message = "Invalid booking request.") UUID providerId,
            @NotNull(message = "Pick a date and time") @jakarta.validation.constraints.FutureOrPresent(message = "Booking date must be in the future") Instant scheduledAt,
            @NotBlank(message = "Enter your full address") String address,
            String notes) {
    }

    /** Auto-assign: system picks the best provider for the category. */
    record AutoAssignBookingRequest(
            @NotNull(message = "Choose a service category") UUID categoryId,
            @NotNull(message = "Pick a date and time") @jakarta.validation.constraints.FutureOrPresent(message = "Booking date must be in the future") Instant scheduledAt,
            @NotBlank(message = "Enter your full address") String address,
            String notes,
            Double lat,
            Double lng) {
    }

    record UpdateStatusRequest(@NotNull(message = "Choose a status") BookingStatus status) {
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    BookingPayload create(@Valid @RequestBody CreateBookingRequest request) {
        return bookingService.create(CurrentUser.require(), request.providerId(),
                request.scheduledAt(), request.address(), request.notes());
    }

    @PostMapping("/auto-assign")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    BookingPayload autoAssign(@Valid @RequestBody AutoAssignBookingRequest request) {
        return bookingService.createAutoAssign(CurrentUser.require(), request.categoryId(),
                request.scheduledAt(), request.address(), request.notes(),
                request.lat(), request.lng());
    }

    @GetMapping("/mine")
    List<BookingPayload> mine() {
        return bookingService.mine(CurrentUser.require());
    }

    @GetMapping("/{id}")
    BookingPayload get(@PathVariable UUID id) {
        return bookingService.get(CurrentUser.require(), id);
    }

    @PatchMapping("/{id}/status")
    BookingPayload updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateStatusRequest request) {
        return bookingService.updateStatus(CurrentUser.require(), id, request.status());
    }

    /** Convenience alias from the build doc; same rules as status=ACCEPTED. */
    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('PROVIDER')")
    BookingPayload accept(@PathVariable UUID id) {
        return bookingService.updateStatus(CurrentUser.require(), id, BookingStatus.ACCEPTED);
    }
}
