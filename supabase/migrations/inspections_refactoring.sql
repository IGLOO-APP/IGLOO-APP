-- 1. Tabela de Inspeções (Vistorias)
CREATE TABLE IF NOT EXISTS public.inspections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('entrada', 'saída', 'periódica')) NOT NULL,
  status text CHECK (status IN ('rascunho', 'pendente_assinatura', 'concluída')) DEFAULT 'rascunho' NOT NULL,
  inspector_name text NOT NULL,
  inspection_date timestamp with time zone NOT NULL,
  visibility text CHECK (visibility IN ('admin', 'tenant')) DEFAULT 'admin' NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Cômodos/Itens de Vistoria
CREATE TABLE IF NOT EXISTS public.inspection_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id uuid REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  room_name text NOT NULL, -- Ex: "Sala", "Cozinha", "Quarto 1"
  condition text CHECK (condition IN ('bom', 'regular', 'danificado')) NOT NULL,
  notes text,
  photos text[] DEFAULT '{}'::text[] NOT NULL, -- URLs do Supabase Storage
  videos text[] DEFAULT '{}'::text[] NOT NULL, -- URLs de vídeos (mp4, webm, mov)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Assinaturas das Vistorias
CREATE TABLE IF NOT EXISTS public.inspection_signatures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id uuid REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  signer_type text CHECK (signer_type IN ('owner', 'tenant')) NOT NULL,
  signed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  signature_data text NOT NULL -- Nome + CPF + IP do signatário
);

-- Habilitar RLS e criar políticas de acesso
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas de Select corrigida para segurança estrita de inquilinos
CREATE POLICY "Users linked to property can view inspections" ON public.inspections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id
      AND (
        p.owner_id = (auth.jwt() ->> 'sub')::text 
        OR (
          visibility = 'tenant' 
          AND EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.property_id = p.id 
            AND c.tenant_id = (auth.jwt() ->> 'sub')::text
          )
        )
      )
    )
  );

CREATE POLICY "Owners can manage inspections" ON public.inspections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id
      AND p.owner_id = (auth.jwt() ->> 'sub')::text
    )
  );
