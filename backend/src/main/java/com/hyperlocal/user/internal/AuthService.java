package com.hyperlocal.user.internal;

import com.hyperlocal.common.ApiException;
import com.hyperlocal.common.AuthenticatedUser;
import com.hyperlocal.common.JwtService;
import com.hyperlocal.common.BrevoEmailService;
import com.hyperlocal.events.UserRegistered;
import com.hyperlocal.user.internal.dto.AuthDtos.AuthResponse;
import com.hyperlocal.user.internal.dto.AuthDtos.ForgotPasswordRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.LoginRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.RegisterRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.ResetPasswordRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.UserResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApplicationEventPublisher events;
    private final JdbcTemplate jdbc;
    private final BrevoEmailService brevoEmailService;
    private final String frontendUrl;

    AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService,
            ApplicationEventPublisher events, JdbcTemplate jdbc, BrevoEmailService brevoEmailService,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.events = events;
        this.jdbc = jdbc;
        this.brevoEmailService = brevoEmailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict("An account with this email already exists.");
        }
        String cleanedPhone = request.phone().replaceAll("[\\s-]", "").trim();
        if (users.existsByPhone(cleanedPhone)) {
            throw ApiException.conflict("An account with this phone number already exists.");
        }
        if ("PROVIDER".equals(request.role())) {
            if (request.categoryId() == null) {
                throw ApiException.badRequest("Choose a service category to offer services.");
            }
            if (request.areaLabel() == null || request.areaLabel().isBlank()) {
                throw ApiException.badRequest("Enter your service area.");
            }
            if (request.lat() == null || request.lng() == null) {
                throw ApiException.badRequest("Select a valid location from the suggestions.");
            }
        }

        User user = new User(
                UUID.randomUUID(),
                request.name().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                cleanedPhone,
                request.role());
        users.save(user);

        // The provider module reacts synchronously (same transaction) by
        // creating the PENDING profile, so the client can fetch it right after.
        events.publishEvent(new UserRegistered(
                user.getId(), user.getName(), user.getEmail(), user.getPhone(),
                user.getRole(), request.categoryId(),
                request.areaLabel(), request.lat(), request.lng()));

        return new AuthResponse(issueToken(user), toResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password."));
        return new AuthResponse(issueToken(user), toResponse(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(UUID userId) {
        return users.findById(userId)
                .map(AuthService::toResponse)
                .orElseThrow(() -> ApiException.notFound("Account not found."));
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        users.findByEmailIgnoreCase(request.email().trim()).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);
            jdbc.update(
                    "insert into password_reset_token (id, token, email, expires_at) values (?, ?, ?, ?)",
                    UUID.randomUUID(), token, user.getEmail(), java.sql.Timestamp.from(expiresAt));

            String link = frontendUrl + "/reset-password?token=" + token;
            String html = "<p>Hi " + user.getName() + ",</p>"
                    + "<p>We received a request to reset your password. Click the link below to set a new one. "
                    + "This link expires in 1 hour.</p>"
                    + "<p><a href=\"" + link + "\" style=\"display:inline-block;padding:12px 24px;"
                    + "background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;"
                    + "font-weight:600;\">Reset your password</a></p>"
                    + "<p style=\"color:#6b7280;font-size:12px;\">Or copy this URL into your browser:<br>"
                    + link + "</p>"
                    + "<p style=\"color:#6b7280;font-size:12px;\">If you didn't request this, you can safely ignore this email.</p>";

            brevoEmailService.sendEmail(user.getEmail(), "Reset your password — KaamSetu", html);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.token().trim();
        try {
            var row = jdbc.queryForMap(
                    "select email, expires_at, used from password_reset_token where token = ?", token);
            String email = (String) row.get("email");
            Instant expiresAt = ((java.sql.Timestamp) row.get("expires_at")).toInstant();
            boolean used = (boolean) row.get("used");

            if (used) {
                throw ApiException.badRequest("This reset link has already been used.");
            }
            if (Instant.now().isAfter(expiresAt)) {
                throw ApiException.badRequest("This reset link has expired.");
            }

            users.findByEmailIgnoreCase(email).ifPresent(user -> {
                jdbc.update("update users set password_hash = ? where id = ?",
                        passwordEncoder.encode(request.password()), user.getId());
                jdbc.update("update password_reset_token set used = true where token = ?", token);
            });
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            throw ApiException.badRequest("Invalid or expired reset link.");
        }
    }

    private String issueToken(User user) {
        return jwtService.issue(new AuthenticatedUser(
                user.getId(), user.getRole(), user.getName(), user.getEmail()));
    }

    private static UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getPhone(), user.getRole(), user.getCreatedAt());
    }
}
