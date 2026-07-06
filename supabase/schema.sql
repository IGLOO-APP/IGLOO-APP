
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
  -- Subscription
  subscription_plan text default 'free',
  subscription_status text check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'expired')) default 'trialing',
  subscription_expires_at timestamp with time zone,
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
  user_id text references public.profiles(id),
  assigned_to text references public.profiles(id),
  category text,
  priority text default 'medium',
  status text default 'Aberto',
  subject text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- SUPPORT MESSAGES
create table public.support_messages (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  sender_id text references public.profiles(id),
  sender_role text not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- CONVERSATIONS (general/finance chat)
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  owner_id text references public.profiles(id),
  tenant_id text references public.profiles(id),
  property_id uuid references public.properties(id),
  category text default 'general',
  last_message text,
  last_message_at timestamp with time zone,
  unread_count_owner integer default 0,
  unread_count_tenant integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- CONVERSATION MESSAGES
create table public.conversation_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id text references public.profiles(id),
  sender_role text,
  content text not null,
  type text default 'text',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- MAINTENANCE MESSAGES
create table public.maintenance_messages (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  sender_id text references public.profiles(id) not null,
  sender_role text,
  content text not null,
  type text default 'text',
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- FAQS
create table public.faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  is_active boolean default true,
  "order" integer,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- SYSTEM ANNOUNCEMENTS
create table public.system_announcements (
  id uuid default uuid_generate_v4() primary key,
  created_by_admin_id text references public.profiles(id) not null,
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
  target_user_id text references public.profiles(id) not null,
  reason text not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  actions_performed jsonb default '[]'::jsonb
);

-- PROPERTIES
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  owner_id text references public.profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  status text check (status in ('DISPONÍVEL', 'ALUGADO', 'MANUTENÇÃO')) default 'DISPONÍVEL',
  price numeric not null,
  area numeric,
  image_url text,
  description text,
  market_value numeric,
  bedrooms integer default 0,
  bathrooms integer default 0,
  parking integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTRACTS
create table public.contracts (
  id uuid default uuid_generate_v4() primary key,
  contract_number text,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id text references public.profiles(id),
  owner_id text references public.profiles(id) not null,
  start_date date not null,
  end_date date not null,
  monthly_value numeric not null,
  security_deposit numeric default 0,
  condominium_value numeric default 0,
  iptu_value numeric default 0,
  payment_day integer default 10,
  status text check (status in ('draft', 'pending_signature', 'active', 'expiring_soon', 'expired', 'cancelled', 'renewed')) default 'draft',
  pdf_url text,
  signers jsonb default '[]'::jsonb,
  history jsonb default '[]'::jsonb,
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

-- INVOICES
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.profiles(id) not null,
  number text not null,
  date date not null,
  amount numeric not null,
  status text check (status in ('paid', 'open', 'void')) default 'open',
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATION PREFERENCES
create table public.notification_prefs (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.profiles(id) not null unique,
  email_alerts boolean default true,
  sms_alerts boolean default false,
  payment_received boolean default true,
  late_payment boolean default true,
  maintenance_updates boolean default true,
  payment_reminders boolean default true,
  new_messages boolean default true,
  announcements boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYMENT CONFIG
create table public.payment_configs (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.profiles(id) not null,
  method text not null check (method in ('pix', 'boleto', 'credit_card')),
  enabled boolean default false,
  fields jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, method)
);

-- MAINTENANCE SETTINGS
create table public.maintenance_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.profiles(id) not null,
  category text not null,
  enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category)
);

-- MAINTENANCE REQUESTS
create table public.maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id text references public.profiles(id),
  title text not null,
  description text,
  category text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  images text[], 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SIGNATURE AUDIT TRAIL
create table public.signature_audits (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references public.contracts(id) on delete cascade not null,
  signer_id text references public.profiles(id) not null,
  signed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  signer_ip text,
  user_agent text,
  document_hash text not null,
  signature_image_url text, -- Path to storage
  integrity_verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    name,
    role,
    phone
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::text, 'owner'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    role = coalesce(excluded.role, public.profiles.role),
    phone = coalesce(excluded.phone, public.profiles.phone),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS for Audit
alter table public.signature_audits enable row level security;
create policy "Users involved can view audits" on public.signature_audits
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.id = signature_audits.contract_id
      and (contracts.owner_id = auth.uid() or contracts.tenant_id = auth.uid())
    ) or is_admin()
  );

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.admin_activity_log enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.maintenance_messages enable row level security;
alter table public.faqs enable row level security;
alter table public.notifications enable row level security;
alter table public.system_announcements enable row level security;
alter table public.impersonation_sessions enable row level security;
alter table public.property_documents enable row level security;

-- Function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = (auth.jwt() ->> 'sub')::text
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using ((auth.jwt() ->> 'sub')::text = id or is_admin());

create policy "Owners can view profiles of their tenants" on public.profiles
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.tenant_id = public.profiles.id
      and contracts.owner_id = (auth.jwt() ->> 'sub')::text
    )
    or
    exists (
      select 1 from public.properties
      where properties.id = public.profiles.property_id
      and properties.owner_id = (auth.jwt() ->> 'sub')::text
    )
  );

create policy "Users can create own profile" on public.profiles
  for insert with check ((auth.jwt() ->> 'sub')::text = id);

create policy "Users can update own profile" on public.profiles
  for update using ((auth.jwt() ->> 'sub')::text = id or is_admin())
  with check ((auth.jwt() ->> 'sub')::text = id or is_admin());

create policy "Admins can update any profile" on public.profiles
  for update using (is_admin())
  with check (is_admin());

-- Properties Policies
create policy "Owners can view their properties" on public.properties
  for select using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());

create policy "Owners can managed their properties" on public.properties
  for all using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());

create policy "Tenants can view rented properties" on public.properties
  for select using (
    exists (
      select 1 from public.contracts
      where contracts.property_id = properties.id
      and contracts.tenant_id = (auth.jwt() ->> 'sub')::text
    )
  );

-- Contracts Policies
create policy "Users involved can view contracts" on public.contracts
  for select using ((auth.jwt() ->> 'sub')::text = owner_id or (auth.jwt() ->> 'sub')::text = tenant_id or is_admin());

create policy "Owners can manage contracts" on public.contracts
  for all using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());

-- Admin Activity Log Policies (Only Admins)
create policy "Admins can view logs" on public.admin_activity_log
  for select using (is_admin());

create policy "System can insert logs" on public.admin_activity_log
  for insert with check (is_admin());

-- Support Tickets Policies
create policy "Users can view own tickets" on public.support_tickets
  for select using ((auth.jwt() ->> 'sub')::text = user_id or is_admin());

create policy "Users can create tickets" on public.support_tickets
  for insert with check ((auth.jwt() ->> 'sub')::text = user_id);

-- Support Messages Policies
create policy "Users can view own ticket messages" on public.support_messages
  for select using (exists (
    select 1 from public.support_tickets
    where support_tickets.id = support_messages.ticket_id
    and ((auth.jwt() ->> 'sub')::text = support_tickets.user_id or is_admin())
  ));

create policy "Users can insert ticket messages" on public.support_messages
  for insert with check (exists (
    select 1 from public.support_tickets
    where support_tickets.id = ticket_id
    and (auth.jwt() ->> 'sub')::text = support_tickets.user_id
  ));

-- Conversations Policies
create policy "Users can view own conversations" on public.conversations
  for select using (
    (auth.jwt() ->> 'sub')::text = owner_id
    or (auth.jwt() ->> 'sub')::text = tenant_id
    or is_admin()
  );

create policy "Owners can manage conversations" on public.conversations
  for all using ((auth.jwt() ->> 'sub')::text = owner_id or is_admin());

-- Conversation Messages Policies
create policy "Users can view conversation messages" on public.conversation_messages
  for select using (exists (
    select 1 from public.conversations
    where conversations.id = conversation_messages.conversation_id
    and (
      (auth.jwt() ->> 'sub')::text = conversations.owner_id
      or (auth.jwt() ->> 'sub')::text = conversations.tenant_id
      or is_admin()
    )
  ));

create policy "Owners can insert conversation messages" on public.conversation_messages
  for insert with check (exists (
    select 1 from public.conversations
    where conversations.id = conversation_id
    and (auth.jwt() ->> 'sub')::text = conversations.owner_id
  ));

-- Maintenance Messages Policies
create policy "Users involved can view maintenance messages" on public.maintenance_messages
  for select using (exists (
    select 1 from public.maintenance_requests
    left join public.properties on properties.id = maintenance_requests.property_id
    left join public.contracts on contracts.property_id = properties.id
    where maintenance_requests.id = maintenance_messages.request_id
    and (
      (auth.jwt() ->> 'sub')::text = maintenance_requests.tenant_id
      or (auth.jwt() ->> 'sub')::text = properties.owner_id
      or (auth.jwt() ->> 'sub')::text = contracts.owner_id
      or is_admin()
    )
  ));

create policy "Owners can insert maintenance messages" on public.maintenance_messages
  for insert with check (exists (
    select 1 from public.maintenance_requests
    left join public.properties on properties.id = maintenance_requests.property_id
    where maintenance_requests.id = request_id
    and (auth.jwt() ->> 'sub')::text = properties.owner_id
  ));

-- FAQs Policies
create policy "Public can view FAQs" on public.faqs
  for select using (true);

create policy "Admins can manage FAQs" on public.faqs
  for all using (is_admin());

-- Notifications Policies
create policy "Users can view own notifications" on public.notifications
  for select using ((auth.jwt() ->> 'sub')::text = user_id);

create policy "System can insert notifications" on public.notifications
  for insert with check (true);


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


-- CONTRACT TEMPLATES
create table public.contract_templates (
  id text primary key, -- e.g. 'kitnet_contract'
  name text not null,
  content text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Contract Templates
alter table public.contract_templates enable row level security;

create policy "Public can view contract templates" on public.contract_templates
  for select using (true);

create policy "Admins can manage contract templates" on public.contract_templates
  for all using (is_admin());

-- Insert initial template
insert into public.contract_templates (id, name, content)
values (
  'kitnet_contract',
  'Minuta Padrão Kitnet',
  'INSTRUMENTO PARTICULAR DE CONTRATO DE LOCAÇÃO RESIDENCIAL

Pelo presente instrumento particular, de um lado:

LOCADOR(A): {{nome_proprietario}}, inscrito(a) no CPF sob o nº {{cpf_proprietario}}, residente e domiciliado(a) em {{endereco_proprietario}}, doravante denominado simplesmente LOCADOR.

E de outro lado:

LOCATÁRIO(A): {{nome_inquilino}}, inscrito(a) no CPF sob o nº {{cpf_inquilino}}, doravante denominado simplesmente LOCATÁRIO.

As partes acima qualificadas têm entre si, justo e contratado, o presente contrato de locação, que se regerá pela Lei nº 8.245/91 (Lei do Inquilinato) e pelas cláusulas e condições seguintes:

CLÁUSULA PRIMEIRA - DO OBJETO
O imóvel objeto desta locação é o imóvel residencial situado na {{endereco_imovel}}, na cidade de {{cidade_contrato}}. O imóvel é entregue em perfeitas condições de uso, conforme Laudo de Vistoria que passa a ser parte integrante deste contrato.

CLÁUSULA SEGUNDA - DA VIGÊNCIA E PRAZO
A locação terá a duração de {{duracao_meses}} meses, com início em {{data_inicio}} e término previsto para {{data_fim}}.
Parágrafo Único: Findo o prazo ajustado, se o LOCATÁRIO permanecer no imóvel por mais de trinta dias sem oposição do LOCADOR, presumir-se-á prorrogada a locação por tempo indeterminado, mantidas as demais cláusulas deste contrato.

CLÁUSULA TERCEIRA - DOS VALORES E REAJUSTE
O aluguel mensal pactuado é de R$ {{valor_aluguel}}, devendo ser pago até o dia {{dia_vencimento}} de cada mês, via PIX ou boleto bancário conforme orientação do LOCADOR.
Parágrafo Primeiro: O valor do aluguel será reajustado anualmente pela variação positiva do IGP-M/FGV ou, na sua ausência, pelo IPCA/IBGE.
Parágrafo Segundo: O atraso no pagamento acarretará multa moratória de 10% (dez por cento) sobre o valor do débito, acrescido de juros de 1% ao mês.

CLÁUSULA QUARTA - DOS ENCARGOS
Além do aluguel, o LOCATÁRIO é responsável pelo pagamento de:
a) Taxas de condomínio e IPTU ({{valor_condominio}} e {{valor_iptu}});
b) Consumo de energia, água e gás;
c) Seguro contra incêndio do imóvel;
d) Taxa de Rateio Fixa mensal de R$ {{valor_taxa_rateio}} destinada à manutenção de áreas comuns, internet coletiva e demais serviços compartilhados (se aplicável).

CLÁUSULA QUINTA - DA GARANTIA (CAUÇÃO)
O LOCATÁRIO deposita, neste ato, a título de caução, a importância de R$ {{valor_caucao}}, equivalente a no máximo 03 (três) meses de aluguel.
Parágrafo Único: O valor será devolvido ao final da locação, devidamente corrigido pelos índices da caderneta de poupança, após a vistoria de saída e quitação de todos os débitos.

CLÁUSULA SEXTA - DA MULTA RESCISÓRIA
A infração de qualquer das cláusulas deste contrato sujeitará a parte infratora ao pagamento de multa equivalente a {{multa_rescisoria_meses}} meses de aluguel vigente à época da infração, paga de forma proporcional ao tempo restante do contrato, conforme previsto no Art. 4º da Lei 8.245/91.
Parágrafo Único: A desocupação antes do período mínimo de {{periodo_lockin}} meses sujeitará o LOCATÁRIO ao pagamento integral da multa rescisória, sem qualquer tipo de proporcionalidade.

CLÁUSULA SÉTIMA - DA DESTINAÇÃO E BENFEITORIAS
O imóvel destina-se exclusivamente para fins residenciais. Qualquer alteração estrutural ou benfeitoria necessita de prévia autorização por escrito do LOCADOR. Benfeitorias úteis ou necessárias não serão indenizáveis, salvo ajuste prévio.

CLÁUSULA OITAVA - DO FORO
As partes elegem o Foro da Comarca de {{cidade_contrato}} para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, renunciando a qualquer outro por mais privilegiado que seja.'
) on conflict (id) do nothing;

-- PROPERTY DOCUMENTS POLICIES
create policy "Users involved can view property documents" on public.property_documents
  for select using (
    exists (
      select 1 from public.properties
      where properties.id = property_documents.property_id
      and (
        properties.owner_id = (auth.jwt() ->> 'sub')::text
        or exists (
          select 1 from public.contracts
          where contracts.property_id = properties.id
          and contracts.tenant_id = (auth.jwt() ->> 'sub')::text
        )
    )
  );

-- SAVED CARDS (Payment methods stored per user)
create table public.saved_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null default (auth.jwt() ->> 'sub'),
  brand text not null,
  last4 text not null,
  exp_month integer not null,
  exp_year integer not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.saved_cards enable row level security;

create policy "Users can view their own saved cards"
  on public.saved_cards for select
  using (user_id = (auth.jwt() ->> 'sub')::text);

create policy "Users can insert their own saved cards"
  on public.saved_cards for insert
  with check (user_id = (auth.jwt() ->> 'sub')::text);

create policy "Users can delete their own saved cards"
  on public.saved_cards for delete
  using (user_id = (auth.jwt() ->> 'sub')::text);


create policy "Owners can manage property documents" on public.property_documents
  for all using (
    exists (
      select 1 from public.properties
      where properties.id = property_documents.property_id
      and properties.owner_id = (auth.jwt() ->> 'sub')::text
    ) or is_admin()
  );

create policy "Tenants can insert onboarding property documents" on public.property_documents
  for insert with check (
    exists (
      select 1 from public.properties
      where properties.id = property_id
      and exists (
        select 1 from public.contracts
        where contracts.property_id = properties.id
        and contracts.tenant_id = (auth.jwt() ->> 'sub')::text
      )
    )
  );

-- FINANCIAL TRANSACTIONS
create table public.financial_transactions (
  id uuid default uuid_generate_v4() primary key,
  owner_id text not null references public.profiles(id),
  property_id uuid references public.properties(id),
  title text not null,
  description text,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text,
  date date not null,
  status text not null default 'pending' check (status in ('paid', 'pending')),
  attachment_url text,
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.financial_transactions enable row level security;

create policy "Users can view their own financial transactions"
  on public.financial_transactions for select
  using (owner_id = (auth.jwt() ->> 'sub')::text);

create policy "Users can insert their own financial transactions"
  on public.financial_transactions for insert
  with check (owner_id = (auth.jwt() ->> 'sub')::text);

create policy "Users can update their own financial transactions"
  on public.financial_transactions for update
  using (owner_id = (auth.jwt() ->> 'sub')::text);

create policy "Users can delete their own financial transactions"
  on public.financial_transactions for delete
  using (owner_id = (auth.jwt() ->> 'sub')::text);

