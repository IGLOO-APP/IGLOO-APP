export interface CarneLeaoReport {
  year: number;
  totalBruto: number;
  totalDeducoes: number;
  totalTributavel: number;
  aliquota: number;
  impostoDevido: number;
  faixa: string;
  monthlyBreakdown: CarneLeaoMonth[];
}

export interface CarneLeaoMonth {
  month: string;
  monthNumber: number;
  valorBruto: number;
  deducoes: number;
  tributavel: number;
  imposto: number;
}

export interface DimobRecord {
  cpfCnpjLocador: string;
  nomeLocador: string;
  cpfCnpjLocatario: string;
  nomeLocatario: string;
  tipoImovel: string;
  valorAluguel: number;
  mesReferencia: number;
  anoReferencia: number;
}
