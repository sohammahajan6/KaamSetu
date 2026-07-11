package com.hyperlocal.provider.internal.web;

import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.provider.internal.ProviderService;
import com.hyperlocal.provider.internal.dto.ProviderDtos.ProviderResponse;
import com.hyperlocal.provider.internal.dto.ProviderDtos.UpdateProviderRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/providers")
class ProviderController {

    private final ProviderService providerService;

    ProviderController(ProviderService providerService) {
        this.providerService = providerService;
    }

    /**
     * Search params merge both contracts: the frontend sends categoryId/sortBy/
     * onlyAvailable/nearLat/nearLng (ProviderFilters); the build doc names
     * category/lat/lng/radiusKm. Both spellings are accepted.
     */
    @GetMapping
    List<ProviderResponse> search(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(name = "category", required = false) UUID category,
            @RequestParam(required = false, defaultValue = "distance") String sortBy,
            @RequestParam(required = false) Double nearLat,
            @RequestParam(required = false) Double nearLng,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusKm,
            @RequestParam(required = false, defaultValue = "false") boolean onlyAvailable) {
        return providerService.search(
                categoryId != null ? categoryId : category,
                sortBy,
                nearLat != null ? nearLat : lat,
                nearLng != null ? nearLng : lng,
                radiusKm,
                onlyAvailable);
    }

    @GetMapping("/by-user/{userId}")
    ProviderResponse byUser(@PathVariable UUID userId) {
        return providerService.getByUserId(userId);
    }

    @GetMapping("/{id}")
    ProviderResponse byId(@PathVariable UUID id) {
        return providerService.getById(id);
    }

    /** Ownership (own profile only) is enforced in the service. */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    ProviderResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProviderRequest request) {
        return providerService.update(id, request, CurrentUser.require());
    }
}
