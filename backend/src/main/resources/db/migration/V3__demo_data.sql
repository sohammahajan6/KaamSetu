-- Demo dataset mirroring the frontend mock (src/api/seed.ts) so the app is
-- fully browsable the moment the API client is swapped. Password for every
-- seed account: "password". Delete this migration before first run if you
-- want a clean production database.

-- ---------------------------------------------------------------------- users
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
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '+91 98220 2011', 'PROVIDER', now() - interval '90 days'),
    -- review-only historical customers (not shown in any UI list)
    ('c0000000-0000-4000-8000-000000000101', 'Priya Nair', 'priya@seed.invalid',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '', 'CUSTOMER', now() - interval '120 days'),
    ('c0000000-0000-4000-8000-000000000102', 'Rohan Mehta', 'rohan@seed.invalid',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '', 'CUSTOMER', now() - interval '120 days'),
    ('c0000000-0000-4000-8000-000000000103', 'Sneha Kulkarni', 'sneha@seed.invalid',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '', 'CUSTOMER', now() - interval '120 days'),
    ('c0000000-0000-4000-8000-000000000104', 'Amit Bhagwat', 'amit@seed.invalid',
     '$2a$10$9/mXNj91TKIA8ww7H94VKuJbONy/8JCAXYy8Mu.IELyRXX3p2r.GO', '', 'CUSTOMER', now() - interval '120 days');

-- ---------------------------------------------------------- provider profiles
insert into provider_profile
    (id, user_id, user_email, name, category_id, bio, years_experience, hourly_rate,
     location, area_label, rating, review_count, available, verification_status, completed_jobs)
values
    ('20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'ramesh@demo.com', 'Ramesh Patil',
     '11111111-1111-4111-8111-000000000001',
     '15 years of residential wiring and switchboard work across Kothrud and Karve Nagar. Licensed and insured.',
     15, 350, ST_SetSRID(ST_MakePoint(73.8077, 18.5074), 4326)::geography, 'Kothrud', 4.8, 132, true, 'VERIFIED', 410),
    ('20000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'suresh@demo.com', 'Suresh Jadhav',
     '11111111-1111-4111-8111-000000000001',
     'Specialist in inverter setups, MCB panels and fault finding. Same-day service in and around Hadapsar.',
     9, 300, ST_SetSRID(ST_MakePoint(73.9260, 18.5089), 4326)::geography, 'Hadapsar', 4.5, 78, true, 'VERIFIED', 215),
    ('20000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'provider@demo.com', 'Vikram Shinde',
     '11111111-1111-4111-8111-000000000002',
     'Bathroom fittings, concealed piping and leak detection. Trusted by housing societies in Baner and Aundh.',
     12, 320, ST_SetSRID(ST_MakePoint(73.7897, 18.5599), 4326)::geography, 'Baner', 4.7, 96, true, 'VERIFIED', 305),
    ('20000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', 'anil@demo.com', 'Anil Deshmukh',
     '11111111-1111-4111-8111-000000000002',
     'Quick fixes to full bathroom renovations. Serving Viman Nagar, Kharadi and Wadgaon Sheri.',
     7, 280, ST_SetSRID(ST_MakePoint(73.9143, 18.5679), 4326)::geography, 'Viman Nagar', 4.3, 54, false, 'VERIFIED', 148),
    ('20000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'mahesh@demo.com', 'Mahesh Gaikwad',
     '11111111-1111-4111-8111-000000000003',
     'Certified HVAC technician. Split and window AC servicing, gas charging, PCB repair. All brands.',
     11, 450, ST_SetSRID(ST_MakePoint(73.8475, 18.5308), 4326)::geography, 'Shivajinagar', 4.9, 201, true, 'VERIFIED', 520),
    ('20000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000006', 'santosh@demo.com', 'Santosh More',
     '11111111-1111-4111-8111-000000000003',
     'AC installation and AMC contracts for homes and small offices in Wakad and Hinjawadi.',
     6, 400, ST_SetSRID(ST_MakePoint(73.7629, 18.5975), 4326)::geography, 'Wakad', 4.4, 63, true, 'VERIFIED', 170),
    ('20000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000007', 'prakash@demo.com', 'Prakash Bhosale',
     '11111111-1111-4111-8111-000000000004',
     'Team of 4 for full-home deep cleaning, sofa shampooing and marble polishing. Eco-friendly chemicals.',
     8, 500, ST_SetSRID(ST_MakePoint(73.8650, 18.4634), 4326)::geography, 'Katraj', 4.6, 88, true, 'VERIFIED', 260),
    ('20000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000008', 'deepa@demo.com', 'Deepa Joshi',
     '11111111-1111-4111-8111-000000000004',
     'Kitchen and bathroom deep-clean specialist. Serving Kalyani Nagar and Koregaon Park.',
     5, 450, ST_SetSRID(ST_MakePoint(73.9021, 18.5481), 4326)::geography, 'Kalyani Nagar', 4.7, 71, true, 'VERIFIED', 190),
    ('20000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000009', 'kavita@demo.com', 'Kavita Pawar',
     '11111111-1111-4111-8111-000000000005',
     'Bridal makeup, facials and haircuts at home. 10 years with premium salons before going independent.',
     10, 600, ST_SetSRID(ST_MakePoint(73.8567, 18.5203), 4326)::geography, 'Deccan', 4.9, 154, true, 'VERIFIED', 380),
    ('20000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000010', 'sunita@demo.com', 'Sunita Kadam',
     '11111111-1111-4111-8111-000000000005',
     'Threading, waxing, mehendi and party makeup. Serving Sinhagad Road and Dhayari.',
     4, 400, ST_SetSRID(ST_MakePoint(73.8199, 18.4823), 4326)::geography, 'Sinhagad Road', 4.2, 39, true, 'VERIFIED', 95),
    ('20000000-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000011', 'rahul@demo.com', 'Rahul Salunkhe',
     '11111111-1111-4111-8111-000000000001',
     'New to the platform. 3 years experience with residential electrical work in Pimpri-Chinchwad.',
     3, 250, ST_SetSRID(ST_MakePoint(73.7997, 18.6298), 4326)::geography, 'Pimpri', 0, 0, false, 'PENDING', 0),
    ('20000000-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000012', 'nilesh@demo.com', 'Nilesh Chavan',
     '11111111-1111-4111-8111-000000000002',
     'Plumbing contractor moving to on-demand work. Based in Kondhwa.',
     6, 300, ST_SetSRID(ST_MakePoint(73.8931, 18.4695), 4326)::geography, 'Kondhwa', 0, 0, false, 'PENDING', 0);

insert into booking_provider_snapshot (id, user_id, name, email, category_id, hourly_rate, available, verification_status)
select id, user_id, name, user_email, category_id, hourly_rate, available, verification_status from provider_profile;

-- ------------------------------------------------------------------- bookings
-- One in every status for the demo customer, matching seedBookings.
insert into booking
    (id, customer_id, customer_name, customer_email, provider_id, provider_user_id, provider_name, provider_email,
     category_id, category_name, status, scheduled_at, address, notes, price, created_at, updated_at)
values
    ('30000000-0000-4000-8000-000000001001', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Ramesh Patil', 'ramesh@demo.com',
     '11111111-1111-4111-8111-000000000001', 'Electrician', 'REQUESTED', now() + interval '2 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Two switchboards sparking in the living room. Please bring spare MCBs.', 350,
     now() - interval '0.2 days', now() - interval '0.2 days'),
    ('30000000-0000-4000-8000-000000001002', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'Mahesh Gaikwad', 'mahesh@demo.com',
     '11111111-1111-4111-8111-000000000003', 'AC Repair', 'ACCEPTED', now() + interval '1 day',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Split AC not cooling, likely needs a gas refill.', 450,
     now() - interval '1 day', now() - interval '0.5 days'),
    ('30000000-0000-4000-8000-000000001003', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'Vikram Shinde', 'provider@demo.com',
     '11111111-1111-4111-8111-000000000002', 'Plumber', 'IN_PROGRESS', now() - interval '0.1 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Kitchen sink pipe leaking under the counter.', 320,
     now() - interval '2 days', now() - interval '0.05 days'),
    ('30000000-0000-4000-8000-000000001004', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000007', 'Prakash Bhosale', 'prakash@demo.com',
     '11111111-1111-4111-8111-000000000004', 'Home Cleaning', 'COMPLETED', now() - interval '3 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Full 2BHK deep clean before Diwali.', 1500,
     now() - interval '5 days', now() - interval '3 days'),
    ('30000000-0000-4000-8000-000000001005', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000009', 'Kavita Pawar', 'kavita@demo.com',
     '11111111-1111-4111-8111-000000000005', 'Salon at Home', 'RATED', now() - interval '10 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Haircut and facial for two people.', 1200,
     now() - interval '12 days', now() - interval '9 days'),
    ('30000000-0000-4000-8000-000000001006', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', 'customer@demo.com',
     '20000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Suresh Jadhav', 'suresh@demo.com',
     '11111111-1111-4111-8111-000000000001', 'Electrician', 'CANCELLED', now() - interval '6 days',
     'B-402, Gulmohar Residency, Kothrud, Pune 411038',
     'Fan installation in the bedroom.', 300,
     now() - interval '8 days', now() - interval '7 days'),
    -- historical rated bookings so provider review lists have depth
    ('30000000-0000-4000-8000-000000009001', 'c0000000-0000-4000-8000-000000000101', 'Priya Nair', 'priya@seed.invalid',
     '20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Ramesh Patil', 'ramesh@demo.com',
     '11111111-1111-4111-8111-000000000001', 'Electrician', 'RATED', now() - interval '21 days',
     'Karve Nagar, Pune', 'Wiring fault in two bedrooms.', 350,
     now() - interval '22 days', now() - interval '20 days'),
    ('30000000-0000-4000-8000-000000009002', 'c0000000-0000-4000-8000-000000000102', 'Rohan Mehta', 'rohan@seed.invalid',
     '20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Ramesh Patil', 'ramesh@demo.com',
     '11111111-1111-4111-8111-000000000001', 'Electrician', 'RATED', now() - interval '36 days',
     'Kothrud, Pune', 'Switchboard replacement.', 350,
     now() - interval '37 days', now() - interval '35 days'),
    ('30000000-0000-4000-8000-000000009003', 'c0000000-0000-4000-8000-000000000103', 'Sneha Kulkarni', 'sneha@seed.invalid',
     '20000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'Mahesh Gaikwad', 'mahesh@demo.com',
     '11111111-1111-4111-8111-000000000003', 'AC Repair', 'RATED', now() - interval '16 days',
     'Shivajinagar, Pune', 'AC servicing and gas top-up.', 450,
     now() - interval '17 days', now() - interval '15 days'),
    ('30000000-0000-4000-8000-000000009004', 'c0000000-0000-4000-8000-000000000104', 'Amit Bhagwat', 'amit@seed.invalid',
     '20000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'Vikram Shinde', 'provider@demo.com',
     '11111111-1111-4111-8111-000000000002', 'Plumber', 'RATED', now() - interval '29 days',
     'Baner, Pune', 'Bathroom tap and drainage fixes.', 320,
     now() - interval '30 days', now() - interval '28 days');

-- Pending payment orders for the still-active demo bookings.
insert into payment (id, booking_id, customer_id, amount, status, created_at, updated_at) values
    ('50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000001001',
     'c0000000-0000-4000-8000-000000000001', 350, 'CREATED', now() - interval '0.2 days', now() - interval '0.2 days'),
    ('50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000001002',
     'c0000000-0000-4000-8000-000000000001', 450, 'CREATED', now() - interval '1 day', now() - interval '1 day'),
    ('50000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000001003',
     'c0000000-0000-4000-8000-000000000001', 320, 'CREATED', now() - interval '2 days', now() - interval '2 days');

-- -------------------------------------------------------------------- reviews
insert into review (id, booking_id, customer_id, customer_name, provider_id, rating, comment, created_at) values
    ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000001005',
     'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni', '20000000-0000-4000-8000-000000000009', 5,
     'Kavita was punctual and extremely professional. Best at-home salon experience so far.', now() - interval '9 days'),
    ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000009001',
     'c0000000-0000-4000-8000-000000000101', 'Priya Nair', '20000000-0000-4000-8000-000000000001', 5,
     'Fixed a tricky wiring fault other electricians had given up on. Highly recommended.', now() - interval '20 days'),
    ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000009002',
     'c0000000-0000-4000-8000-000000000102', 'Rohan Mehta', '20000000-0000-4000-8000-000000000001', 4,
     'Good work, arrived 20 minutes late but finished quickly.', now() - interval '35 days'),
    ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000009003',
     'c0000000-0000-4000-8000-000000000103', 'Sneha Kulkarni', '20000000-0000-4000-8000-000000000005', 5,
     'AC works like new. Explained the issue clearly and charged fairly.', now() - interval '15 days'),
    ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000009004',
     'c0000000-0000-4000-8000-000000000104', 'Amit Bhagwat', '20000000-0000-4000-8000-000000000003', 4,
     'Solid plumbing work, cleaned up after finishing.', now() - interval '28 days');

-- Review unlock projections: bk-1004 is COMPLETED and awaiting its review.
insert into review_booking_snapshot (booking_id, customer_id, customer_name, provider_id, reviewed) values
    ('30000000-0000-4000-8000-000000001004', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni',
     '20000000-0000-4000-8000-000000000007', false),
    ('30000000-0000-4000-8000-000000001005', 'c0000000-0000-4000-8000-000000000001', 'Aarav Kulkarni',
     '20000000-0000-4000-8000-000000000009', true),
    ('30000000-0000-4000-8000-000000009001', 'c0000000-0000-4000-8000-000000000101', 'Priya Nair',
     '20000000-0000-4000-8000-000000000001', true),
    ('30000000-0000-4000-8000-000000009002', 'c0000000-0000-4000-8000-000000000102', 'Rohan Mehta',
     '20000000-0000-4000-8000-000000000001', true),
    ('30000000-0000-4000-8000-000000009003', 'c0000000-0000-4000-8000-000000000103', 'Sneha Kulkarni',
     '20000000-0000-4000-8000-000000000005', true),
    ('30000000-0000-4000-8000-000000009004', 'c0000000-0000-4000-8000-000000000104', 'Amit Bhagwat',
     '20000000-0000-4000-8000-000000000003', true);

-- SSE / notification party projections for all seeded bookings.
insert into notification_booking_party
    (booking_id, customer_id, customer_name, customer_email, provider_user_id, provider_name, provider_email)
select id, customer_id, customer_name, customer_email, provider_user_id, provider_name, provider_email
from booking;
