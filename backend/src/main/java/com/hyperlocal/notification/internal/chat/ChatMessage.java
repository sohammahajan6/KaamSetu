package com.hyperlocal.notification.internal.chat;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    private UUID id;
    private UUID bookingId;
    private UUID senderId;
    private String content;
    private Instant createdAt;

    public ChatMessage() {
    }

    public ChatMessage(UUID id, UUID bookingId, UUID senderId, String content) {
        this.id = id;
        this.bookingId = bookingId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
