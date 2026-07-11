package com.hyperlocal.user.internal.web;

import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.user.internal.dto.SavedAddressRequest;
import com.hyperlocal.user.internal.dto.SavedAddressResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/address")
class SavedAddressController {

    private final JdbcTemplate jdbc;

    SavedAddressController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    SavedAddressResponse get() {
        UUID userId = CurrentUser.require().id();
        var rows = jdbc.query(
                "select id, user_id, area, flat, building, street, landmark, lat, lng from saved_address where user_id = ?",
                (rs, row) -> new SavedAddressResponse(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("user_id")),
                        rs.getString("area"),
                        rs.getString("flat"),
                        rs.getString("building"),
                        rs.getString("street"),
                        rs.getString("landmark"),
                        rs.getDouble("lat"),
                        rs.getDouble("lng")),
                userId);
        return rows.isEmpty() ? null : rows.getFirst();
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    void upsert(@Valid @RequestBody SavedAddressRequest request) {
        UUID userId = CurrentUser.require().id();
        jdbc.update("""
                insert into saved_address (id, user_id, area, flat, building, street, landmark, lat, lng, updated_at)
                values (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?, ?, now())
                on conflict (user_id) do update set
                    area = excluded.area,
                    flat = excluded.flat,
                    building = excluded.building,
                    street = excluded.street,
                    landmark = excluded.landmark,
                    lat = excluded.lat,
                    lng = excluded.lng,
                    updated_at = now()
                """,
                userId, request.area(), request.flat(), request.building(),
                request.street(), request.landmark(), request.lat(), request.lng());
    }
}
