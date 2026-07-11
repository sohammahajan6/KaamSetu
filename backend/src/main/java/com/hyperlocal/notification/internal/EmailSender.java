package com.hyperlocal.notification.internal;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Transactional email via Brevo HTTP API. Logs instead of sending if key is missing,
 * and never throws — a failed email must not fail the business flow around it.
 */
@Component
class EmailSender {

    private static final Logger log = LoggerFactory.getLogger(EmailSender.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final String senderEmail;
    private final String senderName;
    private final String apiKey;
    private final RestTemplate restTemplate;

    EmailSender(
            @Value("${app.brevo.sender-email}") String senderEmail,
            @Value("${app.brevo.sender-name}") String senderName,
            @Value("${app.brevo.api-key:}") String apiKey) {
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
        
        if (!isConfigured()) {
            log.warn("Brevo API not configured (no api-key) — emails will be logged, not sent.");
        }
    }

    boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equals("unconfigured");
    }

    void send(String toEmail, String toName, String subject, String htmlBody) {
        if (toEmail == null || toEmail.isBlank() || toEmail.endsWith("@seed.invalid")) {
            return;
        }
        if (!isConfigured()) {
            log.info("[email:log-only] to={} subject={}", toEmail, subject);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);
            headers.set("accept", "application/json");

            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", senderName, "email", senderEmail),
                    "to", List.of(Map.of("name", toName != null ? toName : "", "email", toEmail)),
                    "subject", subject,
                    "htmlContent", htmlBody
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(BREVO_API_URL, request, String.class);
            log.info("[email:sent] to={} subject={}", toEmail, subject);
        } catch (Exception e) {
            log.error("[email:failed] to={} subject={} — {}", toEmail, subject, e.getMessage());
        }
    }

    void sendPlain(String toEmail, String toName, String subject, String textBody) {
        if (toEmail == null || toEmail.isBlank() || toEmail.endsWith("@seed.invalid")) {
            return;
        }
        if (!isConfigured()) {
            log.info("[email:log-only] to={} subject={}", toEmail, subject);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);
            headers.set("accept", "application/json");

            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", senderName, "email", senderEmail),
                    "to", List.of(Map.of("name", toName != null ? toName : "", "email", toEmail)),
                    "subject", subject,
                    "textContent", textBody
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(BREVO_API_URL, request, String.class);
            log.info("[email:sent:plain] to={} subject={}", toEmail, subject);
        } catch (Exception e) {
            log.error("[email:failed:plain] to={} subject={} — {}", toEmail, subject, e.getMessage());
        }
    }
}
