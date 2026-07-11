package com.hyperlocal.booking.internal.snapshot;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProviderSnapshotRepository extends JpaRepository<ProviderSnapshot, UUID> {

    List<ProviderSnapshot> findByCategoryIdAndAvailableAndVerificationStatus(
            UUID categoryId, boolean available, String verificationStatus);

    /**
     * Finds providers for auto-assign, ranked by a composite score.
     * Joins provider_profile for rating + distance, and counts active bookings.
     * Score = (rating_norm * 0.3) + (distance_norm * 0.4) + (job_load_norm * 0.3)
     * Higher score = better candidate. Returns best first.
     */
    @Query(value = """
            WITH candidates AS (
                SELECT
                    s.id,
                    COALESCE(pp.rating, 0) AS rating,
                    COALESCE(
                        st_distance(
                            pp.location,
                            st_setsrid(st_makepoint(:lng, :lat), 4326)::geography
                        ), 999999
                    ) AS dist_metres,
                    COALESCE((
                        SELECT COUNT(*) FROM booking b
                        WHERE b.provider_id = s.id
                          AND b.status IN ('REQUESTED','ACCEPTED','IN_PROGRESS')
                    ), 0) AS active_jobs
                FROM booking_provider_snapshot s
                JOIN provider_profile pp ON pp.id = s.id
                WHERE s.category_id = :categoryId
                  AND s.available = true
                  AND s.verification_status = 'VERIFIED'
                  AND s.user_id != :excludeUserId
            ),
            scored AS (
                SELECT
                    id,
                    rating,
                    dist_metres,
                    active_jobs,
                    -- normalised scores (0..1 each)
                    (rating / GREATEST((SELECT MAX(rating) FROM candidates), 1.0)) * 0.30
                    + (1.0 - LEAST(dist_metres, 50000) / 50000.0) * 0.40
                    + (1.0 - LEAST(active_jobs, 5.0) / 5.0) * 0.30
                    AS score
                FROM candidates
            )
            SELECT s.* FROM booking_provider_snapshot s
            JOIN scored sc ON sc.id = s.id
            ORDER BY sc.score DESC
            LIMIT 10
            """, nativeQuery = true)
    List<ProviderSnapshot> findBestAvailable(
            @Param("categoryId") UUID categoryId,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("excludeUserId") UUID excludeUserId);
}
