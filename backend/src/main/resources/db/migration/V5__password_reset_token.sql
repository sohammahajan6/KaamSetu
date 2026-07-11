-- Password reset tokens, issued on forgot-password and consumed/expired on
-- reset-password. Tokens are one-time-use and expire after 1 hour.
create table password_reset_token (
    id         uuid        primary key,
    token      text        not null unique,
    email      text        not null,
    expires_at timestamptz not null,
    used       boolean     not null default false,
    created_at timestamptz not null default now()
);

create index idx_password_reset_token_token on password_reset_token (token);
create index idx_password_reset_token_email on password_reset_token (email);
