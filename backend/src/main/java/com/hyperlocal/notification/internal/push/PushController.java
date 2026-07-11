package com.hyperlocal.notification.internal.push;

import com.hyperlocal.common.CurrentUser;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/push")
public class PushController {

    private final PushSubscriptionRepository subscriptions;

    public PushController(PushSubscriptionRepository subscriptions) {
        this.subscriptions = subscriptions;
    }

    public record PushSubRequest(String endpoint, String p256dh, String auth) {}

    @PostMapping("/subscribe")
    @Transactional
    public ResponseEntity<Void> subscribe(@RequestBody PushSubRequest request) {
        UUID userId = CurrentUser.require().id();
        
        if (!subscriptions.existsByUserIdAndEndpoint(userId, request.endpoint())) {
            subscriptions.save(new PushSubscription(
                UUID.randomUUID(), userId, request.endpoint(), request.p256dh(), request.auth()
            ));
        }
        return ResponseEntity.ok().build();
    }
}
