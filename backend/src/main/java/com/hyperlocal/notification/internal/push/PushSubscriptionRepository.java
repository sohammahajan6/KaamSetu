package com.hyperlocal.notification.internal.push;

import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.ListCrudRepository;

public interface PushSubscriptionRepository extends ListCrudRepository<PushSubscription, UUID> {
    List<PushSubscription> findByUserId(UUID userId);
    void deleteByEndpoint(String endpoint);
    boolean existsByUserIdAndEndpoint(UUID userId, String endpoint);
}
