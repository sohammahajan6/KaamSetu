package com.hyperlocal.notification.internal;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingPartyRepository extends JpaRepository<BookingParty, UUID> {
}
