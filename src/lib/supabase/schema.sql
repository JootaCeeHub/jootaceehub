-- ============================================================
-- JootaCee CMS — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ─────────────────────────── Extensions ────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- full-text search on title/tags

-- ─────────────────────────── Enums ─────────────────────────
do $$ begin
  create type post_status   as enum ('draft', 'published', 'archived');
  create type post_category as enum ('opinion', 'research', 'news', 'essays', 'tutorial');
  create type media_type    as enum ('image', 'video', 'document');
exception when duplicate_object then null; end $$;

-- ─────────────────────────── journal_posts ─────────────────
create table if not exists journal_posts (
  id               uuid primary key default uuid_generate_v4(),
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  content          text not null default '',
  status           post_status not null default 'draft',
  category         post_category not null,
  tags             text[] not null default '{}',
  cover_image_url  text,
  read_time        integer not null default 1,   -- minutes
  author_id        uuid not null references auth.users(id) on delete cascade,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create or replace trigger journal_posts_updated_at
  before update on journal_posts
  for each row execute procedure touch_updated_at();

-- Full-text search index
create index if not exists idx_journal_posts_search
  on journal_posts using gin (to_tsvector('english', title || ' ' || coalesce(excerpt, '')));

create index if not exists idx_journal_posts_status  on journal_posts(status);
create index if not exists idx_journal_posts_slug    on journal_posts(slug);
create index if not exists idx_journal_posts_category on journal_posts(category);

-- ─────────────────────────── media_assets ──────────────────
create table if not exists media_assets (
  id                    uuid primary key default uuid_generate_v4(),
  filename              text not null,
  original_url          text not null,
  cloudinary_public_id  text,
  cloudinary_url        text,
  width                 integer,
  height                integer,
  size_bytes            bigint not null default 0,
  mime_type             text not null,
  media_type            media_type not null default 'image',
  alt_text              text,
  uploaded_by           uuid not null references auth.users(id) on delete cascade,
  created_at            timestamptz not null default now()
);

create index if not exists idx_media_assets_type on media_assets(media_type);

-- ─────────────────────────── admin_config ──────────────────
-- Stores serialized AdminState per user (replaces localStorage)
create table if not exists admin_config (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  config_key   text not null default 'admin-state-v1',
  config_value jsonb not null default '{}',
  updated_at   timestamptz not null default now()
);

create or replace trigger admin_config_updated_at
  before update on admin_config
  for each row execute procedure touch_updated_at();

-- ─────────────────────────── Row Level Security ─────────────
-- All tables: only authenticated users can read/write their own data.
-- journal_posts: published posts are readable by anyone (public portfolio).

alter table journal_posts  enable row level security;
alter table media_assets   enable row level security;
alter table admin_config   enable row level security;

-- journal_posts policies
create policy "Published posts are public"
  on journal_posts for select
  using (status = 'published');

create policy "Author can manage own posts"
  on journal_posts for all
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- media_assets policies
create policy "Owner can manage own media"
  on media_assets for all
  using (auth.uid() = uploaded_by)
  with check (auth.uid() = uploaded_by);

create policy "Published media is public"
  on media_assets for select
  using (true); -- media is always public once uploaded

-- admin_config policies
create policy "User can manage own config"
  on admin_config for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
