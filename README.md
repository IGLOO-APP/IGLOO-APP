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

## Como Rodar

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Configuração

Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```
