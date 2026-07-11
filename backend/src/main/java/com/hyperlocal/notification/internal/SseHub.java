package com.hyperlocal.notification.internal;

import com.hyperlocal.events.BookingPayload;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * In-memory SSE fan-out per booking. Pushes the frontend-shaped
 * {@link BookingPayload} on every status change; a comment heartbeat keeps
 * proxies from reaping idle connections.
 */
@Component
public class SseHub {

    private static final Logger log = LoggerFactory.getLogger(SseHub.class);
    private static final long TIMEOUT_MS = 30L * 60 * 1000;

    private final Map<UUID, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID bookingId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        List<SseEmitter> list = emitters.computeIfAbsent(bookingId, k -> new CopyOnWriteArrayList<>());
        list.add(emitter);
        emitter.onCompletion(() -> remove(bookingId, emitter));
        emitter.onTimeout(() -> remove(bookingId, emitter));
        emitter.onError(e -> remove(bookingId, emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data("{}", MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            remove(bookingId, emitter);
        }
        return emitter;
    }

    public void push(BookingPayload booking) {
        List<SseEmitter> list = emitters.get(booking.id());
        if (list == null) {
            return;
        }
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("booking").data(booking, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                log.debug("SSE push failed, dropping subscriber for booking {}", booking.id());
                remove(booking.id(), emitter);
            }
        }
    }

    @Scheduled(fixedRate = 25_000)
    void heartbeat() {
        emitters.forEach((bookingId, list) -> {
            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event().comment("ping"));
                } catch (Exception e) {
                    remove(bookingId, emitter);
                }
            }
        });
    }

    private void remove(UUID bookingId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(bookingId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                emitters.remove(bookingId, list);
            }
        }
    }
}
