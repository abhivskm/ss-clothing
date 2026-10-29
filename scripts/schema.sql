-- SS Clothing database tables (Neon Postgres).
-- Safe to run more than once: npm run db:setup

create table if not exists categories (
  slug        text primary key,
  name        text not null,
  grp         text not null check (grp in ('Topwear', 'Bottomwear', 'More')),
  description text not null default '',
  sort_order  integer not null default 0
);

create table if not exists products (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  category    text not null references categories (slug) on delete restrict,
  subcategory text not null default '',
  description text not null default '',
  price       integer not null check (price >= 0),
  mrp         integer check (mrp >= 0),
  fabric      text not null default '',
  fit         text not null default '',
  sizes       jsonb not null default '[]',
  colors      jsonb not null default '[]',
  images      jsonb not null default '[]',
  tags        jsonb not null default '[]',
  in_stock    boolean not null default true,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);

-- Website analytics (see lib/analytics.ts). No names, phone numbers, IP addresses or raw
-- user-agent strings are stored: visitors and sessions are random IDs made in the browser.

create table if not exists analytics_visitors (
  id         uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);

create index if not exists analytics_visitors_first_seen_idx on analytics_visitors (first_seen);

-- One row per visit. A visit ends after 30 minutes without activity (decided in the browser);
-- last_seen is moved forward by heartbeats and decides who counts as a live visitor.
create table if not exists analytics_sessions (
  id            uuid primary key,
  visitor_id    uuid not null references analytics_visitors (id) on delete cascade,
  started_at    timestamptz not null default now(),
  last_seen     timestamptz not null default now(),
  landing_path  text not null default '/',
  referrer_host text,
  source        text not null default 'Direct',
  device        text not null default 'desktop',
  browser       text,
  os            text,
  country       text
);

create index if not exists analytics_sessions_started_idx on analytics_sessions (started_at);
create index if not exists analytics_sessions_last_seen_idx on analytics_sessions (last_seen);

-- event_id is made in the browser, so a retried request can never be counted twice.
-- product_id has no foreign key: stats stay readable if a product is deleted.
create table if not exists analytics_events (
  id         bigint generated always as identity primary key,
  event_id   uuid not null unique,
  type       text not null check (type in ('page_view', 'product_view', 'whatsapp_click', 'call_click', 'instagram_click', 'enquiry')),
  session_id uuid references analytics_sessions (id) on delete cascade,
  visitor_id uuid,
  path       text not null default '',
  product_id text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on analytics_events (created_at);
create index if not exists analytics_events_type_created_idx on analytics_events (type, created_at);
create index if not exists analytics_events_product_idx on analytics_events (product_id, created_at) where product_id is not null;
create index if not exists analytics_events_session_idx on analytics_events (session_id, created_at);
