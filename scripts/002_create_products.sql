-- Create products table
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  price numeric not null default 0,
  original_price numeric,
  rating numeric not null default 0,
  reviews integer not null default 0,
  image text not null default '',
  images text[] not null default '{}',
  badge text not null default '',
  category text not null default '',
  weight text not null default '',
  sizes jsonb not null default '[]',
  description text not null default '',
  ingredients text not null default '',
  shelf_life text not null default '',
  is_veg boolean not null default true,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.products enable row level security;

-- Anyone can read products (public storefront)
create policy "products_public_read" on public.products
  for select using (true);

-- Only admins can insert products
create policy "products_admin_insert" on public.products
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can update products
create policy "products_admin_update" on public.products
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can delete products
create policy "products_admin_delete" on public.products
  for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
