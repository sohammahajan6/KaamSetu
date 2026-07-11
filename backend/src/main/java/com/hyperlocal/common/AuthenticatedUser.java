package com.hyperlocal.common;

import java.util.UUID;

/**
 * The authenticated principal, reconstructed purely from JWT claims — no
 * database round-trip in the filter, and no dependency on the user module.
 * name/email ride along in the token so modules can denormalise them into
 * their own rows (e.g. booking.customerName) without cross-module reads.
 */
public record AuthenticatedUser(UUID id, String role, String name, String email) {

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public boolean isProvider() {
        return "PROVIDER".equals(role);
    }

    public boolean isCustomer() {
        return "CUSTOMER".equals(role);
    }
}
