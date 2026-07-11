-- Hyperlocal marketplace schema. One database, but each table is owned by
-- exactly one module (user, category, provider, booking, payment, review,
-- notification); *_snapshot / *_party tables are event-fed projections that
-- let modules read cross-module data without calling each other.

create extension if not exists postgis;

-- ---------------------------------------------------------------- user module
create table users (
    id            uuid primary key,
    name          text        not null,
    email         text        not null unique,
    password_hash text        not null,
    phone         text        not null default '',
    role          text        not null check (role in ('CUSTOMER', 'PROVIDER', 'ADMIN')),
    created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------ category module
create table service_category (
    id          uuid primary key,
    name        text           not null,
    slug        text           not null,
    description text           not null default '',
    icon        text           not null default 'wrench',
    base_price  numeric(10, 2) not null default 0,
    active      boolean        not null default true
);

-- ------------------------------------------------------------ provider module
-- location is the source of truth (PostGIS geography); lat/lng are generated
-- read-only projections of it so JPA never has to bind spatial types.
create table provider_profile (
    id                  uuid primary key,
    user_id             uuid           not null unique references users (id),
    user_email          text           not null default '',
    name                text           not null,
    category_id         uuid           not null references service_category (id),
    bio                 text           not null default '',
    years_experience    int            not null default 0,
    hourly_rate         numeric(10, 2) not null default 300,
    location            geography(Point, 4326),
    lat                 double precision generated always as (st_y(location::geometry)) stored,
    lng                 double precision generated always as (st_x(location::geometry)) stored,
    area_label          text           not null default 'Pune',
    rating              double precision not null default 0,
    review_count        int            not null default 0,
    available           boolean        not null default false,
    verification_status text           not null default 'PENDING'
        check (verification_status in ('PENDING', 'VERIFIED', 'REJECTED')),
    completed_jobs      int            not null default 0
);

create index idx_provider_profile_location on provider_profile using gist (location);
create index idx_provider_profile_category on provider_profile (category_id);
create index idx_provider_profile_status on provider_profile (verification_status);

-- ------------------------------------------------------------- booking module
-- Names/emails are denormalised at creation time (event-carried state), which
-- is also exactly what the frontend Booking interface expects.
-- location is reserved for future map features; the current API contract does
-- not carry booking coordinates, so it stays null.
create table booking (
    id               uuid primary key,
    customer_id      uuid           not null references users (id),
    customer_name    text           not null,
    customer_email   text           not null default '',
    provider_id      uuid           not null references provider_profile (id),
    provider_user_id uuid           not null,
    provider_name    text           not null,
    provider_email   text           not null default '',
    category_id      uuid           not null,
    category_name    text           not null,
    status           text           not null
        check (status in ('REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RATED')),
    scheduled_at     timestamptz    not null,
    address          text           not null,
    notes            text           not null default '',
    location         geography(Point, 4326),
    price            numeric(10, 2) not null,
    created_at       timestamptz    not null default now(),
    updated_at       timestamptz    not null default now()
);

create index idx_booking_customer on booking (customer_id, created_at desc);
create index idx_booking_provider_user on booking (provider_user_id, created_at desc);
create index idx_booking_provider on booking (provider_id);

-- Projections fed by ProviderUpserted / CategoryUpserted events.
create table booking_provider_snapshot (
    id                  uuid primary key,
    user_id             uuid           not null,
    name                text           not null,
    email               text           not null default '',
    category_id         uuid           not null,
    hourly_rate         numeric(10, 2) not null,
    available           boolean        not null,
    verification_status text           not null
);

create table booking_category_snapshot (
    id     uuid primary key,
    name   text    not null,
    active boolean not null
);

-- ------------------------------------------------------------- payment module
create table payment (
    id                  uuid primary key,
    booking_id          uuid           not null unique references booking (id),
    customer_id         uuid           not null,
    amount              numeric(10, 2) not null,
    razorpay_order_id   text,
    razorpay_payment_id text,
    status              text           not null default 'CREATED'
        check (status in ('CREATED', 'PAID', 'FAILED', 'REFUNDED')),
    created_at          timestamptz    not null default now(),
    updated_at          timestamptz    not null default now()
);

create index idx_payment_razorpay_order on payment (razorpay_order_id);

-- -------------------------------------------------------------- review module
create table review (
    id            uuid primary key,
    booking_id    uuid        not null unique references booking (id),
    customer_id   uuid        not null references users (id),
    customer_name text        not null,
    provider_id   uuid        not null references provider_profile (id),
    rating        int         not null check (rating between 1 and 5),
    comment       text        not null default '',
    created_at    timestamptz not null default now()
);

create index idx_review_provider on review (provider_id, created_at desc);

-- Which bookings are unlocked for review (fed by BookingCompleted events).
create table review_booking_snapshot (
    booking_id    uuid primary key,
    customer_id   uuid    not null,
    customer_name text    not null,
    provider_id   uuid    not null,
    reviewed      boolean not null default false
);

-- --------------------------------------------------------- notification module
-- Booking parties (fed synchronously by BookingRequested) — lets the SSE
-- stream endpoint authorise subscribers and lets email listeners address
-- parties without querying booking/user tables.
create table notification_booking_party (
    booking_id       uuid primary key,
    customer_id      uuid not null,
    customer_name    text not null default '',
    customer_email   text not null default '',
    provider_user_id uuid not null,
    provider_name    text not null default '',
    provider_email   text not null default ''
);
