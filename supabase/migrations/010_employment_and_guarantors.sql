-- Add employment fields to profiles table
alter table public.profiles
  add column if not exists company_name text,
  add column if not exists company_cnpj text,
  add column if not exists company_address text,
  add column if not exists occupation text,
  add column if not exists monthly_income numeric,
  add column if not exists admission_date date,
  add column if not exists rg text;

-- Create guarantors (fiadores) table
create table if not exists public.guarantors (
  id uuid default uuid_generate_v4() primary key,
  tenant_id text not null references public.profiles(id) on delete cascade,
  name text not null,
  cpf text,
  rg text,
  phone text,
  email text,
  income_url text,
  income_name text,
  residence_url text,
  residence_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.guarantors enable row level security;

create policy "Users involved can view guarantors" on public.guarantors
  for select using (
    tenant_id = (auth.jwt() ->> 'sub')::text
    or exists (
      select 1 from public.contracts
      where contracts.tenant_id = guarantors.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

create policy "Tenants can manage own guarantors" on public.guarantors
  for all using (tenant_id = (auth.jwt() ->> 'sub')::text)
  with check (tenant_id = (auth.jwt() ->> 'sub')::text);

create policy "Owners can manage tenant guarantors" on public.guarantors
  for all using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = guarantors.tenant_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or is_admin()
  );

-- Add guarantee_type to profiles to store the chosen guarantee type
alter table public.profiles
  add column if not exists guarantee_type text check (guarantee_type in ('fiador', 'seguro_fianca', 'deposito_caucao', 'outros'));
