
-- STAR MANAGEMENT SUPABASE FINAL SETUP
-- Admin email configured for your account.

create extension if not exists pgcrypto;

create table if not exists public.link_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon text not null default 'link',
  icon_url text,
  urls text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure all required columns exist.
alter table public.link_groups
  add column if not exists description text not null default '';
alter table public.link_groups
  add column if not exists icon text not null default 'link';
alter table public.link_groups
  add column if not exists icon_url text;
alter table public.link_groups
  add column if not exists urls text[] not null default '{}';
alter table public.link_groups
  add column if not exists sort_order integer not null default 0;
alter table public.link_groups
  add column if not exists updated_at timestamptz not null default now();

alter table public.link_groups enable row level security;

-- Public can read groups.
drop policy if exists "Public can view link groups"
on public.link_groups;

create policy "Public can view link groups"
on public.link_groups
for select to anon, authenticated
using (true);

-- Remove older management policies.
drop policy if exists "Authenticated users can insert groups"
on public.link_groups;
drop policy if exists "Authenticated users can update groups"
on public.link_groups;
drop policy if exists "Authenticated users can delete groups"
on public.link_groups;
drop policy if exists "Only admin email can insert groups"
on public.link_groups;
drop policy if exists "Only admin email can update groups"
on public.link_groups;
drop policy if exists "Only admin email can delete groups"
on public.link_groups;

-- Only your admin email can manage groups.
create policy "Only admin email can insert groups"
on public.link_groups
for insert to authenticated
with check (
  (select auth.jwt() ->> 'email')
  = 'ocanachristjohn137@gmail.com'
);

create policy "Only admin email can update groups"
on public.link_groups
for update to authenticated
using (
  (select auth.jwt() ->> 'email')
  = 'ocanachristjohn137@gmail.com'
)
with check (
  (select auth.jwt() ->> 'email')
  = 'ocanachristjohn137@gmail.com'
);

create policy "Only admin email can delete groups"
on public.link_groups
for delete to authenticated
using (
  (select auth.jwt() ->> 'email')
  = 'ocanachristjohn137@gmail.com'
);

-- Create or configure the public icon bucket.
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'group-icons',
  'group-icons',
  true,
  10485760,
  array['image/png','image/jpeg','image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types =
    array['image/png','image/jpeg','image/webp'];

-- Public can view group icons.
drop policy if exists "Allow public read icons"
on storage.objects;

create policy "Allow public read icons"
on storage.objects
for select to anon, authenticated
using (bucket_id = 'group-icons');

-- Only your admin email can upload icons.
drop policy if exists "Admin can upload group icons"
on storage.objects;

create policy "Admin can upload group icons"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'group-icons'
  and (select auth.jwt() ->> 'email')
      = 'ocanachristjohn137@gmail.com'
);

-- Only your admin email can update icons.
drop policy if exists "Admin can update group icons"
on storage.objects;

create policy "Admin can update group icons"
on storage.objects
for update to authenticated
using (
  bucket_id = 'group-icons'
  and (select auth.jwt() ->> 'email')
      = 'ocanachristjohn137@gmail.com'
)
with check (
  bucket_id = 'group-icons'
  and (select auth.jwt() ->> 'email')
      = 'ocanachristjohn137@gmail.com'
);

-- Only your admin email can delete icons.
drop policy if exists "Admin can delete group icons"
on storage.objects;

create policy "Admin can delete group icons"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'group-icons'
  and (select auth.jwt() ->> 'email')
      = 'ocanachristjohn137@gmail.com'
);
