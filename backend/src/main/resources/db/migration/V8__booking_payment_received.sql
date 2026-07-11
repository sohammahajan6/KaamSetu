-- Track whether payment has been received for a booking.
-- Defaults to false; set to true when PaymentCompleted event is processed.
ALTER TABLE booking ADD COLUMN payment_received BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: existing bookings that reached IN_PROGRESS or later must have been paid.
UPDATE booking SET payment_received = TRUE
WHERE status IN ('IN_PROGRESS', 'COMPLETED', 'RATED');
