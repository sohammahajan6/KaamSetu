package com.hyperlocal.common.internal.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

class DatabaseUrlEnvironmentPostProcessorTests {

    private final DatabaseUrlEnvironmentPostProcessor processor = new DatabaseUrlEnvironmentPostProcessor();
    private final SpringApplication app = new SpringApplication();

    @Test
    void skipJdbcUrl() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("DATABASE_URL", "jdbc:postgresql://localhost:5432/db");
        processor.postProcessEnvironment(env, app);
        assertThat(env.getProperty("spring.datasource.url")).isNull();
    }

    @Test
    void rewritePostgresUrl() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("DATABASE_URL",
                "postgres://user:pass@host.supabase.co:6543/postgres?sslmode=require");
        processor.postProcessEnvironment(env, app);
        String url = env.getProperty("spring.datasource.url");
        assertThat(url).startsWith("jdbc:postgresql://host.supabase.co:6543/postgres");
        assertThat(url).contains("sslmode=require");
        assertThat(url).contains("prepareThreshold=0"); // pooler port
        assertThat(env.getProperty("spring.datasource.username")).isEqualTo("user");
        assertThat(env.getProperty("spring.datasource.password")).isEqualTo("pass");
    }

    @Test
    void extractCredentials() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("DATABASE_URL", "postgres://user%40host:pass%21@localhost:5432/test");
        processor.postProcessEnvironment(env, app);
        assertThat(env.getProperty("spring.datasource.username")).isEqualTo("user@host");
        assertThat(env.getProperty("spring.datasource.password")).isEqualTo("pass!");
    }
}
