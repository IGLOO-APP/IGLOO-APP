# Guia de Deploy Vercel

Siga estas instruções para publicar a aplicação **Igloo Property Manager** na Vercel:

## 1. Conectar ao Repositório Git

1. Acesse o painel da [Vercel](https://vercel.com/)
2. Clique em **Add New Project**
3. Importe o repositório do projeto do seu GitHub, GitLab ou Bitbucket

## 2. Configurações de Build

O Vite é suportado por padrão na Vercel. A configuração de build deverá ser detectada automaticamente:

- **Framework Preset Plate**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 3. Variáveis de Ambiente

Na aba "Environment Variables", defina as seguintes chaves com os valores do seu projeto Supabase:

| Chave | Descrição |
| --- | --- |
| `VITE_SUPABASE_URL` | A URL do seu projeto Supabase (encontrada em Settings > API). |
| `VITE_SUPABASE_ANON_KEY` | A chave pública do Supabase (anon key) (encontrada no mesmo painel). |

> [!WARNING]
> Mantenha suas chaves seguras e nunca faça commit delas no repositório.

## 4. Realize o Deploy

1. Salve as variáveis de ambiente.
2. Clique em **Deploy**.
3. Aguarde o fim do processo.

## Roteamento SPA

O projeto inclui um arquivo `vercel.json` na raiz da aplicação. O arquivo define "rewrites" mandando todas as rotas para o \`index.html\`, o que assegura que o roteamento flua corretamente para dentro do React Router (mesmo caso mude para o \`BrowserRouter\` padrão).

---
*Pronto! Após a compilação, o sistema estará operante na Vercel.*
