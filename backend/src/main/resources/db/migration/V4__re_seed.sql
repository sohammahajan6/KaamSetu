-- Idempotent seed re-insert. Run this after truncating tables to restore
-- the demo dataset. Every INSERT uses ON CONFLICT so it's safe to run
-- repeatedly. Password: "password"

-- Categories (safe to re-run)
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
     'Haircuts, grooming, facials and beauty services at your door', 'scissors', 399, true)
on conflict (id) do nothing;

-- Users
insert into users (id, name, email, password_hash, phone, role, created_at) values
    ('c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 11001', 'CUSTOMER', now() - interval '90 days'),
    ('ad000000-0000-4000-8000-000000000001', 'Admin', 'admin@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 00001', 'ADMIN', now() - interval '365 days'),
    ('b0000000-0000-4000-8000-000000000001', 'Ramesh Patil', 'ramesh@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2000', 'PROVIDER', now() - interval '200 days'),
    ('b0000000-0000-4000-8000-000000000002', 'Suresh Jadhav', 'suresh@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2001', 'PROVIDER', now() - interval '190 days'),
    ('b0000000-0000-4000-8000-000000000003', 'Vikram Shinde', 'provider@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2002', 'PROVIDER', now() - interval '180 days'),
    ('b0000000-0000-4000-8000-000000000004', 'Anil Deshmukh', 'anil@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2003', 'PROVIDER', now() - interval '170 days'),
    ('b0000000-0000-4000-8000-000000000005', 'Mahesh Gaikwad', 'mahesh@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2004', 'PROVIDER', now() - interval '160 days'),
    ('b0000000-0000-4000-8000-000000000006', 'Santosh More', 'santosh@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2005', 'PROVIDER', now() - interval '150 days'),
    ('b0000000-0000-4000-8000-000000000007', 'Prakash Bhosale', 'prakash@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2006', 'PROVIDER', now() - interval '140 days'),
    ('b0000000-0000-4000-8000-000000000008', 'Deepa Joshi', 'deepa@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2007', 'PROVIDER', now() - interval '130 days'),
    ('b0000000-0000-4000-8000-000000000009', 'Kavita Pawar', 'kavita@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2008', 'PROVIDER', now() - interval '120 days'),
    ('b0000000-0000-4000-8000-000000000010', 'Sunita Kadam', 'sunita@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2009', 'PROVIDER', now() - interval '110 days'),
    ('b0000000-0000-4000-8000-000000000011', 'Rahul Salunkhe', 'rahul@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2010', 'PROVIDER', now() - interval '100 days'),
    ('b0000000-0000-4000-8000-000000000012', 'Nilesh Chavan', 'nilesh@demo.com',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2011', 'PROVIDER', now() - interval '90 days')
on conflict (id) do nothing;

-- Provider profiles
insert into provider_profile
    (id, user_id, user_email, name, category_id, bio, years_experience, hourly_rate,
     location, area_label, rating, review_count, available, verification_status, completed_jobs)
values
    ('20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'ramesh@demo.com', 'Ramesh Patil',
     '11111111-1111-4111-8111-000000000001',
     '15 years of residential wiring and switchboard work across Kothrud and Karve Nagar.',
     15, 350, ST_SetSRID(ST_MakePoint(73.8077, 18.5074), 4326)::geography, 'Kothrud', 4.8, 132, true, 'VERIFIED', 410),
    ('20000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'suresh@demo.com', 'Suresh Jadhav',
     '11111111-1111-4111-8111-000000000001',
     'Specialist in inverter setups and MCB panels across Hadapsar.',
     9, 300, ST_SetSRID(ST_MakePoint(73.9260, 18.5089), 4326)::geography, 'Hadapsar', 4.5, 78, true, 'VERIFIED', 215),
    ('20000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'provider@demo.com', 'Vikram Shinde',
     '11111111-1111-4111-8111-000000000002',
     'Bathroom fittings, concealed piping and leak detection in Baner and Aundh.',
     12, 320, ST_SetSRID(ST_MakePoint(73.7897, 18.5599), 4326)::geography, 'Baner', 4.7, 96, true, 'VERIFIED', 305),
    ('20000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', 'anil@demo.com', 'Anil Deshmukh',
     '11111111-1111-4111-8111-000000000002',
     'Quick fixes to full bathroom renovations in Viman Nagar.',
     7, 280, ST_SetSRID(ST_MakePoint(73.9143, 18.5679), 4326)::geography, 'Viman Nagar', 4.3, 54, false, 'VERIFIED', 148),
    ('20000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'mahesh@demo.com', 'Mahesh Gaikwad',
     '11111111-1111-4111-8111-000000000003',
     'Certified HVAC technician. Split and window AC servicing, all brands.',
     11, 450, ST_SetSRID(ST_MakePoint(73.8475, 18.5308), 4326)::geography, 'Shivajinagar', 4.9, 201, true, 'VERIFIED', 520),
    ('20000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000006', 'santosh@demo.com', 'Santosh More',
     '11111111-1111-4111-8111-000000000003',
     'AC installation and AMC contracts in Wakad and Hinjawadi.',
     6, 400, ST_SetSRID(ST_MakePoint(73.7629, 18.5975), 4326)::geography, 'Wakad', 4.4, 63, true, 'VERIFIED', 170),
    ('20000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000007', 'prakash@demo.com', 'Prakash Bhosale',
     '11111111-1111-4111-8111-000000000004',
     'Team of 4 for full-home deep cleaning, sofa shampooing and marble polishing.',
     8, 500, ST_SetSRID(ST_MakePoint(73.8650, 18.4634), 4326)::geography, 'Katraj', 4.6, 88, true, 'VERIFIED', 260),
    ('20000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000008', 'deepa@demo.com', 'Deepa Joshi',
     '11111111-1111-4111-8111-000000000004',
     'Kitchen and bathroom deep-clean specialist in Kalyani Nagar.',
     5, 450, ST_SetSRID(ST_MakePoint(73.9021, 18.5481), 4326)::geography, 'Kalyani Nagar', 4.7, 71, true, 'VERIFIED', 190),
    ('20000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000009', 'kavita@demo.com', 'Kavita Pawar',
     '11111111-1111-4111-8111-000000000005',
     'Bridal makeup, facials and haircuts at home. 10 years experience.',
     10, 600, ST_SetSRID(ST_MakePoint(73.8567, 18.5203), 4326)::geography, 'Deccan', 4.9, 154, true, 'VERIFIED', 380),
    ('20000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000010', 'sunita@demo.com', 'Sunita Kadam',
     '11111111-1111-4111-8111-000000000005',
     'Threading, waxing, mehendi and party makeup. Serving Sinhagad Road.',
     4, 400, ST_SetSRID(ST_MakePoint(73.8199, 18.4823), 4326)::geography, 'Sinhagad Road', 4.2, 39, true, 'VERIFIED', 95),
    ('20000000-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000011', 'rahul@demo.com', 'Rahul Salunkhe',
     '11111111-1111-4111-8111-000000000001',
     'New to the platform. 3 years residential electrical work in Pimpri-Chinchwad.',
     3, 250, ST_SetSRID(ST_MakePoint(73.7997, 18.6298), 4326)::geography, 'Pimpri', 0, 0, false, 'PENDING', 0),
    ('20000000-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000012', 'nilesh@demo.com', 'Nilesh Chavan',
     '11111111-1111-4111-8111-000000000002',
     'Plumbing contractor moving to on-demand work. Based in Kondhwa.',
     6, 300, ST_SetSRID(ST_MakePoint(73.8931, 18.4695), 4326)::geography, 'Kondhwa', 0, 0, false, 'PENDING', 0)
on conflict (id) do nothing;

-- Bookings
insert into booking (id, customer_id, customer_name, customer_email, provider_id, provider_user_id, provider_name, provider_email, category_id, category_name, status, scheduled_at, address, notes, price, created_at, updated_at) values
    ('30000000-0000-4000-8000-000000001001', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Ramesh Patil', 'ramesh@demo.com',
     '11111111-1111-4111-8111-000000000001', 'Electrician', 'REQUESTED', now() + interval '2 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Two switchboards sparking.', 350, now() - interval '0.2 days', now() - interval '0.2 days'),
    ('30000000-0000-4000-8000-000000001002', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'Mahesh Gaikwad', 'mahesh@demo.com',
     '11111111-1111-4111-8111-000000000003', 'AC Repair', 'ACCEPTED', now() + interval '1 day',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Split AC not cooling.', 450, now() - interval '1 day', now() - interval '0.5 days'),
    ('30000000-0000-4000-8000-000000001003', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'Vikram Shinde', 'provider@demo.com',
     '11111111-1111-4111-8111-000000000002', 'Plumber', 'IN_PROGRESS', now() - interval '0.1 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Kitchen sink pipe leaking.', 320, now() - interval '2 days', now() - interval '0.05 days'),
    ('30000000-0000-4000-8000-000000001004', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000007', 'Prakash Bhosale', 'prakash@demo.com',
     '11111111-1111-4111-8111-000000000004', 'Home Cleaning', 'COMPLETED', now() - interval '3 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Full 2BHK deep clean.', 1500, now() - interval '5 days', now() - interval '3 days'),
    ('30000000-0000-4000-8000-000000001005', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000009', 'Kavita Pawar', 'kavita@demo.com',
     '11111111-1111-4111-8111-000000000005', 'Salon at Home', 'RATED', now() - interval '10 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Haircut and facial for two.', 1200, now() - interval '12 days', now() - interval '9 days'),
    ('30000000-0000-4000-8000-000000001006', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Suresh Jadhav', 'suresh@demo.com',
     '11111111-1111-4111-8111-000000000001', 'Electrician', 'CANCELLED', now() - interval '6 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Fan installation.', 300, now() - interval '8 days', now() - interval '7 days')
on conflict (id) do nothing;

-- Projection rows + payments + reviews
insert into booking_provider_snapshot (id, user_id, name, email, category_id, hourly_rate, available, verification_status)
select id, user_id, name, user_email, category_id, hourly_rate, available, verification_status from provider_profile
on conflict (id) do nothing;

insert into booking_category_snapshot (id, name, active)
select id, name, active from service_category
on conflict (id) do nothing;

insert into notification_booking_party (booking_id, customer_id, customer_name, customer_email, provider_user_id, provider_name, provider_email)
select id, customer_id, customer_name, customer_email, provider_user_id, provider_name, provider_email from booking
on conflict (booking_id) do nothing;
