package com.hyperlocal.user.internal.dto;

import jakarta.validation.constraints.NotBlank;

public record SavedAddressRequest(
        @NotBlank(message = "Enter your area") String area,
        @NotBlank(message = "Enter flat / house number") String flat,
        String building,
        @NotBlank(message = "Enter street / road name") String street,
        String landmark,
        Double lat,
        Double lng) {
}
