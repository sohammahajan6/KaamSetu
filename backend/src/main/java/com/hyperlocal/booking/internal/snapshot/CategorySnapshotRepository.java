package com.hyperlocal.booking.internal.snapshot;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategorySnapshotRepository extends JpaRepository<CategorySnapshot, UUID> {
}
