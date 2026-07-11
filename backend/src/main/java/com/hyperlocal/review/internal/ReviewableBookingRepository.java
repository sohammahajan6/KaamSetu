package com.hyperlocal.review.internal;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface ReviewableBookingRepository extends JpaRepository<ReviewableBooking, UUID> {
}
