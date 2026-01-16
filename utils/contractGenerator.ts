/**
 * Função para preencher templates de contrato com dados do JSON.
 * Substitui chaves no formato {{chave}} pelos valores correspondentes.
 */

export const generateFilledContract = (template: string, data: Record<string, any>): string => {
    // Regex para encontrar padrões {{chave}} globalmente
    const regex = /{{(.*?)}}/g;
  
    return template.replace(regex, (match, key) => {
      // Remove espaços em branco extras da chave (ex: {{ nome }} virar nome)
      const cleanKey = key.trim();
  
      // Verifica se a chave existe no objeto de dados
      const value = data[cleanKey];
  
      // Se o valor existir e não for nulo/undefined, retorna o valor
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
  
      // Tratamento de Erro Suave:
      // Se o dado faltar, retorna uma linha para preenchimento manual em vez de quebrar ou deixar {{...}}
      // Isso permite que o usuário imprima e preencha à mão se necessário.
      return "_______________________"; 
    });
};

export const getMockContractData = () => {
    const today = new Date();
    return {
        nome_proprietario: "Imobiliária Igloo Ltda",
        cpf_proprietario: "12.345.678/0001-90",
        endereco_proprietario: "Av. Paulista, 1000 - SP",
        nome_inquilino: "João da Silva",
        cpf_inquilino: "123.456.789-00",
        profissao_inquilino: "Analista de Sistemas",
        email_inquilino: "joao@email.com",
        endereco_imovel: "Rua Augusta, 150 - Consolação",
        numero_unidade: "Apt 101",
        ocupacao_maxima: "2",
        data_inicio: "10/03/2024",
        data_fim: "10/09/2026",
        valor_aluguel: "1.500,00",
        dia_vencimento: "10",
        valor_condominio: "250,00",
        valor_iptu: "45,00",
        valor_caucao: "4.500,00",
        cidade_contrato: "São Paulo",
        data_hoje: today.toLocaleDateString('pt-BR')
    };
};
