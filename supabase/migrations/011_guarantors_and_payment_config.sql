-- 011: Expand guarantors table and create owner_payment_config

-- Expand guarantors with new fields
ALTER TABLE public.guarantors ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE public.guarantors ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id);
ALTER TABLE public.guarantors ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pendente', 'aprovado', 'reprovado')) DEFAULT 'pendente';
ALTER TABLE public.guarantors ADD COLUMN IF NOT EXISTS rg_document_url text;
ALTER TABLE public.guarantors ADD COLUMN IF NOT EXISTS income_proof_url text;

-- Create owner_payment_config table
CREATE TABLE IF NOT EXISTS public.owner_payment_config (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id text NOT NULL UNIQUE REFERENCES public.profiles(id),
  accepts_deposit boolean DEFAULT false,
  accepts_guarantor boolean DEFAULT false,
  pix_enabled boolean DEFAULT false,
  pix_key_type text,
  pix_key text,
  bank_transfer_enabled boolean DEFAULT false,
  bank_name text,
  bank_agency text,
  bank_account text,
  bank_account_type text,
  account_holder_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for owner_payment_config
ALTER TABLE public.owner_payment_config ENABLE ROW LEVEL SECURITY;

-- Owner can manage own config
CREATE POLICY "Owners can manage own payment config" ON public.owner_payment_config
  FOR ALL USING (owner_id = (auth.jwt() ->> 'sub')::text)
  WITH CHECK (owner_id = (auth.jwt() ->> 'sub')::text);

-- Tenant can view config of the owner of their property (for deposit payment)
CREATE POLICY "Tenants can view owner payment config" ON public.owner_payment_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.owner_id = owner_payment_config.owner_id
      AND c.tenant_id = (auth.jwt() ->> 'sub')::text
      AND c.status = 'active'
    )
  );

-- Also add index for performance
CREATE INDEX IF NOT EXISTS idx_owner_payment_config_owner_id ON public.owner_payment_config(owner_id);
