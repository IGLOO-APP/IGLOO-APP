-- TENANT PROFILE CONFIGS
-- Stores per-property onboarding/screening configuration (which fields are required/hidden)
create table if not exists public.tenant_profile_configs (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade,
  owner_id text not null references public.profiles(id),
  sections jsonb not null default '{}'::jsonb,
  is_global boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tenant_profile_configs enable row level security;

create policy "Owners can view own configs" on public.tenant_profile_configs
  for select using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());

create policy "Owners can manage configs" on public.tenant_profile_configs
  for all using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());

-- TENANT SCREENINGS
-- Stores credit check, reference verification, and onboarding screening data per tenant
create table if not exists public.tenant_screenings (
  id uuid default uuid_generate_v4() primary key,
  tenant_id text not null references public.profiles(id),
  property_id uuid references public.properties(id),
  owner_id text not null references public.profiles(id),
  credit_checked boolean default false,
  credit_score integer,
  credit_status text check (credit_status in ('clean', 'restricted')),
  references_verified boolean default false,
  references_notes text default '',
  employment_type text check (employment_type in ('CLT', 'Autônomo', 'PJ')),
  residence_recent boolean default false,
  residence_match boolean default false,
  manual_overrides jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(tenant_id, property_id)
);

alter table public.tenant_screenings enable row level security;

create policy "Owners can view own screenings" on public.tenant_screenings
  for select using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());

create policy "Owners can manage screenings" on public.tenant_screenings
  for all using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());
