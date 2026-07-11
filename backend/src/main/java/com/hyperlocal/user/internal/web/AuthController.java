package com.hyperlocal.user.internal.web;

import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.user.internal.AuthService;
import com.hyperlocal.user.internal.dto.AuthDtos.AuthResponse;
import com.hyperlocal.user.internal.dto.AuthDtos.ForgotPasswordRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.LoginRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.RegisterRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.ResetPasswordRequest;
import com.hyperlocal.user.internal.dto.AuthDtos.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
class AuthController {

    private final AuthService authService;

    AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    UserResponse me() {
        return authService.me(CurrentUser.require().id());
    }

    @PostMapping("/forgot-password")
    void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }
}
