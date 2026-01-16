export const KITNET_CONTRACT_TEMPLATE = `
CONTRATO DE LOCAÇÃO RESIDENCIAL (MODELO KITNET/STUDIO)

IDENTIFICAÇÃO DAS PARTES

LOCADOR: {{nome_proprietario}}, inscrito no CPF sob o nº {{cpf_proprietario}}, residente e domiciliado em {{endereco_proprietario}}.

LOCATÁRIO: {{nome_inquilino}}, inscrito no CPF sob o nº {{cpf_inquilino}}, profissão {{profissao_inquilino}}, e-mail {{email_inquilino}}.

CLÁUSULA PRIMEIRA - DO OBJETO
O presente contrato tem como objeto a locação do imóvel residencial tipo "Kitnet/Studio", situado na {{endereco_imovel}}, unidade nº {{numero_unidade}}.
Parágrafo Único: O imóvel destina-se EXCLUSIVAMENTE para fins residenciais do LOCATÁRIO, sendo vedada a sublocação, cessão ou empréstimo, total ou parcial, inclusive através de plataformas de hospedagem (ex: Airbnb), sem prévia autorização por escrito do LOCADOR. A ocupação máxima permitida é de {{ocupacao_maxima}} pessoa(s), visando evitar a superlotação característica deste tipo de imóvel.

CLÁUSULA SEGUNDA - DO PRAZO
O prazo de locação é de 30 (trinta) meses, iniciando-se em {{data_inicio}} e terminando em {{data_fim}}.
Parágrafo Primeiro: Fica acordado que, após 12 (doze) meses de vigência, o LOCATÁRIO poderá rescindir o contrato sem o pagamento de multa contratual, desde que notifique o LOCADOR com antecedência mínima de 30 (trinta) dias.

CLÁUSULA TERCEIRA - DO ALUGUEL E ENCARGOS
O aluguel mensal será de R$ {{valor_aluguel}}, devendo ser pago até o dia {{dia_vencimento}} de cada mês.
Parágrafo Primeiro: Além do aluguel, o LOCATÁRIO arcará com as despesas de:
a) Taxa de Condomínio/Rateio de Despesas: R$ {{valor_condominio}};
b) IPTU (parcela mensal): R$ {{valor_iptu}};
c) Consumo de energia elétrica e água (caso não inclusos no rateio).

CLÁUSULA QUARTA - DA GARANTIA (CAUÇÃO)
Como garantia das obrigações assumidas neste contrato, o LOCATÁRIO entrega ao LOCADOR a importância de R$ {{valor_caucao}}, equivalente a 3 (três) meses de aluguel, em moeda corrente/transferência bancária.
Parágrafo Único: Este valor será devolvido ao final da locação, devidamente corrigido pelo índice da poupança, após a vistoria de entrega das chaves e comprovação de quitação de todos os débitos.

CLÁUSULA QUINTA - DA RESCISÃO IMEDIATA E DESPEJO
Constituem motivos para rescisão imediata deste contrato, sem prejuízo da multa cabível e ação de despejo:
a) O atraso no pagamento do aluguel por período superior ao permitido em lei;
b) A prática de infrações legais ou crimes no interior do imóvel, notadamente o uso ou tráfico de entorpecentes;
c) O desrespeito reiterado às normas de convivência e do silêncio, perturbando o sossego dos vizinhos;
d) A realização de obras ou modificações na estrutura do imóvel sem autorização.

CLÁUSULA SEXTA - DO REGIMENTO INTERNO
O LOCATÁRIO declara ter recebido, lido e concordado com o "Regimento Interno Simplificado", anexo a este contrato, comprometendo-se a cumpri-lo integralmente.

E, por estarem justos e contratados, assinam o presente instrumento em 02 (duas) vias de igual teor.

{{cidade_contrato}}, {{data_hoje}}.

__________________________________________
LOCADOR

__________________________________________
LOCATÁRIO
`;

export const KITNET_RULES_TEMPLATE = `
ANEXO I - REGIMENTO INTERNO SIMPLIFICADO
CONDOMÍNIO DE KITNETS E ESTÚDIOS

Visando a harmonia, segurança e boa convivência entre todos os moradores, ficam estabelecidas as seguintes regras:

1. LEI DO SILÊNCIO E RUÍDOS
Devido às características construtivas (paredes compartilhadas), o silêncio é fundamental.
- É proibido som alto, gritaria ou barulhos excessivos a qualquer hora do dia.
- O "Horário de Silêncio Rigoroso" é das 22h00 às 08h00.
- O uso de instrumentos musicais ou aparelhos sonoros deve ser feito com fones de ouvido ou volume ambiente contido.

2. VISITANTES E PERNOITES
- O imóvel é dimensionado para a moradia do titular do contrato.
- Visitas são permitidas, porém, pernoites frequentes de terceiros (mais de 3 vezes na semana) caracterizam coabitação não autorizada e podem gerar revisão do valor de rateio de água/luz ou multa contratual.
- O morador é integralmente responsável pelos atos de seus visitantes nas áreas comuns.

3. ÁREAS COMUNS E LAVANDERIA (SE HOUVER)
- Não é permitido deixar objetos pessoais (sapatos, lixo, móveis) nos corredores ou escadas.
- Caso haja lavanderia coletiva: respeitar a escala de uso ou o tempo da máquina. Retirar as roupas imediatamente após o ciclo. Manter o local limpo.
- Varal: É proibido estender roupas nas janelas da fachada ou em corredores de circulação.

4. LIXO E LIMPEZA
- O lixo deve ser devidamente ensacado e depositado EXCLUSIVAMENTE nas lixeiras externas ou local indicado nos dias de coleta.
- Não é permitido colocar sacos de lixo na porta da unidade "para levar depois".

5. PROIBIÇÃO DE FUMAR
- É estritamente proibido fumar nos corredores, escadas e áreas fechadas de uso comum.
- Recomenda-se não fumar dentro das unidades para evitar impregnar as paredes e móveis (caso mobiliado), o que poderá gerar custos extras de pintura na devolução do imóvel.

6. SEGURANÇA
- Manter o portão de acesso principal sempre fechado.
- Não facilitar a entrada de estranhos ou entregadores sem identificação prévia.

O descumprimento destas normas acarretará em advertência e, em caso de reincidência, multa equivalente a 10% do valor do aluguel, podendo levar à rescisão contratual por conduta antissocial.

Ciente e de acordo:

____________________
Assinatura do Morador
`;