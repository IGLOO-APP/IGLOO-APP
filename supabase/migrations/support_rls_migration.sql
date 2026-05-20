-- Migração de RLS para Suporte Igloo (Proprietários <-> Administradores)

-- =====================================================================
-- 1. Tabelas de suporte: support_tickets
-- =====================================================================

-- Permitir inserção de chamados por usuários normais (onde user_id é o próprio Clerk ID) e por administradores
DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.support_tickets;
CREATE POLICY "Users can insert their own tickets" ON public.support_tickets
  FOR INSERT
  WITH CHECK (
    ((auth.jwt() ->> 'sub')::text = user_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (auth.jwt() ->> 'sub')::text 
      AND role = 'admin'
    )
  );

-- Permitir atualização de chamados (ex: alterar status para fechar, ou atribuições de operador)
DROP POLICY IF EXISTS "Users and Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Users and Admins can update tickets" ON public.support_tickets
  FOR UPDATE
  USING (
    ((auth.jwt() ->> 'sub')::text = user_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (auth.jwt() ->> 'sub')::text 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    ((auth.jwt() ->> 'sub')::text = user_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (auth.jwt() ->> 'sub')::text 
      AND role = 'admin'
    )
  );


-- =====================================================================
-- 2. Tabelas de mensagens: support_messages
-- =====================================================================

-- Permitir inserção de mensagens apenas nos próprios chamados (onde sender_id é o Clerk ID e pertence ao ticket correspondente) ou por administradores
DROP POLICY IF EXISTS "Users can insert messages to their own tickets" ON public.support_messages;
CREATE POLICY "Users can insert messages to their own tickets" ON public.support_messages
  FOR INSERT
  WITH CHECK (
    (
      sender_id = (auth.jwt() ->> 'sub')::text
      AND EXISTS (
        SELECT 1 FROM public.support_tickets st 
        WHERE st.id = ticket_id 
        AND st.user_id = (auth.jwt() ->> 'sub')::text
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (auth.jwt() ->> 'sub')::text 
      AND role = 'admin'
    )
  );

-- Permitir atualização das mensagens do chamado (ex: marcar como lida)
DROP POLICY IF EXISTS "Users and Admins can update support messages" ON public.support_messages;
CREATE POLICY "Users and Admins can update support messages" ON public.support_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = ticket_id
      AND st.user_id = (auth.jwt() ->> 'sub')::text
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (auth.jwt() ->> 'sub')::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = ticket_id
      AND st.user_id = (auth.jwt() ->> 'sub')::text
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (auth.jwt() ->> 'sub')::text
      AND role = 'admin'
    )
  );
