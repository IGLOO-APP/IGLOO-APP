import { supabase } from '../lib/supabase';
import { BillingReminder, BillingStatus } from '../types/billing';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const billingService = {
  async getReminders(contractId: string): Promise<BillingReminder[]> {
    const { data, error } = await (supabase.from as any)('billing_reminders')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as BillingReminder[];
  },

  async logReminder(
    reminder: Omit<BillingReminder, 'id' | 'created_at' | 'sent_at'>
  ): Promise<BillingReminder> {
    const { data, error } = await (supabase.from as any)('billing_reminders')
      .insert({
        ...reminder,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data as BillingReminder;
  },

  async getPendingBilling(ownerId: string): Promise<BillingStatus[]> {
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, monthly_value, payment_day, status')
      .eq('owner_id', ownerId)
      .eq('status', 'active');

    if (contractsError) throw contractsError;
    if (!contracts || contracts.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statusList: BillingStatus[] = [];

    for (const contract of contracts) {
      const dueDate = new Date(today.getFullYear(), today.getMonth(), contract.payment_day ?? 10);
      if (dueDate < new Date(today.getFullYear(), today.getMonth(), 1)) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const { data: reminders } = await (supabase.from as any)('billing_reminders')
        .select('*')
        .eq('contract_id', contract.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastReminder = (reminders as BillingReminder[] | null)?.[0];

      let status: BillingStatus['status'] = 'em_dia';
      if (daysOverdue > 15) status = 'critico';
      else if (daysOverdue > 5) status = 'atrasado';
      else if (daysOverdue > 0) status = 'vencendo';

      statusList.push({
        contract_id: contract.id,
        tenant_name: '',
        property_name: '',
        due_date: dueDate.toISOString().split('T')[0],
        amount: contract.monthly_value,
        days_overdue: Math.max(0, daysOverdue),
        last_reminder_sent: lastReminder?.sent_at,
        last_reminder_type: lastReminder?.reminder_type,
        reminders_count: (reminders as BillingReminder[] | null)?.length ?? 0,
        status,
      });
    }

    return statusList.sort((a, b) => b.days_overdue - a.days_overdue);
  },

  buildWhatsAppMessage(
    daysOverdue: number,
    amount: number,
    tenantName: string,
    pixKey?: string
  ): string {
    if (daysOverdue <= 0) {
      return `Olá ${tenantName}! Lembrete amigável: o aluguel de R$ ${amount.toFixed(2)} vence hoje.`;
    }
    if (daysOverdue <= 5) {
      const multa = amount * 0.1;
      const juros = amount * (0.01 / 30) * daysOverdue;
      const total = amount + multa + juros;
      return `Olá ${tenantName}! O aluguel de R$ ${amount.toFixed(2)} venceu há ${daysOverdue} dia(s). Com multa (10%) e juros, o total é R$ ${total.toFixed(2)}.${pixKey ? ` PIX: ${pixKey}` : ''}`;
    }
    const multa = amount * 0.1;
    const juros = amount * (0.01 / 30) * daysOverdue;
    const total = amount + multa + juros;
    return `Olá ${tenantName}! O aluguel de R$ ${amount.toFixed(2)} está ${daysOverdue} dia(s) atrasado. Total: R$ ${total.toFixed(2)}. Pedimos regularização urgente.${pixKey ? ` PIX: ${pixKey}` : ''}`;
  },

  async getWhatsappLink(contractId: string): Promise<string | null> {
    const { data: contract } = await supabase
      .from('contracts')
      .select('tenant_id, monthly_value')
      .eq('id', contractId)
      .single();
    if (!contract?.tenant_id) return null;

    const { data: tenant } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', contract.tenant_id)
      .single();
    if (!tenant?.phone) return null;

    const phone = (tenant as { phone: string }).phone.replace(/\D/g, '');
    const message = this.buildWhatsAppMessage(0, contract.monthly_value, '', '');
    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  },
};
