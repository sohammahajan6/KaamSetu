package com.hyperlocal;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/**
 * Fail the build if any module depends on internals of another module, or if
 * the module graph contains an unplanned cycle.
 */
class ModularityTests {

    @Test
    void verifyModuleBoundaries() {
        var modules = ApplicationModules.of(Application.class);
        modules.verify();
    }

    @Test
    void writeDocumentationSnippets() {
        var modules = ApplicationModules.of(Application.class);
        new Documenter(modules).writeDocumentation();
    }
}
