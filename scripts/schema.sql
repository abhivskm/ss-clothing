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
