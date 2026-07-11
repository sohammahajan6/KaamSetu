package com.hyperlocal.booking.internal;

import com.hyperlocal.events.BookingStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<Booking> findByProviderUserIdOrderByCreatedAtDesc(UUID providerUserId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    boolean existsByIdAndStatus(UUID id, BookingStatus status);

    boolean existsByCustomerIdAndProviderIdAndStatusIn(
            UUID customerId, UUID providerId, List<BookingStatus> statuses);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.providerId = :providerId AND b.status IN :statuses AND b.scheduledAt BETWEEN :startTime AND :endTime")
    boolean existsConflictingBooking(
            @org.springframework.data.repository.query.Param("providerId") UUID providerId,
            @org.springframework.data.repository.query.Param("statuses") List<BookingStatus> statuses,
            @org.springframework.data.repository.query.Param("startTime") java.time.Instant startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.Instant endTime);
}
