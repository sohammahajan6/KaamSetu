package com.hyperlocal.notification.internal.push;

import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.List;
import java.util.UUID;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class WebPushService {

    private static final Logger log = LoggerFactory.getLogger(WebPushService.class);

    // Static VAPID keys for demo/free-tier purposes. 
    // In production, load from environment variables.
    private static final String PUBLIC_KEY = "BB4_knAkpKyYcQKqAiGQNV7J92zUwptTYSeAsHsmrjn_kI17kFzKEz6pW1SJ639Miw7cJk7DMs1mBOSoRJ2JzCE";
    private static final String PRIVATE_KEY = "kaginHc8McaF9lyTZQXckf4kM0E5rRcgvirlDZXL5gQ";

    private final PushSubscriptionRepository subscriptions;
    private PushService pushService;

    public WebPushService(PushSubscriptionRepository subscriptions) {
        this.subscriptions = subscriptions;
        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            this.pushService = new PushService(PUBLIC_KEY, PRIVATE_KEY, "mailto:admin@hyperlocal.com");
        } catch (GeneralSecurityException e) {
            log.error("Failed to initialize WebPushService", e);
        }
    }

    public void sendToUser(UUID userId, String title, String body) {
        if (pushService == null) return;
        
        List<PushSubscription> subs = subscriptions.findByUserId(userId);
        if (subs.isEmpty()) return;

        String payload = String.format("{\"title\":\"%s\", \"body\":\"%s\"}", title, body);

        for (PushSubscription sub : subs) {
            try {
                Subscription webPushSub = new Subscription(sub.getEndpoint(), new Subscription.Keys(sub.getP256dh(), sub.getAuth()));
                Notification notification = new Notification(webPushSub, payload);
                var response = pushService.send(notification);
                if (response.getStatusLine().getStatusCode() == 410) {
                    // Subscription expired or revoked
                    subscriptions.deleteByEndpoint(sub.getEndpoint());
                }
            } catch (Exception e) {
                log.warn("Failed to send push notification to endpoint {}", sub.getEndpoint());
            }
        }
    }
}
