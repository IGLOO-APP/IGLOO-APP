
export const KITNET_CONTRACT_TEMPLATE = `CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL

IDENTIFICAÇÃO DAS PARTES CONTRATANTES

LOCADOR(A): {{nome_proprietario}}, inscrito(a) no CPF sob o nº {{cpf_proprietario}}, residente e domiciliado(a) em {{endereco_proprietario}}.

LOCATÁRIO(A): {{nome_inquilino}}, inscrito(a) no CPF sob o nº {{cpf_inquilino}}, profissão {{profissao_inquilino}}, endereço eletrônico {{email_inquilino}}.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Locação Residencial, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.

CLÁUSULA PRIMEIRA - DO OBJETO DO CONTRATO
O presente contrato tem como OBJETO a locação do imóvel residencial de propriedade do LOCADOR, situado na {{endereco_imovel}}, unidade nº {{numero_unidade}}, na cidade de {{cidade_contrato}}.

Parágrafo Único: O imóvel entregue na data da assinatura deste contrato, pelo LOCADOR ao LOCATÁRIO, possui as características e condições descritas no Laudo de Vistoria de Entrada, anexo a este instrumento, o qual passa a fazer parte integrante do mesmo.

CLÁUSULA SEGUNDA - DA DESTINAÇÃO
A presente locação destina-se EXCLUSIVAMENTE para fins residenciais do LOCATÁRIO e de seu grupo familiar, sendo expressamente vedada a sua sublocação, cessão, empréstimo ou transferência, total ou parcial, a qualquer título, sem prévia e expressa autorização por escrito do LOCADOR. A ocupação máxima permitida é de {{ocupacao_maxima}} pessoa(s), visando a preservação do imóvel.

CLÁUSULA TERCEIRA - DO PRAZO DE VIGÊNCIA
O prazo de locação é de {{duracao_meses}} meses, iniciando-se em {{data_inicio}} e terminando em {{data_fim}}, data em que o imóvel deverá ser devolvido nas condições estipuladas na vistoria de entrada, independentemente de aviso ou notificação judicial ou extrajudicial.

Parágrafo Primeiro: Caso o LOCATÁRIO devolva o imóvel antes do prazo previsto, pagará uma multa contratual proporcional ao tempo restante de contrato, calculada sobre o valor de 03 (três) aluguéis vigentes.

CLÁUSULA QUARTA - DO VALOR DO ALUGUEL E REAJUSTE
O valor mensal da locação é de R$ {{valor_aluguel}}, devendo ser pago pontualmente até o dia {{dia_vencimento}} de cada mês subsequente ao vencido, diretamente ao LOCADOR ou a quem este indicar.

Parágrafo Primeiro: O atraso no pagamento implicará automaticamente na cobrança de multa moratória de 10% (dez por cento) sobre o valor do débito, acrescido de juros de mora de 1% (um por cento) ao mês e correção monetária pelo índice oficial.
Parágrafo Segundo: O valor do aluguel será reajustado anualmente, ou na menor periodicidade permitida por lei, com base na variação acumulada do índice IGP-M/FGV.

CLÁUSULA QUINTA - DOS ENCARGOS E TRIBUTOS
Além do aluguel mensal, caberá ao LOCATÁRIO o pagamento pontual de todos os encargos que recaiam sobre o imóvel, notadamente:
a) Taxa de Condomínio (se houver): {{valor_condominio}}
b) Imposto Predial e Territorial Urbano (IPTU): {{valor_iptu}}
c) Consumo de energia elétrica, água, gás, internet e outras taxas de serviços públicos ou privados contratados.

CLÁUSULA SEXTA - DA GARANTIA LOCATÍCIA (CAUÇÃO)
Para garantia das obrigações assumidas neste contrato, o LOCATÁRIO entrega ao LOCADOR, neste ato, a importância de R$ {{valor_caucao}}, a título de CAUÇÃO.
Parágrafo Único: Este valor será depositado em conta poupança e devolvida ao final da locação, acrescida da correção da poupança, após a devolução das chaves, vistoria de saída aprovada e comprovação de quitação de todos os débitos de aluguel e encargos.

CLÁUSULA SÉTIMA - DA CONSERVAÇÃO E BENFEITORIAS
O LOCATÁRIO obriga-se a manter o imóvel em perfeitas condições de limpeza e conservação. Não poderá realizar obras ou benfeitorias, sejam elas necessárias, úteis ou voluptuárias, sem o consentimento prévio e por escrito do LOCADOR. As benfeitorias autorizadas aderirão ao imóvel, não gerando direito de retenção ou indenização.

CLÁUSULA OITAVA - DA RESCISÃO
Considerar-se-á rescindido o presente contrato, de pleno direito, independentemente de qualquer notificação judicial ou extrajudicial, nos casos de:
a) Infração de qualquer cláusula ou condição deste instrumento;
b) Falta de pagamento do aluguel e encargos;
c) Incêndio, desapropriação ou qualquer outro fato que impeça o uso do imóvel.

CLÁUSULA NONA - DO FORO
Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da comarca de {{cidade_contrato}}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E, por estarem assim justos e contratados, firmam o presente instrumento em 02 (duas) vias de igual teor e forma, na presença de duas testemunhas.

{{cidade_contrato}}, {{data_hoje}}.

________________________________________________
{{nome_proprietario}}
LOCADOR

________________________________________________
{{nome_inquilino}}
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
