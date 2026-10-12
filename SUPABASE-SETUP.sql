-- STAR MANAGEMENT Supabase setup
-- Run this in Supabase SQL Editor. Replace admin@example.com with the email
-- you will use to sign in. Create that user in Authentication > Users first.
-- Do not use a service_role key in the website.

create extension if not exists pgcrypto;

create table if not exists public.link_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon text not null default '🔗',
  icon_url text,
  urls text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.link_groups add column if not exists icon text not null default '🔗';
alter table public.link_groups add column if not exists sort_order integer not null default 0;
alter table public.link_groups add column if not exists updated_at timestamptz not null default now();
alter table public.link_groups enable row level security;

drop policy if exists "Public can view link groups" on public.link_groups;
create policy "Public can view link groups" on public.link_groups
for select to anon, authenticated using (true);

drop policy if exists "Authenticated users can insert groups" on public.link_groups;
drop policy if exists "Authenticated users can update groups" on public.link_groups;
drop policy if exists "Authenticated users can delete groups" on public.link_groups;
drop policy if exists "Only admin email can insert groups" on public.link_groups;
drop policy if exists "Only admin email can update groups" on public.link_groups;
drop policy if exists "Only admin email can delete groups" on public.link_groups;

create policy "Only admin email can insert groups" on public.link_groups
for insert to authenticated
with check ((select auth.jwt() ->> 'email') = 'admin@example.com');

create policy "Only admin email can update groups" on public.link_groups
for update to authenticated
using ((select auth.jwt() ->> 'email') = 'admin@example.com')
with check ((select auth.jwt() ->> 'email') = 'admin@example.com');

create policy "Only admin email can delete groups" on public.link_groups
for delete to authenticated
using ((select auth.jwt() ->> 'email') = 'admin@example.com');

-- Create a PUBLIC bucket named group-icons (or keep your existing one).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('group-icons', 'group-icons', true, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Allow public read icons" on storage.objects;
create policy "Allow public read icons" on storage.objects
for select to anon, authenticated using (bucket_id = 'group-icons');

drop policy if exists "Admin can upload group icons" on storage.objects;
create policy "Admin can upload group icons" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'group-icons'
  and (select auth.jwt() ->> 'email') = 'admin@example.com'
);

drop policy if exists "Admin can update group icons" on storage.objects;
create policy "Admin can update group icons" on storage.objects
for update to authenticated
using (bucket_id = 'group-icons' and (select auth.jwt() ->> 'email') = 'admin@example.com')
with check (bucket_id = 'group-icons' and (select auth.jwt() ->> 'email') = 'admin@example.com');

drop policy if exists "Admin can delete group icons" on storage.objects;
create policy "Admin can delete group icons" on storage.objects
for delete to authenticated
using (bucket_id = 'group-icons' and (select auth.jwt() ->> 'email') = 'admin@example.com');
