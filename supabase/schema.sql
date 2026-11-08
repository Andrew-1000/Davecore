-- Davecore website: database, access rules and file storage on Supabase.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Safe to re-run: it only creates what is missing and replaces the access policies.
--
-- Who can do what (enforced by Postgres row-level security, not by the website code):
--   visitors        read published plans, testimonials and site settings; send enquiries
--   website admins  everything above, plus edit content, read enquiries, upload files
-- A website admin is a Supabase Auth user listed in site_admins (see README).

-- ───────────────────────────── Admins ─────────────────────────────
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.site_admins where user_id = auth.uid())
$$;

-- ───────────────────────────── Content ─────────────────────────────
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  code text not null unique,
  name text not null,
  type text not null default 'bungalow' check (type in ('bungalow', 'maisonette', 'apartment')),
  bedrooms int not null default 0 check (bedrooms between 0 and 100),
  bathrooms int not null default 0 check (bathrooms between 0 and 100),
  floor_areas numeric[] not null default '{}',      -- m² per floor, used by the cost calculator
  min_plot text not null default '',
  style text not null default '',
  price numeric not null default 0 check (price >= 0), -- KES, drawing set
  summary text not null default '',
  features text[] not null default '{}',
  floors jsonb not null default '[]',               -- room layouts for the drawn, watermarked preview
  images text[] not null default '{}',              -- paths in the public "plan-images" bucket
  pdf_path text,                                    -- path in the private "plan-files" bucket
  published boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null check (length(quote) between 10 and 1000),
  name text not null check (length(name) between 1 and 120),
  role text not null default '',
  location text not null default '',
  project text not null default '',
  rating int check (rating between 1 and 5),
  -- 'client' = sent by the client through the website form; 'admin' = entered by staff
  source text not null default 'admin' check (source in ('client', 'admin')),
  contact text not null default '' check (length(contact) <= 200), -- phone/email to verify; never shown
  published boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Editable site text: 'contact' (phone, whatsapp, email, address, hours), 'company' (intro)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact' check (kind in ('consultation', 'quote', 'plan', 'contact')),
  name text not null check (length(name) between 2 and 120),
  phone text not null default '' check (length(phone) <= 40),
  email text not null default '' check (length(email) <= 200),
  subject text not null default '' check (length(subject) <= 200),
  message text not null default '' check (length(message) <= 4000),
  plan_ref text not null default '' check (length(plan_ref) <= 40),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  check (phone <> '' or email <> '')
);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

-- updated_at bookkeeping
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists plans_touch on public.plans;
create trigger plans_touch before update on public.plans for each row execute function public.touch_updated_at();
drop trigger if exists testimonials_touch on public.testimonials;
create trigger testimonials_touch before update on public.testimonials for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.site_settings;
create trigger settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- ───────────────────────────── Access rules ─────────────────────────────
alter table public.site_admins enable row level security;
alter table public.plans enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;
alter table public.enquiries enable row level security;

-- Admins: each user may see their own row (that is how the website knows you are an admin).
-- Adding or removing admins is done in the SQL editor, never from the website.
drop policy if exists "own admin row" on public.site_admins;
create policy "own admin row" on public.site_admins for select using (user_id = auth.uid());

drop policy if exists "read published plans" on public.plans;
create policy "read published plans" on public.plans for select using (published or public.is_site_admin());
drop policy if exists "admins write plans" on public.plans;
create policy "admins write plans" on public.plans for all using (public.is_site_admin()) with check (public.is_site_admin());

-- Testimonials: clients may submit one (unpublished, waiting for approval); visitors see only
-- approved ones, and never the contact column (column grants below).
drop policy if exists "read published testimonials" on public.testimonials;
create policy "read published testimonials" on public.testimonials for select using (published or public.is_site_admin());
drop policy if exists "clients submit testimonials" on public.testimonials;
create policy "clients submit testimonials" on public.testimonials for insert
  with check (published = false and source = 'client' and sort = 0);
drop policy if exists "admins write testimonials" on public.testimonials;
create policy "admins write testimonials" on public.testimonials for all using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "read settings" on public.site_settings;
create policy "read settings" on public.site_settings for select using (true);
drop policy if exists "admins write settings" on public.site_settings;
create policy "admins write settings" on public.site_settings for all using (public.is_site_admin()) with check (public.is_site_admin());

-- Enquiries: anyone may send one (as 'new'); only admins may read, update or delete them.
drop policy if exists "anyone sends enquiries" on public.enquiries;
create policy "anyone sends enquiries" on public.enquiries for insert with check (status = 'new');
drop policy if exists "admins read enquiries" on public.enquiries;
create policy "admins read enquiries" on public.enquiries for select using (public.is_site_admin());
drop policy if exists "admins update enquiries" on public.enquiries;
create policy "admins update enquiries" on public.enquiries for update using (public.is_site_admin()) with check (public.is_site_admin());
drop policy if exists "admins delete enquiries" on public.enquiries;
create policy "admins delete enquiries" on public.enquiries for delete using (public.is_site_admin());

grant usage on schema public to anon, authenticated;
grant select on public.plans, public.site_settings to anon, authenticated;
-- Testimonials are read without the private contact column; admins get it through
-- admin_testimonial_contacts() below.
revoke select on public.testimonials from anon, authenticated;
grant select (id, quote, name, role, location, project, rating, source, published, sort, created_at, updated_at) on public.testimonials to anon, authenticated;
grant insert (quote, name, role, location, project, rating, source, contact, published, sort) on public.testimonials to anon, authenticated;
grant update, delete on public.testimonials to authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, insert, update, delete on public.plans, public.site_settings, public.enquiries to authenticated;
grant select on public.site_admins to authenticated;
grant execute on function public.is_site_admin() to anon, authenticated;

-- Contact details clients left with their testimonial (admins only; empty for everyone else)
create or replace function public.admin_testimonial_contacts()
returns table (id uuid, contact text)
language sql
stable
security definer
set search_path = public
as $$
  select t.id, t.contact from public.testimonials t where public.is_site_admin()
$$;
revoke execute on function public.admin_testimonial_contacts() from public, anon;
grant execute on function public.admin_testimonial_contacts() to authenticated;

-- ───────────────────────────── File storage ─────────────────────────────
-- plan-images: public preview images (upload watermarked previews only)
-- plan-files:  private full drawing sets (PDF); never publicly readable
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('plan-images', 'plan-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
  ('plan-files', 'plan-files', false, 104857600, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "admins upload plan files" on storage.objects;
create policy "admins upload plan files" on storage.objects for insert to authenticated
  with check (bucket_id in ('plan-images', 'plan-files') and public.is_site_admin());
drop policy if exists "admins update plan files" on storage.objects;
create policy "admins update plan files" on storage.objects for update to authenticated
  using (bucket_id in ('plan-images', 'plan-files') and public.is_site_admin());
drop policy if exists "admins delete plan files" on storage.objects;
create policy "admins delete plan files" on storage.objects for delete to authenticated
  using (bucket_id in ('plan-images', 'plan-files') and public.is_site_admin());
drop policy if exists "admins read private plan files" on storage.objects;
create policy "admins read private plan files" on storage.objects for select to authenticated
  using (bucket_id = 'plan-files' and public.is_site_admin());
