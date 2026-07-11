-- Add rich description fields to service_category so the admin form can
-- control everything the customer sees on the service detail page.
alter table service_category
    add column if not exists long_description text not null default '',
    add column if not exists includes          text[]   not null default '{}',
    add column if not exists estimated_duration text    not null default '',
    add column if not exists why_us            text[]   not null default '{}',
    add column if not exists tips              text    not null default '';
