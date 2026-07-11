package com.hyperlocal.admin.internal.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
class AdminBookingController {

    private final JdbcTemplate jdbc;
    private final com.hyperlocal.admin.internal.AdminService adminService;

    AdminBookingController(JdbcTemplate jdbc, com.hyperlocal.admin.internal.AdminService adminService) {
        this.jdbc = jdbc;
        this.adminService = adminService;
    }

    record BookingRow(
            UUID id, UUID customerId, String customerName, UUID providerId, String providerName,
            UUID categoryId, String categoryName, String status,
            String scheduledAt, String address, String notes,
            BigDecimal price, Instant createdAt, Instant updatedAt) {}

    @GetMapping
    List<BookingRow> allBookings() {
        return jdbc.query(
                "select id, customer_id, customer_name, provider_id, provider_name, " +
                "category_id, category_name, status, scheduled_at, address, notes, " +
                "price, created_at, updated_at from booking order by created_at desc",
                (rs, row) -> new BookingRow(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("customer_id")),
                        rs.getString("customer_name"),
                        UUID.fromString(rs.getString("provider_id")),
                        rs.getString("provider_name"),
                        UUID.fromString(rs.getString("category_id")),
                        rs.getString("category_name"),
                        rs.getString("status"),
                        rs.getTimestamp("scheduled_at").toInstant().toString(),
                        rs.getString("address"),
                        rs.getString("notes"),
                        rs.getBigDecimal("price"),
                        rs.getTimestamp("created_at").toInstant(),
                        rs.getTimestamp("updated_at").toInstant()));
    }

    @GetMapping("/export")
    org.springframework.http.ResponseEntity<String> export() {
        String csv = adminService.exportBookingsCsv();
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bookings.csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
