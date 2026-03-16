create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  source text default 'website',
  status text not null default 'active' check (status in ('active', 'unsubscribed'))
);

create index if not exists idx_newsletter_subscribers_email on newsletter_subscribers(email);
create index if not exists idx_newsletter_subscribers_status on newsletter_subscribers(status);
