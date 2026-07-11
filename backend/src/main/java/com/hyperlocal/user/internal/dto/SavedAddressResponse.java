package com.hyperlocal.user.internal.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record SavedAddressResponse(
        UUID id,
        UUID userId,
        String area,
        String flat,
        String building,
        String street,
        String landmark,
        Double lat,
        Double lng) {
}
