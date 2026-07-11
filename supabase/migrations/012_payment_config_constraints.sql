-- Migration 012: Add payment config constraints and expand property_documents

-- 1. Update any configurations that have both accepts_deposit and accepts_guarantor as false
-- to accepts_deposit = true to avoid violating the new constraint.
UPDATE public.owner_payment_config
SET accepts_deposit = true
WHERE accepts_deposit = false AND accepts_guarantor = false;

-- 2. Add CHECK constraint to owner_payment_config requiring at least one modality active
ALTER TABLE public.owner_payment_config
  ADD CONSTRAINT accepts_at_least_one_guarantee
  CHECK (accepts_deposit = true OR accepts_guarantor = true);

-- 3. Expand property_documents table with document_type and tenant_id
ALTER TABLE public.property_documents
  ADD COLUMN IF NOT EXISTS document_type text,
  ADD COLUMN IF NOT EXISTS tenant_id text REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Update owner_payment_config RLS policy for tenants to allow select during onboarding (draft / pending_signature contracts)
DROP POLICY IF EXISTS "Tenants can view owner payment config" ON public.owner_payment_config;

CREATE POLICY "Tenants can view owner payment config" ON public.owner_payment_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.owner_id = owner_payment_config.owner_id
      AND c.tenant_id = (auth.jwt() ->> 'sub')::text
      AND c.status IN ('active', 'pending_signature', 'draft')
    )
  );
