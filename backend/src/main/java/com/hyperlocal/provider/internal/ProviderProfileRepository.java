package com.hyperlocal.provider.internal;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface ProviderProfileRepository extends JpaRepository<ProviderProfile, UUID> {

    Optional<ProviderProfile> findByUserId(UUID userId);

    List<ProviderProfile> findByVerificationStatusOrderByName(String status);

    /**
     * Verified providers sorted nearest-first from (:lat, :lng). geography
     * distance is metres on the spheroid. Optional category / availability
     * filters collapse to no-ops when null/false. radiusKm <= 0 disables the
     * ST_DWithin cut so plain "sort by distance" still sees everyone.
     */
    @Query(value = """
            select p.* from provider_profile p
            where p.verification_status = 'VERIFIED'
              and (:categoryId is null or p.category_id = :categoryId)
              and (:onlyAvailable = false or p.available)
              and (:radiusKm <= 0 or st_dwithin(
                    p.location,
                    st_setsrid(st_makepoint(:lng, :lat), 4326)::geography,
                    :radiusKm * 1000))
            order by st_distance(
                    p.location,
                    st_setsrid(st_makepoint(:lng, :lat), 4326)::geography) asc nulls last
            """, nativeQuery = true)
    List<ProviderProfile> searchByDistance(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm,
            @Param("categoryId") UUID categoryId,
            @Param("onlyAvailable") boolean onlyAvailable);

    @Query(value = """
            select p.* from provider_profile p
            where p.verification_status = 'VERIFIED'
              and (:categoryId is null or p.category_id = :categoryId)
              and (:onlyAvailable = false or p.available)
            order by p.rating desc, p.review_count desc
            """, nativeQuery = true)
    List<ProviderProfile> searchByRating(
            @Param("categoryId") UUID categoryId,
            @Param("onlyAvailable") boolean onlyAvailable);

    /** Admin: all providers (any verification status). */
    List<ProviderProfile> findAllByOrderByNameAsc();

    /** location is the source of truth; lat/lng generated columns follow it. */
    @Modifying
    @Query(value = """
            update provider_profile
            set location = st_setsrid(st_makepoint(:lng, :lat), 4326)::geography
            where id = :id
            """, nativeQuery = true)
    void updateLocation(@Param("id") UUID id, @Param("lat") double lat, @Param("lng") double lng);
}
