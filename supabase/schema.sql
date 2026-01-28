
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users: Owners and Tenants)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  role text check (role in ('owner', 'tenant')) default 'owner',
  avatar_url text,
  phone text,
  cpf text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROPERTIES
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  status text check (status in ('DISPONÍVEL', 'ALUGADO', 'MANUTENÇÃO')) default 'DISPONÍVEL',
  price numeric not null,
  area numeric,
  image_url text,
  description text,
  market_value numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTRACTS
create table public.contracts (
  id uuid default uuid_generate_v4() primary key,
  contract_number text,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id),
  owner_id uuid references public.profiles(id) not null,
  start_date date not null,
  end_date date not null,
  monthly_value numeric not null,
  payment_day integer default 10,
  status text check (status in ('draft', 'pending_signature', 'active', 'expiring_soon', 'expired', 'cancelled')) default 'draft',
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYMENTS
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references public.contracts(id) on delete cascade not null,
  due_date date not null,
  paid_date date,
  amount numeric not null,
  status text check (status in ('pending', 'paid', 'late', 'cancelled')) default 'pending',
  payment_method text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MAINTENANCE REQUESTS
create table public.maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id),
  title text not null,
  description text,
  category text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  images text[], 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Simple Setup - Adjust for production)
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_requests enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Policy: Owners can view their properties
create policy "Owners can view their properties" on public.properties
  for select using (auth.uid() = owner_id);

-- Policy: Tenants can view properties they rent (via contracts)
create policy "Tenants can view rented properties" on public.properties
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.property_id = properties.id
      and contracts.tenant_id = auth.uid()
    )
  );
