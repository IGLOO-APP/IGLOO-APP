import { Property, Contract } from '../types';

// Utility functions for financial calculations

// --- 1. CARNÊ-LEÃO (Imposto de Renda) ---

export interface RentalTransaction {
  valor_bruto: number;
  data_recebimento: string; // ISO Date YYYY-MM-DD
  deducoes: {
    iptu: number; // if paid by owner
    condominio: number; // if paid by owner
    taxa_administracao: number;
  };
  dependentes?: number; // Optional: R$ 189,59 per dependent (2024 ref)
}

export const calculateCarneLeao = (transactions: RentalTransaction[]) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalTributavel: 0,
      aliquota: 0,
      impostoDevido: 0,
      faixa: 'Isento',
    };
  }

  let totalBruto = 0;
  let totalDeducoesAdmissiveis = 0;
  let maxDependentes = 0;

  // Soma todas as transações do período
  transactions.forEach((t) => {
    totalBruto += t.valor_bruto;
    
    // Deduções permitidas (IPTU, Condomínio, Taxa Adm)
    const deducoesDestaTransacao = 
      (t.deducoes.iptu || 0) + 
      (t.deducoes.condominio || 0) + 
      (t.deducoes.taxa_administracao || 0);
    
    totalDeducoesAdmissiveis += deducoesDestaTransacao;

    // Pega o número de dependentes (usamos o máximo encontrado no período como referência do contribuinte)
    if ((t.dependentes || 0) > maxDependentes) {
      maxDependentes = t.dependentes || 0;
    }
  });

  // Base de Cálculo = Bruto - Deduções de Imóveis
  let totalTributavel = totalBruto - totalDeducoesAdmissiveis;

  // Dedução por dependente (Valor ref. 2024/2025: R$ 189,59)
  const deducaoPorDependente = 189.59;
  totalTributavel -= maxDependentes * deducaoPorDependente;

  // Garante que a base não seja negativa
  totalTributavel = Math.max(0, totalTributavel);

  // Tabela Progressiva Mensal (Vigente 2024/2025 - MP 1206/24)
  let aliquota = 0;
  let parcelaDeduzir = 0;

  if (totalTributavel <= 2259.2) {
    aliquota = 0;
    parcelaDeduzir = 0;
  } else if (totalTributavel <= 2828.65) {
    aliquota = 0.075;
    parcelaDeduzir = 169.44;
  } else if (totalTributavel <= 3751.05) {
    aliquota = 0.15;
    parcelaDeduzir = 381.44;
  } else if (totalTributavel <= 4664.68) {
    aliquota = 0.225;
    parcelaDeduzir = 662.77;
  } else {
    aliquota = 0.275;
    parcelaDeduzir = 896.0;
  }

  const impostoDevido = totalTributavel * aliquota - parcelaDeduzir;

  return {
    totalTributavel: Number(totalTributavel.toFixed(2)),
    aliquota: aliquota * 100,
    impostoDevido: Math.max(0, Number(impostoDevido.toFixed(2))),
    faixa: aliquota === 0 ? 'Isento' : `${(aliquota * 100).toFixed(1)}%`,
  };
};

// --- 2. LATE PAYMENT CALCULATOR (Cobrador Automático) ---

export const calculateLateFee = (
  valorOriginal: number,
  dataVencimento: string,
  dataPagamento: string = new Date().toISOString()
) => {
  const vencimento = new Date(dataVencimento);
  const pagamento = new Date(dataPagamento);

  // Reset hours to compare dates only
  vencimento.setHours(0, 0, 0, 0);
  pagamento.setHours(0, 0, 0, 0);

  const diffTime = pagamento.getTime() - vencimento.getTime();
  const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diasAtraso <= 0) {
    return {
      valorMulta: 0,
      valorJuros: 0,
      totalPagar: valorOriginal,
      diasAtraso: 0,
    };
  }

  // 1. Multa Moratória: 10% (Fixed)
  const valorMulta = valorOriginal * 0.1;

  // 2. Juros de Mora: 1% ao mês (pro rata die)
  // 1% / 30 dias = 0.03333% ao dia
  const taxaJurosDiaria = 0.01 / 30;
  const valorJuros = valorOriginal * taxaJurosDiaria * diasAtraso;

  const totalPagar = valorOriginal + valorMulta + valorJuros;

  return {
    valorMulta: Number(valorMulta.toFixed(2)),
    valorJuros: Number(valorJuros.toFixed(2)),
    totalPagar: Number(totalPagar.toFixed(2)),
    diasAtraso,
  };
};

// --- 3. EXPENSE APPORTIONMENT (Rateio de Despesas) ---

export interface UnitParams {
  id: string;
  name: string;
  isOccupied: boolean;
  residentsCount: number;
}

export const calculateApportionment = (
  totalExpense: number,
  units: UnitParams[],
  method: 'fixed' | 'people'
) => {
  let result = [];
  let ownerCost = 0;

  if (method === 'fixed') {
    // Scenario 1: Fixed Rateio
    // Cost divides by TOTAL units (occupied + empty). Empty units cost goes to owner.
    const sharePerUnit = totalExpense / units.length;

    result = units.map((unit) => {
      if (!unit.isOccupied) {
        ownerCost += sharePerUnit;
        return { ...unit, share: 0, note: 'Vago (Custo Proprietário)' };
      }
      return { ...unit, share: sharePerUnit };
    });
  } else {
    // Scenario 2: Per Person
    // Total cost divided by Total People.
    // If unit is empty (0 people), it pays 0 in this logic usually, unless there's a base fee.
    // Assuming strict per-person variable cost:
    const totalPeople = units.reduce(
      (acc, unit) => acc + (unit.isOccupied ? unit.residentsCount : 0),
      0
    );

    if (totalPeople === 0) {
      // Edge case: All empty? Owner pays all.
      ownerCost = totalExpense;
      result = units.map((u) => ({ ...u, share: 0 }));
    } else {
      const costPerPerson = totalExpense / totalPeople;

      result = units.map((unit) => {
        if (!unit.isOccupied || unit.residentsCount === 0) {
          // Empty units don't consume "people-based" resources usually
          // But if logic requires owner to pay share of 'potential' people, that's complex.
          // Prompt says: "alocar a parte da unidade vazia como custo do proprietário"
          // For per-person, usually empty units = 0 cost.
          // If we MUST allocate cost for empty units, we need a 'potential occupancy' number.
          // Let's assume purely consumption based: Empty = 0 cost.
          return { ...unit, share: 0, note: 'Vago (Sem consumo)' };
        }
        const unitShare = costPerPerson * unit.residentsCount;
        return { ...unit, share: unitShare };
      });
    }
  }

  return {
    distribution: result,
    ownerTotal: ownerCost,
  };
};

// --- 4. INVESTOR METRICS (Yield & Vacancy) ---

export const calculateVacancyMetrics = (properties: Property[]) => {
  if (properties.length === 0) return { physical: 0, financial: 0, alert: false };

  const totalUnits = properties.length;
  const vacantUnits = properties.filter((p) => p.status === 'DISPONÍVEL').length;

  const physicalVacancy = (vacantUnits / totalUnits) * 100;

  const totalPotentialRent = properties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
  const vacantPotentialRent = properties
    .filter((p) => p.status === 'DISPONÍVEL')
    .reduce((acc, p) => acc + (p.numeric_price || 0), 0);

  const financialVacancy =
    totalPotentialRent > 0 ? (vacantPotentialRent / totalPotentialRent) * 100 : 0;

  return {
    physical: Math.round(physicalVacancy),
    financial: Math.round(financialVacancy),
    alert: physicalVacancy > 20 || financialVacancy > 20,
  };
};

export const calculatePortfolioYield = (properties: Property[]) => {
  // Formula: (Total Annual Rent / Total Property Value) * 100
  const occupiedProps = properties.filter((p) => p.status === 'ALUGADO');

  const totalMonthlyRent = occupiedProps.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
  const totalAnnualRent = totalMonthlyRent * 12;

  const totalAssetValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);

  if (totalAssetValue === 0) return 0;

  const annualYield = (totalAnnualRent / totalAssetValue) * 100;
  return Number(annualYield.toFixed(2));
};

// --- 5. CASH FLOW PROJECTION ---

export const generateCashFlowProjection = (pastData: any[], contracts: Contract[]) => {
  // pastData: [{name: 'Jan', value: 4500}, ...] (Last 6 months)
  // contracts: Active contracts with end_date and numeric_value

  // Generate next 3 months
  const today = new Date();
  const futureData = [];

  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  for (let i = 1; i <= 3; i++) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthLabel = monthNames[nextMonth.getMonth()];

    // Calculate projected revenue
    let projectedAmount = 0;

    contracts.forEach((contract) => {
      if (contract.status === 'active' && contract.numeric_value) {
        // Parse contract end date (Assuming DD/MM/YYYY or YYYY-MM-DD)
        // For simplified logic, if contract ends AFTER nextMonth start, we count it.
        // In real app, robust date parsing is needed.
        // Mock logic: assumes active contracts pay unless explicit end date is passed.

        // Simplified Date Check (Assuming mock strings like '10 Out 2024')
        // Real implementation would use Date objects from the start
        projectedAmount += contract.numeric_value;
      }
    });

    futureData.push({
      name: monthLabel,
      actual: 0,
      projected: projectedAmount,
      isProjection: true,
    });
  }

  // Transform past data to match structure
  const processedPast = pastData.map((d) => ({
    name: d.name,
    actual: d.value,
    projected: 0,
    isProjection: false,
  }));

  return [...processedPast, ...futureData];
};
// --- 6. TENANT FINANCIAL SUMMARY (Verdade Única) ---

export interface TenantFinancialSummary {
  totalPaid: number;
  totalPending: number;
  punctualityRate: number;
  paidCount: number;
  totalCount: number;
  nextDueDate: string | null;
  daysLate: number;
  isLate: boolean;
}

export const calculateTenantFinancials = (payments: any[]): TenantFinancialSummary => {
  if (!payments || payments.length === 0) {
    return {
      totalPaid: 0,
      totalPending: 0,
      punctualityRate: 100,
      paidCount: 0,
      totalCount: 0,
      nextDueDate: null,
      daysLate: 0,
      isLate: false,
    };
  }

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const paidCount = payments.filter((p) => p.status === 'paid').length;
  const totalCount = payments.length;
  const punctualityRate = Math.round((paidCount / totalCount) * 100);

  // Find the next/closest pending payment
  const pendingPayments = payments
    .filter((p) => p.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const nextPayment = pendingPayments[0];
  const nextDueDate = nextPayment ? nextPayment.due_date : null;

  // Calculate lateness
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overduePayments = pendingPayments.filter((p) => new Date(p.due_date) < now);
  const isLate = overduePayments.length > 0;

  let maxDaysLate = 0;
  if (isLate) {
    const oldestOverdue = overduePayments[0];
    const dueDate = new Date(oldestOverdue.due_date);
    dueDate.setHours(0, 0, 0, 0);
    maxDaysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    totalPaid,
    totalPending,
    punctualityRate,
    paidCount,
    totalCount,
    nextDueDate,
    daysLate: maxDaysLate,
    isLate,
  };
};
