-- Migração: Alterar profiles.id de uuid para text
-- Motivo: Clerk usa IDs em formato de texto (user_xxx), não UUIDs

-- 1. Remover constraints de FK que apontam para profiles.id
alter table public.profiles alter column id drop default;
alter table public.profiles alter column id set data type text;

-- 2. Atualizar todas as tabelas com FK para profiles.id
alter table public.admin_activity_log alter column admin_id set data type text;
alter table public.impersonation_sessions alter column admin_id set data type text;
alter table public.impersonation_sessions alter column target_user_id set data type text;

-- Tabelas que já usam text para profiles.id (owner_id, tenant_id, etc.)
-- Estas já estão corretas:
--   support_tickets.owner_id → text ✓
--   support_tickets.assigned_admin_id → text ✓
--   support_ticket_messages.sender_id → text ✓
--   system_announcements.created_by_admin_id → text ✓
--   properties.owner_id → text ✓
--   contracts.tenant_id → text ✓
--   contracts.owner_id → text ✓
--   inspections.tenant_id → text ✓
--   signature_audits.signer_id → text ✓
--   maintenance_requests.tenant_id → text ✓

-- 3. Recriar o trigger handle_new_user (agora aceita text)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, email, name, role, phone
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

-- 4. Criar função claim_tenant_profile (se não existir)
create or replace function public.claim_tenant_profile(
  p_old_id text,
  p_new_id text,
  p_name text default null,
  p_avatar_url text default null
)
returns json
language plpgsql security definer
as $$
declare
  v_role text;
  v_result json;
begin
  -- Atualizar o ID do profile
  update public.profiles
  set id = p_new_id,
      name = coalesce(p_name, name),
      avatar_url = coalesce(p_avatar_url, avatar_url),
      updated_at = timezone('utc'::text, now())
  where id = p_old_id
  returning role into v_role;

  if not found then
    return json_build_object('error', 'Profile not found');
  end if;

  -- Retornar o novo perfil
  select json_build_object(
    'id', p_new_id,
    'role', v_role,
    'name', coalesce(p_name, ''),
    'email', ''
  ) into v_result;

  return v_result;
end;
$$;

-- 5. Remover e recriar a FK de auth.users (agora text)
-- Nota: auth.users.id continua uuid, mas profiles.id passa a text
-- A FK original (profiles.id → auth.users.id) precisa ser adaptada
-- Solução: adicionar uma coluna clerk_id separada ou remover a FK

-- Opção recomendada: remover a FK para auth.users e manter profiles.id como chave primária text
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles drop constraint if exists profiles_pkey;
alter table public.profiles add primary key (id);

-- Adicionar índice para busca por email
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
