package com.hyperlocal.provider.internal;

import com.hyperlocal.common.ApiException;
import com.hyperlocal.common.AuthenticatedUser;
import com.hyperlocal.events.ProviderUpserted;
import com.hyperlocal.events.ProviderVerified;
import com.hyperlocal.provider.internal.dto.ProviderDtos.ProviderResponse;
import com.hyperlocal.provider.internal.dto.ProviderDtos.UpdateProviderRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProviderService {

    /** Pune city centre — the mock's default search origin. */
    static final double DEFAULT_LAT = 18.5204;
    static final double DEFAULT_LNG = 73.8567;

    private final ProviderProfileRepository providers;
    private final ApplicationEventPublisher events;

    ProviderService(ProviderProfileRepository providers, ApplicationEventPublisher events) {
        this.providers = providers;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<ProviderResponse> search(UUID categoryId, String sortBy, Double lat, Double lng,
            Double radiusKm, boolean onlyAvailable) {
        List<ProviderProfile> result;
        if ("rating".equals(sortBy)) {
            result = providers.searchByRating(categoryId, onlyAvailable);
        } else {
            result = providers.searchByDistance(
                    lat != null ? lat : DEFAULT_LAT,
                    lng != null ? lng : DEFAULT_LNG,
                    radiusKm != null ? radiusKm : 0,
                    categoryId,
                    onlyAvailable);
        }
        return result.stream().map(ProviderService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProviderResponse getById(UUID id) {
        return toResponse(require(id));
    }

    @Transactional(readOnly = true)
    public ProviderResponse getByUserId(UUID userId) {
        return providers.findByUserId(userId)
                .map(ProviderService::toResponse)
                .orElseThrow(() -> ApiException.notFound("Provider profile not found."));
    }

    @Transactional
    public ProviderResponse update(UUID providerId, UpdateProviderRequest request, AuthenticatedUser caller) {
        ProviderProfile profile = require(providerId);
        if (!caller.isAdmin() && !profile.getUserId().equals(caller.id())) {
            throw ApiException.forbidden("You can only edit your own profile.");
        }
        profile.applyUpdate(request.bio(), request.categoryId(), request.hourlyRate(),
                request.available(), request.yearsExperience(), request.areaLabel());
        providers.save(profile);
        if (request.lat() != null && request.lng() != null) {
            providers.updateLocation(providerId, request.lat(), request.lng());
        }
        publishUpserted(profile);
        return toResponse(require(providerId)); // re-read so generated lat/lng are fresh
    }

    @Transactional(readOnly = true)
    public List<ProviderResponse> pendingVerification() {
        return providers.findByVerificationStatusOrderByName("PENDING").stream()
                .map(ProviderService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProviderResponse> all() {
        return providers.findAllByOrderByNameAsc().stream()
                .map(ProviderService::toResponse)
                .toList();
    }

    @Transactional
    public ProviderResponse verify(UUID providerId, boolean approve) {
        ProviderProfile profile = require(providerId);
        if (!"PENDING".equals(profile.getVerificationStatus())) {
            throw ApiException.conflict("This provider has already been reviewed.");
        }
        profile.verify(approve);
        providers.save(profile);
        publishUpserted(profile);
        events.publishEvent(new ProviderVerified(
                profile.getId(), profile.getUserId(), profile.getName(),
                profile.getUserEmail(), approve));
        return toResponse(profile);
    }

    /**
     * Creates the PENDING profile for a newly registered provider. Called by
     * the module's synchronous UserRegistered listener so registration and
     * profile creation commit atomically.
     */
    @Transactional
    public void createForNewUser(UUID userId, String name, String email, UUID categoryId,
            String areaLabel, Double lat, Double lng) {
        if (providers.findByUserId(userId).isPresent()) {
            return;
        }
        ProviderProfile profile = new ProviderProfile(UUID.randomUUID(), userId, email, name, categoryId);
        if (areaLabel != null && !areaLabel.isBlank()) {
            profile.applyUpdate(null, null, null, null, null, areaLabel);
        }
        providers.save(profile);
        if (lat != null && lng != null) {
            providers.updateLocation(profile.getId(), lat, lng);
        } else {
            providers.updateLocation(profile.getId(), DEFAULT_LAT, DEFAULT_LNG);
        }
        publishUpserted(profile);
    }

    @Transactional
    public void recordCompletedJob(UUID providerId) {
        providers.findById(providerId).ifPresent(profile -> {
            profile.recordCompletedJob();
            providers.save(profile);
        });
    }

    @Transactional
    public void applyReview(UUID providerId, int rating) {
        providers.findById(providerId).ifPresent(profile -> {
            int newCount = profile.getReviewCount() + 1;
            double newAvg = (profile.getRating() * profile.getReviewCount() + rating) / newCount;
            // one decimal, like the mock
            profile.updateRating(Math.round(newAvg * 10.0) / 10.0, newCount);
            providers.save(profile);
        });
    }

    private ProviderProfile require(UUID id) {
        return providers.findById(id)
                .orElseThrow(() -> ApiException.notFound("Provider not found."));
    }

    private void publishUpserted(ProviderProfile p) {
        events.publishEvent(new ProviderUpserted(
                p.getId(), p.getUserId(), p.getName(), p.getUserEmail(), p.getCategoryId(),
                p.getHourlyRate(), p.isAvailable(), p.getVerificationStatus()));
    }

    private static ProviderResponse toResponse(ProviderProfile p) {
        return new ProviderResponse(
                p.getId(), p.getUserId(), p.getName(), p.getCategoryId(), p.getBio(),
                p.getYearsExperience(), p.getHourlyRate(),
                p.getLat() != null ? p.getLat() : DEFAULT_LAT,
                p.getLng() != null ? p.getLng() : DEFAULT_LNG,
                p.getAreaLabel(), p.getRating(), p.getReviewCount(), p.isAvailable(),
                p.getVerificationStatus(), p.getCompletedJobs());
    }
}
