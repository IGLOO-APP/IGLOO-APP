export interface PropertyUnit {
  id: string;
  property_id: string;
  name: string;
  is_occupied: boolean;
  current_tenant_id?: string;
  residents_count: number;
  water_meter_initial?: number;
  electricity_meter_initial?: number;
  created_at?: string;
}

export interface UtilityBill {
  id: string;
  property_id: string;
  owner_id: string;
  bill_type: 'water' | 'electricity' | 'gas';
  total_amount: number;
  bill_date: string;
  due_date?: string;
  provider?: string;
  document_url?: string;
  apportionment_method: 'fixed' | 'people';
  notes?: string;
  units?: UtilityBillUnit[];
  created_at?: string;
}

export interface UtilityBillUnit {
  id: string;
  utility_bill_id: string;
  unit_name: string;
  tenant_id?: string;
  share_amount: number;
  is_owner_cost: boolean;
  created_at?: string;
}
