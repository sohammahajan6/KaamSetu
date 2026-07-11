package com.hyperlocal.common.internal.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Supabase (and Railway/Heroku) hand out {@code postgres://user:pass@host:port/db}
 * URLs, while JDBC needs {@code jdbc:postgresql://…} plus separate credentials.
 * This rewrites DATABASE_URL transparently so either form works, and adds two
 * Supabase-specific survival flags: {@code sslmode=require} for remote hosts and
 * {@code prepareThreshold=0} when connecting through the transaction pooler
 * (port 6543, PgBouncer breaks server-side prepared statements).
 *
 * Registered via META-INF/spring.factories.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public int getOrder() {
        // After application.yml has been loaded.
        return ConfigDataEnvironmentPostProcessor.ORDER + 10;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = environment.getProperty("DATABASE_URL");
        if (raw == null || raw.isBlank()) {
            return;
        }
        raw = raw.trim();
        if (!raw.startsWith("postgres://") && !raw.startsWith("postgresql://")) {
            return; // already JDBC or something we shouldn't touch
        }

        URI uri = URI.create(raw);
        String host = uri.getHost();
        if (host == null) {
            return;
        }
        int port = uri.getPort() < 0 ? 5432 : uri.getPort();
        String path = (uri.getRawPath() == null || uri.getRawPath().isBlank()) ? "/postgres" : uri.getRawPath();

        Map<String, String> params = new LinkedHashMap<>();
        if (uri.getRawQuery() != null) {
            for (String pair : uri.getRawQuery().split("&")) {
                if (pair.isEmpty()) {
                    continue;
                }
                int eq = pair.indexOf('=');
                params.put(eq < 0 ? pair : pair.substring(0, eq), eq < 0 ? "" : pair.substring(eq + 1));
            }
        }
        boolean local = host.equals("localhost") || host.equals("127.0.0.1");
        if (!local) {
            params.putIfAbsent("sslmode", "require");
        }
        if (port == 6543) {
            params.putIfAbsent("prepareThreshold", "0");
        }

        StringBuilder jdbc = new StringBuilder("jdbc:postgresql://").append(host).append(':').append(port).append(path);
        if (!params.isEmpty()) {
            jdbc.append('?');
            jdbc.append(String.join("&", params.entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .toList()));
        }

        Map<String, Object> overrides = new HashMap<>();
        overrides.put("spring.datasource.url", jdbc.toString());

        String userInfo = uri.getUserInfo();
        boolean explicitCreds = notBlank(environment.getProperty("DATABASE_USERNAME"));
        if (userInfo != null && !explicitCreds) {
            int colon = userInfo.indexOf(':');
            String username = colon < 0 ? userInfo : userInfo.substring(0, colon);
            overrides.put("spring.datasource.username", URLDecoder.decode(username, StandardCharsets.UTF_8));
            if (colon >= 0) {
                overrides.put("spring.datasource.password",
                        URLDecoder.decode(userInfo.substring(colon + 1), StandardCharsets.UTF_8));
            }
        }

        environment.getPropertySources()
                .addFirst(new MapPropertySource("databaseUrlOverrides", overrides));
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
