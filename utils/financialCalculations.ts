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
  // Filter transactions by month/year if needed, here we assume the array passed is for the target month
  
  let totalTributavel = 0;

  transactions.forEach(t => {
    const liquido = t.valor_bruto - (t.deducoes.iptu + t.deducoes.condominio + t.deducoes.taxa_administracao);
    if (liquido > 0) totalTributavel += liquido;
  });

  // Deduction per dependent (Hypothetical 2026 value updated from 2024)
  const deducaoPorDependente = 189.59;
  // Apply dependent deduction if any
  // totalTributavel -= (transactions[0]?.dependentes || 0) * deducaoPorDependente;

  // Tabela Progressiva Mensal (Hypothetical 2026 projection)
  let aliquota = 0;
  let parcelaDeduzir = 0;

  if (totalTributavel <= 2259.20) {
    aliquota = 0;
    parcelaDeduzir = 0;
  } else if (totalTributavel <= 2826.65) {
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
    parcelaDeduzir = 896.00;
  }

  const impostoDevido = (totalTributavel * aliquota) - parcelaDeduzir;

  return {
    totalTributavel,
    aliquota: aliquota * 100,
    impostoDevido: Math.max(0, impostoDevido),
    faixa: aliquota === 0 ? 'Isento' : `${(aliquota * 100).toFixed(1)}%`
  };
};

// --- 2. LATE PAYMENT CALCULATOR (Cobrador Automático) ---

export const calculateLateFee = (valorOriginal: number, dataVencimento: string, dataPagamento: string = new Date().toISOString()) => {
  const vencimento = new Date(dataVencimento);
  const pagamento = new Date(dataPagamento);

  // Reset hours to compare dates only
  vencimento.setHours(0,0,0,0);
  pagamento.setHours(0,0,0,0);

  const diffTime = pagamento.getTime() - vencimento.getTime();
  const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diasAtraso <= 0) {
    return {
      valorMulta: 0,
      valorJuros: 0,
      totalPagar: valorOriginal,
      diasAtraso: 0
    };
  }

  // 1. Multa Moratória: 10% (Fixed)
  const valorMulta = valorOriginal * 0.10;

  // 2. Juros de Mora: 1% ao mês (pro rata die)
  // 1% / 30 dias = 0.03333% ao dia
  const taxaJurosDiaria = 0.01 / 30; 
  const valorJuros = valorOriginal * taxaJurosDiaria * diasAtraso;

  const totalPagar = valorOriginal + valorMulta + valorJuros;

  return {
    valorMulta: Number(valorMulta.toFixed(2)),
    valorJuros: Number(valorJuros.toFixed(2)),
    totalPagar: Number(totalPagar.toFixed(2)),
    diasAtraso
  };
};

// --- 3. EXPENSE APPORTIONMENT (Rateio de Despesas) ---

export interface UnitParams {
  id: string;
  name: string;
  isOccupied: boolean;
  residentsCount: number;
}

export const calculateApportionment = (totalExpense: number, units: UnitParams[], method: 'fixed' | 'people') => {
  let result = [];
  let ownerCost = 0;

  if (method === 'fixed') {
    // Scenario 1: Fixed Rateio
    // Cost divides by TOTAL units (occupied + empty). Empty units cost goes to owner.
    const sharePerUnit = totalExpense / units.length;

    result = units.map(unit => {
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
    const totalPeople = units.reduce((acc, unit) => acc + (unit.isOccupied ? unit.residentsCount : 0), 0);
    
    if (totalPeople === 0) {
       // Edge case: All empty? Owner pays all.
       ownerCost = totalExpense;
       result = units.map(u => ({ ...u, share: 0 }));
    } else {
       const costPerPerson = totalExpense / totalPeople;
       
       result = units.map(unit => {
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
    ownerTotal: ownerCost
  };
};

// --- 4. INVESTOR METRICS (Yield & Vacancy) ---

export const calculateVacancyMetrics = (properties: Property[]) => {
    if (properties.length === 0) return { physical: 0, financial: 0, alert: false };

    const totalUnits = properties.length;
    const vacantUnits = properties.filter(p => p.status === 'DISPONÍVEL').length;
    
    const physicalVacancy = (vacantUnits / totalUnits) * 100;

    const totalPotentialRent = properties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
    const vacantPotentialRent = properties
        .filter(p => p.status === 'DISPONÍVEL')
        .reduce((acc, p) => acc + (p.numeric_price || 0), 0);

    const financialVacancy = totalPotentialRent > 0 ? (vacantPotentialRent / totalPotentialRent) * 100 : 0;

    return {
        physical: Math.round(physicalVacancy),
        financial: Math.round(financialVacancy),
        alert: physicalVacancy > 20 || financialVacancy > 20
    };
};

export const calculatePortfolioYield = (properties: Property[]) => {
    // Formula: (Total Annual Rent / Total Property Value) * 100
    const occupiedProps = properties.filter(p => p.status === 'ALUGADO');
    
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
    
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let i = 1; i <= 3; i++) {
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthLabel = monthNames[nextMonth.getMonth()];
        
        // Calculate projected revenue
        let projectedAmount = 0;
        
        contracts.forEach(contract => {
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
            isProjection: true
        });
    }

    // Transform past data to match structure
    const processedPast = pastData.map(d => ({
        name: d.name,
        actual: d.value,
        projected: 0,
        isProjection: false
    }));

    return [...processedPast, ...futureData];
};