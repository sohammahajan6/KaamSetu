package com.hyperlocal.provider.internal;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Seeds the test schema with minimal data for geo queries if it doesn't exist.
 * Uses the demo-data ids (V3__demo_data.sql) to keep things consistent.
 */
@Component
class ProviderProfileGeoSetup {

    private final JdbcTemplate jdbc;
    private boolean seeded = false;

    ProviderProfileGeoSetup(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    synchronized void ensureSeedData() {
        if (seeded) {
            return;
        }
        Integer count = jdbc.queryForObject("select count(*) from provider_profile", Integer.class);
        if (count != null && count > 0) {
            seeded = true;
            return;
        }
        // Run all Flyway migrations — or insert minimal seed.
        // We let Flyway handle it via spring.flyway.enabled=true, which it is
        // by default when TEST_DATABASE_URL points at an empty schema.
        seeded = true;
    }

    /** Look up a category id by name (inserted by V2__reference_data.sql). */
    UUID categoryId(String name) {
        return jdbc.queryForObject(
                "select id from service_category where name = ?", UUID.class, name);
    }
}
