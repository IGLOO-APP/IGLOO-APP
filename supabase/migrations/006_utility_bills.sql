-- Property Units (sub-divided units like kitnets, rooms, apartments)
create table if not exists public.property_units (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  is_occupied boolean default false,
  current_tenant_id text references public.profiles(id),
  residents_count integer default 1,
  water_meter_initial numeric,
  electricity_meter_initial numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Utility Bills (water, electricity, gas)
create table if not exists public.utility_bills (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  owner_id text references public.profiles(id) not null,
  bill_type text check (bill_type in ('water', 'electricity', 'gas')) not null,
  total_amount numeric not null,
  bill_date date not null,
  due_date date,
  provider text,
  document_url text,
  apportionment_method text check (apportionment_method in ('fixed', 'people')) not null default 'fixed',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Utility Bill Units (individual share per unit)
create table if not exists public.utility_bill_units (
  id uuid default uuid_generate_v4() primary key,
  utility_bill_id uuid references public.utility_bills(id) on delete cascade not null,
  unit_name text not null,
  tenant_id text references public.profiles(id),
  share_amount numeric not null,
  is_owner_cost boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.property_units enable row level security;
alter table public.utility_bills enable row level security;
alter table public.utility_bill_units enable row level security;

-- Property Units policies
create policy "Owners can manage property units" on public.property_units
  for all using (
    exists (
      select 1 from public.properties
      where properties.id = property_units.property_id
      and properties.owner_id = (auth.jwt() ->> 'sub')::text
    ) or is_admin()
  );

create policy "Tenants can view units of their property" on public.property_units
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.property_id = property_units.property_id
      and contracts.tenant_id = (auth.jwt() ->> 'sub')::text
    )
  );

-- Utility Bills policies
create policy "Owners can manage utility bills" on public.utility_bills
  for all using (
    exists (
      select 1 from public.properties
      where properties.id = utility_bills.property_id
      and properties.owner_id = (auth.jwt() ->> 'sub')::text
    ) or is_admin()
  );

create policy "Tenants can view utility bills of their property" on public.utility_bills
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.property_id = utility_bills.property_id
      and contracts.tenant_id = (auth.jwt() ->> 'sub')::text
    )
  );

-- Utility Bill Units policies
create policy "Users involved can view bill units" on public.utility_bill_units
  for select using (
    exists (
      select 1 from public.utility_bills
      where utility_bills.id = utility_bill_units.utility_bill_id
      and (
        exists (
          select 1 from public.properties
          where properties.id = utility_bills.property_id
          and (properties.owner_id = (auth.jwt() ->> 'sub')::text
            or exists (
              select 1 from public.contracts
              where contracts.property_id = properties.id
              and contracts.tenant_id = (auth.jwt() ->> 'sub')::text
            ))
        ) or is_admin()
      )
    )
  );

create policy "Owners can manage bill units" on public.utility_bill_units
  for all using (
    exists (
      select 1 from public.utility_bills
      join public.properties on properties.id = utility_bills.property_id
      where utility_bills.id = utility_bill_units.utility_bill_id
      and properties.owner_id = (auth.jwt() ->> 'sub')::text
    ) or is_admin()
  );
