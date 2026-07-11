package com.hyperlocal.common;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.JwtException;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtServiceTests {

    private static final String SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    private static final String SHORT_SECRET = "too-short";

    private final JwtService jwtService = new JwtService(SECRET, 168);

    @Test
    void rejectShortSecret() {
        assertThatThrownBy(() -> new JwtService(SHORT_SECRET, 1))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    void roundTrip() {
        var user = new AuthenticatedUser(UUID.randomUUID(), "CUSTOMER", "Test User", "test@example.com");
        String token = jwtService.issue(user);
        AuthenticatedUser parsed = jwtService.parse(token);
        assertThat(parsed.id()).isEqualTo(user.id());
        assertThat(parsed.role()).isEqualTo("CUSTOMER");
        assertThat(parsed.name()).isEqualTo("Test User");
        assertThat(parsed.email()).isEqualTo("test@example.com");
    }

    @Test
    void carryProviderRole() {
        var user = new AuthenticatedUser(UUID.randomUUID(), "PROVIDER", "Provider", "p@example.com");
        String token = jwtService.issue(user);
        AuthenticatedUser parsed = jwtService.parse(token);
        assertThat(parsed.role()).isEqualTo("PROVIDER");
    }

    @Test
    void rejectBadToken() {
        assertThatThrownBy(() -> jwtService.parse("bad.token.here"))
                .isInstanceOf(JwtException.class);
    }
}
