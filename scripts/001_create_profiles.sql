-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Users can insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile (but not role)
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles_admin_select_all" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
