import { supabase } from '../../lib/supabase';
import { calculateCarneLeao, RentalTransaction } from '../../utils/financialCalculations';
import { CarneLeaoReport, CarneLeaoMonth } from '../../types/tax';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const taxService = {
  async getAnnualIncome(ownerId: string, year: number): Promise<number> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('paid_date', startDate)
      .lte('paid_date', endDate);

    if (error) throw error;
    return (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  },

  async getYearlyDeductions(ownerId: string, year: number): Promise<number> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('owner_id', ownerId)
      .eq('type', 'expense')
      .in('category', ['IPTU', 'Condomínio', 'Taxa de Administração'])
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return (data ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
  },

  async generateCarneLeaoReport(
    ownerId: string,
    year: number,
    dependents = 0
  ): Promise<CarneLeaoReport> {
    const monthlyBreakdown: CarneLeaoMonth[] = [];

    let totalBrutoAnual = 0;
    let totalDeducoesAnuais = 0;

    for (let month = 1; month <= 12; month++) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate =
        month === 12 ? `${year}-12-31` : `${year}-${String(month + 1).padStart(2, '0')}-01`;

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('paid_date', startDate)
        .lt('paid_date', endDate);

      const valorBruto = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

      const { data: expenses } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('owner_id', ownerId)
        .eq('type', 'expense')
        .in('category', ['IPTU', 'Condomínio', 'Taxa de Administração'])
        .gte('date', startDate)
        .lt('date', endDate);

      const deducoes = (expenses ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

      const transaction: RentalTransaction = {
        valor_bruto: valorBruto,
        data_recebimento: startDate,
        deducoes: { iptu: deducoes, condominio: 0, taxa_administracao: 0 },
        dependentes: dependents,
      };

      const result = calculateCarneLeao([transaction]);

      totalBrutoAnual += valorBruto;
      totalDeducoesAnuais += deducoes;

      monthlyBreakdown.push({
        month: MONTHS[month - 1],
        monthNumber: month,
        valorBruto,
        deducoes,
        tributavel: result.totalTributavel,
        imposto: result.impostoDevido,
      });
    }

    const annualTransaction: RentalTransaction = {
      valor_bruto: totalBrutoAnual,
      data_recebimento: `${year}-01-01`,
      deducoes: { iptu: totalDeducoesAnuais, condominio: 0, taxa_administracao: 0 },
      dependentes: dependents,
    };

    const annualResult = calculateCarneLeao([annualTransaction]);

    return {
      year,
      totalBruto: totalBrutoAnual,
      totalDeducoes: totalDeducoesAnuais,
      totalTributavel: annualResult.totalTributavel,
      aliquota: annualResult.aliquota,
      impostoDevido: annualResult.impostoDevido,
      faixa: annualResult.faixa,
      monthlyBreakdown,
    };
  },

  generateDimobCsv(data: CarneLeaoReport, ownerCpf: string, ownerName: string): string {
    const header =
      'CPF_Locador;Nome_Locador;Valor_Bruto_Mes;Valor_Deducoes;Base_Calculo;Imposto_Devido';
    const rows = data.monthlyBreakdown.map(
      (m) =>
        `${ownerCpf};${ownerName};${m.valorBruto.toFixed(2)};${m.deducoes.toFixed(2)};${m.tributavel.toFixed(2)};${m.imposto.toFixed(2)}`
    );
    return [header, ...rows].join('\n');
  },

  downloadCsv(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
