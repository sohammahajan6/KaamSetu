package com.hyperlocal.provider.internal.web;

import com.hyperlocal.provider.internal.ProviderService;
import com.hyperlocal.provider.internal.dto.ProviderDtos.ProviderResponse;
import com.hyperlocal.provider.internal.dto.ProviderDtos.VerifyRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/providers")
@PreAuthorize("hasRole('ADMIN')")
class AdminProviderController {

    private final ProviderService providerService;

    AdminProviderController(ProviderService providerService) {
        this.providerService = providerService;
    }

    @GetMapping("/pending")
    List<ProviderResponse> pending() {
        return providerService.pendingVerification();
    }

    @GetMapping
    List<ProviderResponse> all() {
        return providerService.all();
    }

    /**
     * The frontend's verifyProvider(providerId, approve) can also reject, so
     * this takes {"approve": bool} rather than being approve-only.
     */
    @PatchMapping("/{id}/verify")
    ProviderResponse verify(@PathVariable UUID id, @jakarta.validation.Valid @RequestBody VerifyRequest request) {
        return providerService.verify(id, request.approve());
    }
}
