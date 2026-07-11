CREATE TABLE chat_message (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES booking(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_chat_message_booking_id ON chat_message(booking_id);
