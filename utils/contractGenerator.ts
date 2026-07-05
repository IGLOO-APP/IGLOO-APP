/**
 * Função para preencher templates de contrato com dados do JSON.
 * Substitui chaves no formato {{chave}} pelos valores correspondentes.
 */

// Helper to resolve nested values (e.g., 'property.name')
const getNestedValue = (obj: Record<string, any>, path: string) => {
  return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateFilledContract = (template: string, data: Record<string, any>): string => {
  const regex = /{{(.*?)}}/g;

  return template.replace(regex, (_, key) => {
    const cleanKey = key.trim();
    const value = getNestedValue(data, cleanKey);

    if (value != null && String(value) !== '') {
      return String(value);
    }

    return '_______________________';
  });
};
