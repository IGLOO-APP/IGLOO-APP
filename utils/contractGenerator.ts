/**
 * Função para preencher templates de contrato com dados do JSON.
 * Substitui chaves no formato {{chave}} pelos valores correspondentes.
 */

// Helper to resolve nested values (e.g., 'property.name')
const getNestedValue = (obj: Record<string, unknown>, path: string) => {
  return path
    .split('.')
    .reduce<unknown>(
      (prev, curr) =>
        prev && typeof prev === 'object' ? (prev as Record<string, unknown>)[curr] : undefined,
      obj
    );
};

export const generateFilledContract = (template: string, data: Record<string, unknown>): string => {
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
