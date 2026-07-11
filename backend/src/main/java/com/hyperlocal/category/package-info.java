/**
 * Service categories: public catalogue plus admin CRUD. Publishes
 * {@link com.hyperlocal.events.CategoryUpserted} / {@link com.hyperlocal.events.CategoryDeleted}
 * so the booking module can keep its category snapshot current.
 */
package com.hyperlocal.category;
