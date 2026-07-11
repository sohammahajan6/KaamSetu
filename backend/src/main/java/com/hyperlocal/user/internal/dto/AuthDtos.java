package com.hyperlocal.user.internal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

/** Request/response shapes for /api/auth — mirror the frontend payload types. */
public final class AuthDtos {

    private AuthDtos() {
    }

    /** Matches RegisterPayload (src/types/index.ts). */
    public record RegisterRequest(
            @NotBlank(message = "Enter your full name") @Size(min = 2, message = "Enter your full name") String name,
            @NotBlank(message = "Enter a valid email") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Enter a valid phone number")
            @Pattern(regexp = "[6-9]\\d{9}", message = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)") String phone,
            @NotBlank(message = "Password must be at least 8 characters") @Size(min = 8, max = 100, message = "Password must be 8–100 characters")
            @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", message = "Password must include at least one uppercase letter, one lowercase letter, and one number") String password,
            @NotBlank(message = "Choose a role") @Pattern(regexp = "CUSTOMER|PROVIDER", message = "Role must be CUSTOMER or PROVIDER") String role,
            UUID categoryId,
            String areaLabel,
            @jakarta.validation.constraints.Min(value = -90) @jakarta.validation.constraints.Max(value = 90) Double lat,
            @jakarta.validation.constraints.Min(value = -180) @jakarta.validation.constraints.Max(value = 180) Double lng) {
    }

    /** Matches LoginPayload. */
    public record LoginRequest(
            @NotBlank(message = "Enter a valid email") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Enter your password") String password) {
    }

    /** Matches the frontend User interface. */
    public record UserResponse(
            UUID id,
            String name,
            String email,
            String phone,
            String role,
            Instant createdAt) {
    }

    /**
     * Matches AuthResult plus the token the real HTTP client stores. The mock
     * client had no token (no HTTP); the frontend httpClient keeps it out of
     * component-visible state, so components still see exactly AuthResult.
     * providerProfile is fetched lazily by the client via
     * GET /api/providers/by-user/{userId} to keep module boundaries clean.
     */
    public record AuthResponse(String token, UserResponse user) {
    }

    public record ForgotPasswordRequest(
            @NotBlank(message = "Enter a valid email") @Email(message = "Enter a valid email") String email) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "Reset token is required") String token,
            @NotBlank(message = "Password must be at least 8 characters") @Size(min = 8, max = 100, message = "Password must be 8–100 characters")
            @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", message = "Password must include at least one uppercase letter, one lowercase letter, and one number") String password) {
    }
}
