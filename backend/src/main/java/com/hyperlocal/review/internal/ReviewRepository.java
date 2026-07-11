package com.hyperlocal.review.internal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByProviderIdOrderByCreatedAtDesc(UUID providerId);

    boolean existsByBookingId(UUID bookingId);
}
