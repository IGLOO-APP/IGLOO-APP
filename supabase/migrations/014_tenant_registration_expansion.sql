-- 014: Expand tenant registration fields (personal, address, spouse, references, PJ)

-- ============================================================
-- 1. PROFILES — expand with new tenant registration fields
-- ============================================================
alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists marital_status text check (marital_status in ('solteiro', 'casado', 'separado', 'divorciado', 'viuvo')),
  add column if not exists nationality text,
  add column if not exists rg_issuer text,
  add column if not exists rg_uf text,
  add column if not exists cep text,
  add column if not exists street text,
  add column if not exists street_number text,
  add column if not exists complement text,
  add column if not exists neighborhood text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists residence_time text,
  add column if not exists phone_commercial text,
  add column if not exists other_income numeric,
  add column if not exists adults_count integer default 1,
  add column if not exists children_count integer default 0,
  add column if not exists currently_pays_rent boolean default false,
  add column if not exists current_rent_where text,
  -- Pessoa Jurídica fields
  add column if not exists tenant_type text check (tenant_type in ('pf', 'pj')) default 'pf',
  add column if not exists company_legal_name text,
  add column if not exists company_trade_name text,
  add column if not exists company_state_registration text;

-- ============================================================
-- 2. TENANT SPOUSES
-- ============================================================
create table if not exists public.tenant_spouses (
  id uuid default uuid_generate_v4() primary key,
  tenant_id text not null references public.profiles(id) on delete cascade unique,
  name text not null,
  cpf text,
  rg text,
  birth_date date,
  phone text,
  occupation text,
  monthly_income numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tenant_spouses enable row level security;

create policy "Tenants can manage own spouse" on public.tenant_spouses
  for all using (tenant_id = (auth.jwt() ->> 'sub')::text)
  with check (tenant_id = (auth.jwt() ->> 'sub')::text);

create policy "Owners can view tenant spouses" on public.tenant_spouses
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = tenant_spouses.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

create policy "Owners can manage tenant spouses" on public.tenant_spouses
  for all using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = tenant_spouses.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

-- ============================================================
-- 3. TENANT REFERENCES (bancária + pessoal)
-- ============================================================
create table if not exists public.tenant_references (
  id uuid default uuid_generate_v4() primary key,
  tenant_id text not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('bancaria', 'pessoal')),
  -- bancária
  bank_name text,
  bank_agency text,
  bank_account text,
  -- pessoal
  name text,
  phone text,
  relationship text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tenant_references enable row level security;

create policy "Tenants can manage own references" on public.tenant_references
  for all using (tenant_id = (auth.jwt() ->> 'sub')::text)
  with check (tenant_id = (auth.jwt() ->> 'sub')::text);

create policy "Owners can view tenant references" on public.tenant_references
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = tenant_references.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

create policy "Owners can manage tenant references" on public.tenant_references
  for all using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = tenant_references.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

-- ============================================================
-- 4. TENANT LEGAL REPRESENTATIVES (PJ)
-- ============================================================
create table if not exists public.tenant_legal_representatives (
  id uuid default uuid_generate_v4() primary key,
  tenant_id text not null references public.profiles(id) on delete cascade,
  name text not null,
  cpf text,
  rg text,
  position text,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tenant_legal_representatives enable row level security;

create policy "Tenants can manage own representatives" on public.tenant_legal_representatives
  for all using (tenant_id = (auth.jwt() ->> 'sub')::text)
  with check (tenant_id = (auth.jwt() ->> 'sub')::text);

create policy "Owners can view tenant representatives" on public.tenant_legal_representatives
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = tenant_legal_representatives.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

create policy "Owners can manage tenant representatives" on public.tenant_legal_representatives
  for all using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = tenant_legal_representatives.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

-- ============================================================
-- 5. INDEXES
-- ============================================================
create index if not exists idx_tenant_spouses_tenant_id on public.tenant_spouses(tenant_id);
create index if not exists idx_tenant_references_tenant_id on public.tenant_references(tenant_id);
create index if not exists idx_tenant_legal_representatives_tenant_id on public.tenant_legal_representatives(tenant_id);
