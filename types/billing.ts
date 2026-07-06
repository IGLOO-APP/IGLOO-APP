export interface BillingReminder {
  id: string;
  contract_id: string;
  owner_id: string;
  due_date: string;
  amount: number;
  reminder_type: 'due_soon' | 'overdue_1' | 'overdue_5' | 'overdue_15' | 'overdue_30';
  channel: 'whatsapp' | 'email' | 'sms';
  status: 'sent' | 'failed' | 'scheduled';
  sent_at?: string;
  created_at?: string;
}

export interface BillingStatus {
  contract_id: string;
  tenant_name: string;
  property_name: string;
  due_date: string;
  amount: number;
  days_overdue: number;
  last_reminder_sent?: string;
  last_reminder_type?: string;
  reminders_count: number;
  status: 'em_dia' | 'vencendo' | 'atrasado' | 'critico';
}
