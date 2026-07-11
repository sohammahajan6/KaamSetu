package com.hyperlocal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Modular monolith. Each direct sub-package (user, provider, category, booking,
 * payment, notification, review, plus the shared kernels common/events) is a
 * Spring Modulith module; boundaries are enforced by ModularityTests.
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
