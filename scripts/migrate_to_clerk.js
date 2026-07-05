/**
 * IGLOO - SCRIPT DE MIGRAÇÃO DE USUÁRIOS
 * Supabase Auth -> Clerk
 * 
 * ATENÇÃO: As senhas NÃO podem ser migradas diretamente (o Supabase não as exporta). 
 * Seus usuários atuais precisarão fazer a redefinição de senha no primeiro acesso ao Clerk.
 */

import { createClerkClient } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configurações
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // NECESSÁRIO NO .ENV
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY; // NECESSÁRIO NO .ENV

if (!SUPABASE_SERVICE_KEY || !CLERK_SECRET_KEY) {
  console.error('❌ ERRO: Faltam chaves Secretas no seu .env! (SUPABASE_SERVICE_ROLE_KEY e CLERK_SECRET_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

async function migrateUsers() {
  console.log('🔄 Iniciando migração de usuários para o Clerk...');

  // 1. Buscar perfis existentes no Supabase
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');

  if (profileError) {
    console.error('❌ Erro ao buscar perfis:', profileError);
    return;
  }

  console.log(`📦 Encontrados ${profiles.length} perfis para migrar.`);

  for (const profile of profiles) {
    try {
      console.log(`🚀 Migrando: ${profile.email}...`);

      // 2. Criar o usuário no Clerk
      const user = await clerk.users.createUser({
        emailAddress: [profile.email],
        firstName: profile.name?.split(' ')[0] || '',
        lastName: profile.name?.split(' ').slice(1).join(' ') || '',
        // Definimos o papel (role) no metadata público para que o iGloo reconheça
        publicMetadata: {
          role: profile.role || 'owner'
        },
        skipPasswordRequirement: true // O usuário criará a senha via 'Esqueci Senha'
      });

      console.log(`✅ Criado no Clerk! Novo ID: ${user.id}`);

      // 3. Opcional: Se você quiser migrar o ID antigo para manter o histórico de registros
      // Você pode criar uma nova entrada na tabela profiles com o novo ID do Clerk
      // e depois rodar um SQL para atualizar as FKs (Contratos, Imóveis, etc).
      
      // NOTA: No iGloo, nosso AuthContext agora usa profileService.ensureProfile({id: clerk_id})
      // Isso criará um NOVO perfil para o usuário se não existir.
      // O ideal é você renomear o ID na tabela profiles para o novo ID do Clerk aqui.

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ id: user.id })
        .eq('email', profile.email);

      if (updateError) {
        console.warn(`⚠️ Aviso: Usuário migrado, mas falha ao atualizar ID na tabela profiles:`, updateError.message);
      }

    } catch (err) {
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        console.log(`ℹ️ O usuário ${profile.email} já existe no Clerk. Pulando...`);
      } else {
        console.error(`❌ Erro ao migrar ${profile.email}:`, err);
      }
    }
  }

  console.log('✨ Migração concluída!');
}

migrateUsers();
