# Guia de Gerenciamento de Autenticação e Funções (Roles)

Este documento descreve o procedimento para gerenciar as funções de usuário (Administrador, Proprietário, Inquilino) integrando **Clerk** e **Supabase**.

## 1. Estrutura de Funções
O sistema Igloo utiliza três níveis de acesso principais:
- `admin`: Acesso total ao painel administrativo.
- `owner`: Acesso ao painel do proprietário (imóveis, finanças, etc).
- `tenant`: Acesso ao painel do inquilino (aluguel, manutenção).

## 2. Procedimento para Alterar Função (Role)

Para alterar a função de um usuário manualmente, é necessário atualizar em dois lugares:

### A. No Clerk (Dashboard)
O Clerk é a fonte primária de autenticação. O sistema prioriza a role definida nas metadatas do Clerk.

1. Acesse o **Clerk Dashboard** > **Users**.
2. Selecione o usuário desejado.
3. Vá até a seção **Metadata**.
4. No campo **Public Metadata**, insira ou edite o seguinte JSON:
   ```json
   {
     "role": "admin"
   }
   ```
   *(Substitua "admin" por "owner" ou "tenant" conforme necessário).*
5. Clique em **Save**.

### B. No Supabase (Banco de Dados)
O Supabase armazena o perfil estendido. É importante que esteja sincronizado para garantir que as políticas de segurança (RLS) funcionem corretamente.

1. No Supabase SQL Editor, execute:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin', admin_type = 'super' 
   WHERE email = 'usuario@email.com';
   ```
   *(Use `admin_type = 'super'` apenas para administradores mestres).*

## 3. Ativação das Alterações
Para que as novas permissões sejam aplicadas no navegador do usuário:
1. O usuário **DEVE** realizar o **Logout**.
2. O usuário deve realizar o **Login** novamente.

Isso limpará os tokens antigos e carregará as novas permissões do Clerk Public Metadata.

---
> [!TIP]
> Sempre verifique se o e-mail no Clerk e no Supabase são idênticos ao realizar manutenções manuais.
