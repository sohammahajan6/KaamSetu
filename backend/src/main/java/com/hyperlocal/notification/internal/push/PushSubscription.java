package com.hyperlocal.notification.internal.push;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "push_subscription")
public class PushSubscription {

    @Id
    private UUID id;
    private UUID userId;
    private String endpoint;
    private String p256dh;
    private String auth;
    private Instant createdAt;

    public PushSubscription() {}

    public PushSubscription(UUID id, UUID userId, String endpoint, String p256dh, String auth) {
        this.id = id;
        this.userId = userId;
        this.endpoint = endpoint;
        this.p256dh = p256dh;
        this.auth = auth;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getEndpoint() { return endpoint; }
    public String getP256dh() { return p256dh; }
    public String getAuth() { return auth; }
}
