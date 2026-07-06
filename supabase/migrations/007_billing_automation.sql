-- Billing Reminders (audit log for automated cobrança)
create table if not exists public.billing_reminders (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references public.contracts(id) on delete cascade not null,
  owner_id text references public.profiles(id) not null,
  due_date date not null,
  amount numeric not null,
  reminder_type text check (reminder_type in ('due_soon', 'overdue_1', 'overdue_5', 'overdue_15', 'overdue_30')) not null,
  channel text check (channel in ('whatsapp', 'email', 'sms')) not null default 'whatsapp',
  status text check (status in ('sent', 'failed', 'scheduled')) default 'scheduled',
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.billing_reminders enable row level security;

create policy "Owners can manage billing reminders" on public.billing_reminders
  for all using (
    exists (
      select 1 from public.contracts
      where contracts.id = billing_reminders.contract_id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    ) or is_admin()
  );

create policy "Tenants can view reminders of their contracts" on public.billing_reminders
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.id = billing_reminders.contract_id
      and contracts.tenant_id = (auth.jwt() ->> 'sub')::text
    )
  );
