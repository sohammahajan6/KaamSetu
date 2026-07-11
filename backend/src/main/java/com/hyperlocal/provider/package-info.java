/**
 * Provider profiles: geolocated search (PostGIS), availability, admin
 * verification, and rating/job aggregates. Publishes
 * {@link com.hyperlocal.events.ProviderUpserted} and
 * {@link com.hyperlocal.events.ProviderVerified}; listens to
 * {@link com.hyperlocal.events.UserRegistered} (create profile),
 * {@link com.hyperlocal.events.BookingCompleted} (completed-jobs count) and
 * {@link com.hyperlocal.events.ReviewSubmitted} (rating aggregate).
 */
package com.hyperlocal.provider;
