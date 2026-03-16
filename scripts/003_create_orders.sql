-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  address2 text not null default '',
  city text not null default '',
  state text not null default '',
  pincode text not null default '',
  country text not null default '',
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  delivery numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

-- Users can read their own orders
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- Anyone can insert orders (guests checkout too)
create policy "orders_insert_anyone" on public.orders
  for insert with check (true);

-- Admins can read all orders
create policy "orders_admin_select_all" on public.orders
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update orders (status changes)
create policy "orders_admin_update" on public.orders
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
