
-- Enable UUID extension
create extension if not exists "uuid-ossp";


-- PROFILES (Users: Owners, Tenants, and Admins)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  role text check (role in ('owner', 'tenant', 'admin')) default 'owner',
  admin_type text check (admin_type in ('super', 'support', 'finance', 'content')),
  permissions jsonb default '[]'::jsonb,
  avatar_url text,
  phone text,
  cpf text,
  is_suspended boolean default false,
  suspended_at timestamp with time zone,
  suspended_reason text,
  last_login_at timestamp with time zone,
  last_login_ip text,
  managed_by_admin_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ADMIN ACTIVITY LOG
create table public.admin_activity_log (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id) not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUPPORT TICKETS
create table public.support_tickets (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  assigned_admin_id uuid references public.profiles(id),
  category text check (category in ('billing', 'technical', 'feature_request', 'bug', 'other')) not null,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')) default 'open',
  subject text not null,
  description text not null,
  attachments text[],
  resolution_notes text,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone
);

-- TICKET MESSAGES
create table public.support_ticket_messages (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.support_tickets(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  message text not null,
  attachments text[],
  is_internal_note boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SYSTEM ANNOUNCEMENTS
create table public.system_announcements (
  id uuid default uuid_generate_v4() primary key,
  created_by_admin_id uuid references public.profiles(id) not null,
  title text not null,
  content text not null,
  type text check (type in ('info', 'warning', 'maintenance', 'feature')) default 'info',
  target_audience text check (target_audience in ('all', 'free_users', 'paid_users', 'specific_plan')) default 'all',
  is_active boolean default true,
  show_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- IMPERSONATION SESSIONS
create table public.impersonation_sessions (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id) not null,
  target_user_id uuid references public.profiles(id) not null,
  reason text not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  actions_performed jsonb default '[]'::jsonb
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

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.admin_activity_log enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.system_announcements enable row level security;
alter table public.impersonation_sessions enable row level security;

-- Function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or is_admin());

create policy "Admins can update any profile" on public.profiles
  for update using (is_admin());

-- Properties Policies
create policy "Owners can view their properties" on public.properties
  for select using (auth.uid() = owner_id or is_admin());

create policy "Owners can managed their properties" on public.properties
  for all using (auth.uid() = owner_id or is_admin());

create policy "Tenants can view rented properties" on public.properties
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.property_id = properties.id
      and contracts.tenant_id = auth.uid()
    )
  );

-- Contracts Policies
create policy "Users involved can view contracts" on public.contracts
  for select using (auth.uid() = owner_id or auth.uid() = tenant_id or is_admin());

create policy "Owners can manage contracts" on public.contracts
  for all using (auth.uid() = owner_id or is_admin());

-- Admin Activity Log Policies (Only Admins)
create policy "Admins can view logs" on public.admin_activity_log
  for select using (is_admin());

create policy "System can insert logs" on public.admin_activity_log
  for insert with check (is_admin());

-- Support Tickets Policies
create policy "Owners can view own tickets" on public.support_tickets
  for select using (auth.uid() = owner_id or is_admin());

create policy "Owners can create tickets" on public.support_tickets
  for insert with check (auth.uid() = owner_id);


-- FEATURE FLAGS
create table public.feature_flags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  enabled boolean default false,
  target_audience text check (target_audience in ('all', 'beta', 'internal', 'none')) default 'all',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PLANS
create table public.plans (
  id text primary key, -- e.g. 'starter', 'professional'
  name text not null,
  description text,
  price_monthly numeric not null,
  price_semiannual numeric,
  price_annual numeric,
  features jsonb default '[]'::jsonb,
  limits jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for New Tables
alter table public.feature_flags enable row level security;
alter table public.plans enable row level security;

create policy "Admins can manage feature flags" on public.feature_flags
  for all using (is_admin());

create policy "Admins can manage plans" on public.plans
  for all using (is_admin());

create policy "Public can view active plans" on public.plans
  for select using (is_active = true);

create policy "Public can view enabled feature flags" on public.feature_flags
  for select using (enabled = true);
