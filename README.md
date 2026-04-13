# IGLOO Property Manager

Uma dashboard moderna e responsiva para gestão de propriedades, inquilinos e finanças.

## Tecnologias

- **React** 18
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Ícones)
- **Recharts** (Gráficos)
- **Supabase** (Autenticação e Dados)

## Funcionalidades

- **Dashboard do Proprietário**: Visão geral de fluxo de caixa, inquilinos e manutenções.
- **Gestão de Imóveis**: Cadastro, listagem e visualização detalhada.
- **Vistorias**: Comparativo visual de entrada e saída com upload de fotos e vídeos.
- **Área do Inquilino**: Acesso a boletos, mensagens e solicitações de reparo.
- **Modo Escuro/Claro**: Suporte nativo a temas.

## Setup Local

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```

4. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Se alterar o `.env`, reinicie o servidor.

## Usuários de Teste

Para testar os perfis principais no Supabase Authentication:

- **Proprietário**
  - Email: `proprietario@teste.com`
  - Senha: `teste123`
  - Email 2: `arthur.alencar@colegiosaojudas.com.br` (Teste Adicional)
- **Inquilino**
  - Email: `inquilino@teste.com`
  - Senha: `teste123`
- **Admin**
  - Email: `admin@teste.com`
  - Senha: `admin123`

Após criar os usuários em **Authentication > Users**, garanta que os perfis estejam sincronizados na tabela `public.profiles`:

```sql
insert into public.profiles (id, email, name, role, admin_type, permissions)
select
  u.id,
  u.email,
  case
    when u.email = 'proprietario@teste.com' then 'Carlos Proprietário'
    when u.email = 'arthur.alencar@colegiosaojudas.com.br' then 'Arthur Alencar'
    when u.email = 'inquilino@teste.com' then 'João Inquilino'
    when u.email = 'admin@teste.com' then 'Admin Master'
    else split_part(u.email, '@', 1)
  end,
  case
    when u.email = 'proprietario@teste.com' then 'owner'
    when u.email = 'arthur.alencar@colegiosaojudas.com.br' then 'owner'
    when u.email = 'inquilino@teste.com' then 'tenant'
    when u.email = 'admin@teste.com' then 'admin'
    else 'owner'
  end,
  case
    when u.email = 'admin@teste.com' then 'super'
    else null
  end,
  case
    when u.email = 'admin@teste.com' then '["*"]'::jsonb
    else '[]'::jsonb
  end
from auth.users u
where u.email in (
  'proprietario@teste.com',
  'inquilino@teste.com',
  'admin@teste.com',
  'arthur.alencar@colegiosaojudas.com.br'
)
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role,
  admin_type = excluded.admin_type,
  permissions = excluded.permissions,
  updated_at = timezone('utc'::text, now());
```

## Troubleshooting

### Login do Admin

Se o login do usuário admin falhar com `Invalid login credentials`, o problema está no `auth.users` e não no RLS. Nesse caso, rode no SQL Editor do Supabase:

```sql
create extension if not exists pgcrypto;

update auth.users
set
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where email = 'admin@teste.com';

update public.profiles
set
  role = 'admin',
  admin_type = 'super',
  name = 'Admin Master',
  permissions = '["*"]'::jsonb,
  updated_at = now()
where email = 'admin@teste.com';
```

### Regras de Autenticação

- O usuário precisa existir em `auth.users` e em `public.profiles`.
- O projeto possui trigger para sincronizar novos usuários do Auth com `public.profiles`.
- As políticas RLS de `profiles` precisam permitir `select`, `insert` e `update` do próprio usuário.

### Problemas de Ambiente

- Se aparecer `placeholder.supabase.co`, o `.env` não foi carregado.
- Se alterar o `.env`, reinicie o servidor com `npm run dev`.
- Se a porta esperada estiver ocupada, o Vite pode subir em outra porta.
