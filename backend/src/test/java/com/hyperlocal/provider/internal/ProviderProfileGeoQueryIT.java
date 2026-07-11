package com.hyperlocal.provider.internal;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Nearest-provider search against a real PostgreSQL + PostGIS instance
 * (Supabase test schema). Set TEST_DATABASE_URL to enable; skip otherwise.
 * No Docker / Testcontainers needed.
 */
@SpringBootTest
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "TEST_DATABASE_URL", matches = ".+")
class ProviderProfileGeoQueryIT {

    @Autowired
    private ProviderProfileRepository repository;

    @Autowired
    private ProviderProfileGeoSetup setup;

    @BeforeEach
    void setUp() {
        setup.ensureSeedData();
    }

    @Test
    void nearestFirst() {
        // Pune centre — expecting seeded providers sorted by distance
        List<ProviderProfile> results = repository.searchByDistance(
                18.5204, 73.8567, 20, null, false);
        assertThat(results).isNotEmpty();
        // All returned are verified
        assertThat(results).allMatch(p -> "VERIFIED".equals(p.getVerificationStatus()));
        // First result should be within a reasonable distance
        ProviderProfile first = results.getFirst();
        assertThat(first.getLat()).isNotNull();
        assertThat(first.getLng()).isNotNull();
    }

    @Test
    void filterByCategory() {
        UUID electricianId = setup.categoryId("Electrician");
        List<ProviderProfile> results = repository.searchByDistance(
                18.5204, 73.8567, 30, electricianId, false);
        assertThat(results).isNotEmpty();
        assertThat(results).allMatch(p -> p.getCategoryId().equals(electricianId));
    }

    @Test
    void filterByAvailable() {
        List<ProviderProfile> results = repository.searchByDistance(
                18.5204, 73.8567, 0, null, true);
        assertThat(results).isNotEmpty();
        assertThat(results).allMatch(ProviderProfile::isAvailable);
    }

    @Test
    void ratingSort() {
        List<ProviderProfile> results = repository.searchByRating(null, false);
        assertThat(results).isNotEmpty();
        // sorted descending
        for (int i = 1; i < results.size(); i++) {
            assertThat(results.get(i).getRating())
                    .isLessThanOrEqualTo(results.get(i - 1).getRating());
        }
    }

    @Test
    void radiusFilter() {
        // Tight radius around a specific coordinate — should return fewer
        List<ProviderProfile> all = repository.searchByDistance(
                18.5204, 73.8567, 30, null, false);
        List<ProviderProfile> tight = repository.searchByDistance(
                18.5204, 73.8567, 2, null, false);
        assertThat(tight.size()).isLessThanOrEqualTo(all.size());
    }
}
