-- Per-user saved addresses, used to pre-fill the booking form.
-- Each user can have at most one saved address as of now.
create table if not exists saved_address (
    id        uuid primary key,
    user_id   uuid        not null unique references users (id),
    area      text        not null,
    flat      text        not null,
    building  text        not null,
    street    text        not null,
    landmark  text        not null default '',
    lat       double precision,
    lng       double precision,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_saved_address_user on saved_address (user_id);
