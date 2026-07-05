export interface FinancialTransaction {
  id: string;
  owner_id: string;
  property_id?: string;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  date: string;
  status: 'paid' | 'pending';
  attachment_url?: string;
  hasAttachment?: boolean;
  is_recurring: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LateFeeResult {
  valorMulta: number;
  valorJuros: number;
  totalPagar: number;
  diasAtraso: number;
}

export interface ApportionmentDistributionItem {
  id: string;
  name: string;
  isOccupied: boolean;
  residentsCount: number;
  share: number;
  note?: string;
}

export interface ApportionmentResult {
  distribution: ApportionmentDistributionItem[];
  ownerTotal: number;
}

export interface MatchedBankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  suggestedCategory?: string;
  matchedId?: string;
  matchStatus: 'perfect' | 'none';
}

export interface PaymentRecord {
  id: string;
  contract_id: string;
  due_date: string;
  paid_date: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'late' | 'cancelled';
  payment_method: string | null;
  notes: string | null;
  contracts?: {
    owner_id: string;
    property_id: string;
  };
}

export interface CashFlowDataPoint {
  name: string;
  value?: number;
  actual?: number;
  projected?: number;
  isProjection?: boolean;
}
