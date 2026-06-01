export const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const getRemainingContractTime = (endDateStr: string): string => {
  if (!endDateStr) return '';
  
  // Try direct parsing first
  let dateParsed = new Date(endDateStr);
  
  // If invalid and contains slashes, reverse DD/MM/YYYY to YYYY-MM-DD
  if (isNaN(dateParsed.getTime()) && endDateStr.includes('/')) {
    dateParsed = new Date(endDateStr.split('/').reverse().join('-'));
  }
  
  if (isNaN(dateParsed.getTime())) return '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = dateParsed.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Vencido';
  if (diffDays === 0) return 'Vence hoje';
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths >= 1) {
    return `Restam ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
  }
  return `Restam ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

export const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatCEP = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

export const formatRG = (value: string) => {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '').substring(0, 15);
};

