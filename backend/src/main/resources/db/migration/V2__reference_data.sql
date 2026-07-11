-- Service categories (mirrors src/api/seed.ts seedCategories). Inserted with
-- fixed UUIDs; the booking-module projection rows are seeded alongside because
-- SQL seeds bypass the runtime event flow that normally maintains them.

insert into service_category (id, name, slug, description, icon, base_price, active) values
    ('11111111-1111-4111-8111-000000000001', 'Electrician', 'electrician',
     'Wiring, switchboards, fixture installation and electrical repairs', 'zap', 299, true),
    ('11111111-1111-4111-8111-000000000002', 'Plumber', 'plumber',
     'Leak repair, tap and pipe fitting, bathroom installations', 'wrench', 249, true),
    ('11111111-1111-4111-8111-000000000003', 'AC Repair', 'ac-repair',
     'AC servicing, gas refill, installation and uninstallation', 'wind', 499, true),
    ('11111111-1111-4111-8111-000000000004', 'Home Cleaning', 'home-cleaning',
     'Deep cleaning for kitchens, bathrooms and full homes', 'sparkles', 799, true),
    ('11111111-1111-4111-8111-000000000005', 'Salon at Home', 'salon-at-home',
     'Haircuts, grooming, facials and beauty services at your door', 'scissors', 399, true);

insert into booking_category_snapshot (id, name, active)
select id, name, active from service_category;
