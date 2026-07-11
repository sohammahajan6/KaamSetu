/**
 * Shared event kernel. All cross-module communication happens exclusively via
 * these immutable event records published through {@code ApplicationEventPublisher}
 * and consumed with {@code @ApplicationModuleListener} (or synchronous
 * {@code @EventListener} where read-your-writes consistency is required).
 *
 * <p>Keeping every event type here (rather than in the publishing module) keeps the
 * module graph acyclic: booking consumes provider/category events while provider
 * consumes booking/review events — mutual references between those modules would
 * otherwise be a cycle that fails {@code ApplicationModules.verify()}.
 */
package com.hyperlocal.events;
