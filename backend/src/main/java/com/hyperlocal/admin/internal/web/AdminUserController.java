package com.hyperlocal.admin.internal.web;

import com.hyperlocal.common.ApiException;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
class AdminUserController {

    private final JdbcTemplate jdbc;

    AdminUserController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    record UserRow(UUID id, String name, String email, String phone, String role, Instant createdAt) {}

    record ChangeRoleRequest(@NotBlank(message = "Role is required") String role) {}

    @GetMapping
    List<UserRow> allUsers() {
        return jdbc.query(
                "select id, name, email, phone, role, created_at from users order by created_at desc",
                (rs, row) -> new UserRow(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("role"),
                        rs.getTimestamp("created_at").toInstant()));
    }

    @PatchMapping("/{id}/role")
    @Transactional
    void changeRole(@PathVariable UUID id, @Valid @RequestBody ChangeRoleRequest request) {
        if (!Set.of("CUSTOMER", "PROVIDER", "ADMIN").contains(request.role())) {
            throw ApiException.badRequest("Invalid role. Must be CUSTOMER, PROVIDER, or ADMIN.");
        }
        int updated = jdbc.update("update users set role = ? where id = ?", request.role(), id);
        if (updated == 0) throw ApiException.notFound("User not found.");
    }

    @DeleteMapping("/{id}")
    @Transactional
    void deleteUser(@PathVariable UUID id) {
        jdbc.update("delete from review where customer_id = ?", id);
        jdbc.update("delete from review where provider_id in (select id from provider_profile where user_id = ?)", id);
        jdbc.update("delete from payment where booking_id in (select id from booking where customer_id = ?)", id);
        jdbc.update("delete from notification_booking_party where customer_id = ? or provider_user_id = ?", id, id);
        jdbc.update("delete from booking where customer_id = ? or provider_user_id = ?", id, id);
        jdbc.update("delete from provider_profile where user_id = ?", id);

        int deleted = jdbc.update("delete from users where id = ?", id);
        if (deleted == 0) throw ApiException.notFound("User not found.");
    }
}
