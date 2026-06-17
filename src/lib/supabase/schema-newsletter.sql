-- ============================================================
-- JootaCee Newsletter Schema — Run after schema.sql
-- ============================================================

-- ─────────────────────────── newsletter_subscribers ────────
create table if not exists newsletter_subscribers (
  id           uuid primary key default uuid_generate_v4(),
  email        text not null,
  status       text not null default 'pending',   -- pending | confirmed | unsubscribed
  confirmed_at timestamptz,
  tags         text[] not null default '{}',      -- for segmentation
  source       text,                              -- where they subscribed from
  created_at   timestamptz not null default now()
);

-- Case-insensitive uniqueness
create unique index if not exists idx_newsletter_email
  on newsletter_subscribers(lower(email));

-- Status enum check
alter table newsletter_subscribers
  add constraint newsletter_status_check
  check (status in ('pending', 'confirmed', 'unsubscribed'));

create index if not exists idx_newsletter_status on newsletter_subscribers(status);

-- ─────────────────────────── RLS ───────────────────────────
alter table newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert only, anon cannot read)
create policy "Public can subscribe"
  on newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

-- Authenticated admin can manage all subscribers
create policy "Admin manages subscribers"
  on newsletter_subscribers
  for all
  to authenticated
  using (true)
  with check (true);
