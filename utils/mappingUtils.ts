import { Property, Tenant, Contract, FinancialTransaction } from '../types';
import { formatCurrency } from './formatters';

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const mapProperty = (row: Record<string, unknown>): Property => ({
  id: row.id as string,
  name: row.name as string,
  address: row.address as string,
  status: row.status as 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO',
  price: formatCurrency(row.price as number),
  numeric_price: row.numeric_price as number | undefined,
  market_value: (row.market_value as number) || 0,
  area: `${row.area as string}m²`,
  image: row.image_url as string,
  owner_id: row.owner_id as string,
  bedrooms: row.bedrooms as number | undefined,
  bathrooms: row.bathrooms as number | undefined,
  parking: row.parking as number | undefined,
  status_color: getPropertyStatusColor(row.status as string),
  tenant: (row.contracts as Record<string, unknown>[] | undefined)?.[0]?.profiles
    ? mapTenant((row.contracts as Record<string, unknown>[])[0].profiles as Record<string, unknown>)
    : null,
  contract: (row.contracts as Record<string, unknown>[] | undefined)?.[0]
    ? mapContract(
        (row.contracts as Record<string, unknown>[])[0] as Record<string, unknown>,
        row.name as string
      )
    : null,
  created_at: row.created_at as string | undefined,
  updated_at: row.updated_at as string | undefined,
});

export const getPropertyStatusColor = (status: string) => {
  switch (status) {
    case 'ALUGADO':
      return 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    case 'MANUTENÇÃO':
      return 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
};

export const mapTenant = (t: Record<string, unknown>): Tenant => {
  const contracts = t.contracts;
  const contractsArr = Array.isArray(contracts)
    ? (contracts as Record<string, unknown>[])
    : undefined;
  const activeContract = contractsArr ? contractsArr.find((c) => c.status === 'active') : undefined;

  const propertyData = activeContract?.property;
  const property = (Array.isArray(propertyData) ? propertyData[0] : propertyData) as
    | Record<string, unknown>
    | undefined;

  const spouseRaw = t.spouse;
  const spouseData = Array.isArray(spouseRaw)
    ? (spouseRaw as Record<string, unknown>[])[0]
    : (spouseRaw as Record<string, unknown> | undefined);
  const refsData = t.references as Record<string, unknown>[] | undefined;
  const repsData = t.legal_representatives as Record<string, unknown>[] | undefined;

  return {
    id: t.id as string,
    name: (t.name as string) || 'Sem Nome',
    email: t.email as string,
    phone: (t.phone as string) || '',
    cpf: t.cpf as string | undefined,
    rg: t.rg as string | undefined,
    company_name: t.company_name as string | undefined,
    company_cnpj: t.company_cnpj as string | undefined,
    company_address: t.company_address as string | undefined,
    occupation: t.occupation as string | undefined,
    monthly_income: t.monthly_income as number | undefined,
    admission_date: t.admission_date as string | undefined,
    birth_date: t.birth_date as string | undefined,
    marital_status: t.marital_status as string | undefined,
    nationality: t.nationality as string | undefined,
    rg_issuer: t.rg_issuer as string | undefined,
    rg_uf: t.rg_uf as string | undefined,
    cep: t.cep as string | undefined,
    street: t.street as string | undefined,
    street_number: t.street_number as string | undefined,
    complement: t.complement as string | undefined,
    neighborhood: t.neighborhood as string | undefined,
    city: t.city as string | undefined,
    state: t.state as string | undefined,
    residence_time: t.residence_time as string | undefined,
    phone_commercial: t.phone_commercial as string | undefined,
    other_income: t.other_income as number | undefined,
    adults_count: t.adults_count as number | undefined,
    children_count: t.children_count as number | undefined,
    currently_pays_rent: t.currently_pays_rent as boolean | undefined,
    current_rent_where: t.current_rent_where as string | undefined,
    tenant_type: (t.tenant_type as 'pf' | 'pj') || 'pf',
    company_legal_name: t.company_legal_name as string | undefined,
    company_trade_name: t.company_trade_name as string | undefined,
    company_state_registration: t.company_state_registration as string | undefined,
    spouse: spouseData && spouseData.id
      ? ({
          id: spouseData.id as string,
          tenant_id: spouseData.tenant_id as string,
          name: spouseData.name as string,
          cpf: spouseData.cpf as string | undefined,
          rg: spouseData.rg as string | undefined,
          birth_date: spouseData.birth_date as string | undefined,
          phone: spouseData.phone as string | undefined,
          occupation: spouseData.occupation as string | undefined,
          monthly_income: spouseData.monthly_income as number | undefined,
        } as Tenant['spouse'])
      : undefined,
    references: refsData
      ? (refsData as unknown as Tenant['references'])
      : undefined,
    legal_representatives: repsData
      ? (repsData as unknown as Tenant['legal_representatives'])
      : undefined,
    guarantee_type: t.guarantee_type as Tenant['guarantee_type'],
    image: t.avatar_url as string | undefined,
    status: (!activeContract
      ? 'inactive'
      : activeContract.status === 'late'
        ? 'late'
        : activeContract.status === 'cancelled'
          ? 'inactive'
          : 'active') as 'active' | 'late' | 'inactive',
    is_pending: t.is_pending as boolean | undefined,
    property: (property?.name as string) || 'NÃO VINCULADO',
    property_id: property?.id as string | undefined,
    property_address: property?.address as string | undefined,
    property_image: property?.image_url as string | undefined,
    contract: activeContract
      ? {
          id: activeContract.id as string,
          monthly_value: activeContract.monthly_value as number,
          status: (activeContract.status as string) || 'active',
          payment_day: activeContract.payment_day as number | undefined,
          start_date: (activeContract.start_date as string) || '',
          end_date: (activeContract.end_date as string) || '',
          pdf_url: activeContract.pdf_url as string | undefined,
        }
      : undefined,
    onboarding_stage: t.onboarding_stage as string | undefined,
    has_completed_onboarding: t.has_completed_onboarding as boolean | undefined,
    onboarding_profile_status: t.onboarding_profile_status as string | undefined,
    onboarding_documents_status: t.onboarding_documents_status as string | undefined,
    onboarding_contract_status: t.onboarding_contract_status as string | undefined,
    onboarding_inspection_status: t.onboarding_inspection_status as string | undefined,
    onboarding_profile_rejected_reason: t.onboarding_profile_rejected_reason as string | undefined,
    onboarding_documents_rejected_reason: t.onboarding_documents_rejected_reason as
      | string
      | undefined,
    onboarding_documents_urls: fixOnboardingUrls(
      t.onboarding_documents_urls as Record<string, unknown> | null | undefined
    ) as unknown as Tenant['onboarding_documents_urls'],
  };
};

export const mapContract = (c: Record<string, unknown>, propertyName?: string): Contract => ({
  id: c.id as string,
  contract_number: (c.contract_number as string) || 'N/A',
  property:
    propertyName ||
    ((c.properties as Record<string, unknown> | undefined)?.name as string) ||
    'N/A',
  tenant_name: ((c.profiles as Record<string, unknown> | undefined)?.name as string) || 'N/A',
  owner_name: 'Você',
  start_date: formatDate(c.start_date as string | Date),
  end_date: formatDate(c.end_date as string | Date),
  value: formatCurrency(c.monthly_value as number),
  numeric_value: c.monthly_value as number,
  payment_day: c.payment_day as number,
  status: c.status as Contract['status'],
  signers: Array.isArray(c.signers) ? (c.signers as Contract['signers']) : [],
  history: Array.isArray(c.history) ? (c.history as Contract['history']) : [],
  pdf_url: c.pdf_url as string | undefined,
});

export const mapTransaction = (t: Record<string, unknown>): FinancialTransaction => ({
  id: t.id as string,
  owner_id: t.owner_id as string,
  property_id: t.property_id as string | undefined,
  title: t.title as string,
  description: t.description as string | undefined,
  amount: t.amount as number,
  type: t.type as 'income' | 'expense',
  category: t.category as string | undefined,
  date: t.date as string,
  status: t.status as 'paid' | 'pending',
  attachment_url: t.attachment_url as string | undefined,
  is_recurring: (t.is_recurring as boolean) ?? false,
  hasAttachment: !!t.attachment_url,
  created_at: t.created_at as string | undefined,
  updated_at: t.updated_at as string | undefined,
});

export const fixDocumentUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes('supabase.co/storage')) return url;
  return url;
};

export const fixOnboardingUrls = (
  urlsObj: Record<string, unknown> | null | undefined
): Record<string, unknown> | null | undefined => {
  if (!urlsObj) return urlsObj;
  const fixed = { ...urlsObj };
  Object.keys(fixed).forEach((key) => {
    if (typeof fixed[key] === 'string' && key.toLowerCase().includes('url')) {
      fixed[key] = fixDocumentUrl(fixed[key] as string);
    }
  });
  return fixed;
};
