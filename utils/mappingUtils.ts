import { Property, Tenant, Contract, FinancialTransaction } from '../types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const mapProperty = (row: any): Property => ({
  id: row.id,
  name: row.name,
  address: row.address,
  status: row.status,
  price: formatCurrency(row.price),
  numeric_price: row.price,
  market_value: row.market_value || 0,
  area: `${row.area}m²`,
  image:
    row.image_url ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=300',
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  parking: row.parking,
  status_color: getPropertyStatusColor(row.status),
  tenant: row.contracts?.[0]?.profiles ? mapTenant(row.contracts[0].profiles) : null,
  contract: row.contracts?.[0] ? mapContract(row.contracts[0], row.name) : null,
  created_at: row.created_at,
  updated_at: row.updated_at,
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

export const mapTenant = (t: any): Tenant => {
  // Find active contract if nested
  const activeContract = Array.isArray(t.contracts)
    ? t.contracts.find((c: any) => c.status === 'active') || t.contracts[0]
    : t.contracts;

  const propertyData = activeContract?.property;
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData;

  return {
    id: t.id,
    name: t.name || 'Sem Nome',
    email: t.email,
    phone: t.phone || '',
    cpf: t.cpf,
    image: t.avatar_url,
    status: (activeContract?.status === 'late'
      ? 'late'
      : activeContract?.status === 'inactive'
      ? 'inactive'
      : 'active') as 'active' | 'late' | 'inactive',
    is_pending: t.is_pending,
    property: property?.name || 'NÃO VINCULADO',
    property_id: property?.id,
    property_address: property?.address,
    property_image: property?.image_url,
    contract: activeContract
      ? {
          id: activeContract.id,
          monthly_value: activeContract.monthly_value,
          status: activeContract.status || 'active',
          payment_day: activeContract.payment_day ?? undefined,
          start_date: activeContract.start_date || '',
          end_date: activeContract.end_date || '',
        }
      : undefined,
  };
};

export const mapContract = (c: any, propertyName?: string): Contract => ({
  id: c.id,
  contract_number: c.contract_number || 'N/A',
  property: propertyName || c.properties?.name || 'N/A',
  tenant_name: c.profiles?.name || 'N/A',
  owner_name: 'Você', // Common string, could be improved to use real owner name
  start_date: formatDate(c.start_date),
  end_date: formatDate(c.end_date),
  value: formatCurrency(c.monthly_value),
  numeric_value: c.monthly_value,
  payment_day: c.payment_day,
  status: c.status,
  signers: Array.isArray(c.signers) ? c.signers : [],
  history: Array.isArray(c.history) ? c.history : [],
  pdf_url: c.pdf_url,
});

export const mapTransaction = (t: any): FinancialTransaction => ({
  id: t.id,
  owner_id: t.owner_id,
  property_id: t.property_id,
  title: t.title,
  description: t.description,
  amount: t.amount,
  type: t.type as 'income' | 'expense',
  category: t.category,
  date: t.date,
  status: t.status as 'paid' | 'pending',
  attachment_url: t.attachment_url,
  is_recurring: t.is_recurring,
  created_at: t.created_at,
  updated_at: t.updated_at,
});
