-- Optimizations for IGLOO Database

-- 1. Performance Indexes
-- properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- contracts indexes
CREATE INDEX IF NOT EXISTS idx_contracts_property_id ON public.contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_owner_id ON public.contracts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);

-- payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);

-- maintenance_requests indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON public.maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant_id ON public.maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_requests(status);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_unread ON public.notifications(user_id) WHERE is_read = false;

-- support_tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_owner_id ON public.support_tickets(owner_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);


-- 2. Useful Views for Frontend
-- View for Property Details with active tenant and contract
CREATE OR REPLACE VIEW property_overview AS
SELECT 
    p.id as property_id,
    p.name as property_name,
    p.address,
    p.status as property_status,
    p.price as current_price,
    p.image_url,
    c.id as contract_id,
    c.contract_number,
    c.status as contract_status,
    c.monthly_value,
    c.start_date,
    c.end_date,
    tp.id as tenant_id,
    tp.name as tenant_name,
    tp.email as tenant_email,
    tp.avatar_url as tenant_avatar
FROM 
    properties p
LEFT JOIN 
    contracts c ON p.id = c.property_id AND c.status = 'active'
LEFT JOIN 
    profiles tp ON c.tenant_id = tp.id;

-- View for Owner Financial Summary
CREATE OR REPLACE VIEW owner_financial_summary AS
SELECT 
    owner_id,
    COUNT(id) as total_properties,
    SUM(CASE WHEN status = 'ALUGADO' THEN 1 ELSE 0 END) as occupied_properties,
    SUM(price) as total_portfolio_value
FROM 
    properties
GROUP BY 
    owner_id;

-- 3. Security (Optional: ensure RLS is enabled for views if needed, though they inherit from tables)
-- Views in Postgres usually inherit permissions, but good to be aware.
