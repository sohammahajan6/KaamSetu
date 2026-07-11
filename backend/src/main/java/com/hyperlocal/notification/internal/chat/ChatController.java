package com.hyperlocal.notification.internal.chat;

import com.hyperlocal.common.AuthenticatedUser;
import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.notification.internal.BookingParty;
import com.hyperlocal.notification.internal.BookingPartyRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    private final ChatMessageRepository chatMessages;
    private final BookingPartyRepository parties;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatMessageRepository chatMessages, BookingPartyRepository parties, SimpMessagingTemplate messagingTemplate) {
        this.chatMessages = chatMessages;
        this.parties = parties;
        this.messagingTemplate = messagingTemplate;
    }

    public record SendMessageRequest(String content) {}

    @MessageMapping("/chat/{bookingId}")
    public void sendMessage(@DestinationVariable UUID bookingId, @Payload SendMessageRequest request, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return; // Not authenticated
        }
        
        BookingParty party = parties.findById(bookingId).orElse(null);
        if (party == null) return;
        
        boolean allowed = party.getCustomerId().equals(user.id()) || party.getProviderUserId().equals(user.id());
        if (!allowed) return;

        ChatMessage msg = new ChatMessage(UUID.randomUUID(), bookingId, user.id(), request.content());
        chatMessages.save(msg);

        // Broadcast to subscribers of /topic/chat/{bookingId}
        messagingTemplate.convertAndSend("/topic/chat/" + bookingId, msg);
    }

    @GetMapping("/api/bookings/{bookingId}/chat")
    public List<ChatMessage> getHistory(@PathVariable UUID bookingId) {
        AuthenticatedUser user = CurrentUser.require();
        BookingParty party = parties.findById(bookingId).orElse(null);
        if (party == null) throw com.hyperlocal.common.ApiException.notFound("Booking not found");
        
        boolean allowed = party.getCustomerId().equals(user.id()) || party.getProviderUserId().equals(user.id());
        if (!allowed) throw com.hyperlocal.common.ApiException.forbidden("You don't have access to this chat.");

        return chatMessages.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }
}
