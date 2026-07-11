/**
 * Reacts to domain events: transactional email via Brevo (log-only without an
 * API key) and live booking updates over SSE. Owns only a small event-fed
 * projection of booking parties, used to authorise SSE subscribers and address
 * emails without querying other modules.
 */
package com.hyperlocal.notification;
