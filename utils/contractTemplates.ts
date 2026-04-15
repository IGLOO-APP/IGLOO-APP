export const KITNET_CONTRACT_TEMPLATE = `INSTRUMENTO PARTICULAR DE CONTRATO DE LOCAÇÃO RESIDENCIAL

Pelo presente instrumento particular, de um lado:

LOCADOR(A): {{nome_proprietario}}, inscrito(a) no CPF sob o nº {{cpf_proprietario}}, residente e domiciliado(a) em {{endereco_proprietario}}, doravante denominado simplesmente LOCADOR.

E de outro lado:

LOCATÁRIO(A): {{nome_inquilino}}, inscrito(a) no CPF sob o nº {{cpf_inquilino}}, doravante denominado simplesmente LOCATÁRIO.

As partes acima qualificadas têm entre si, justo e contratado, o presente contrato de locação, que se regerá pela Lei nº 8.245/91 (Lei do Inquilinato) e pelas cláusulas e condições seguintes:

CLÁUSULA PRIMEIRA - DO OBJETO
O imóvel objeto desta locação é o imóvel residencial situado na {{endereco_imovel}}, na cidade de {{cidade_contrato}}. O imóvel é entregue em perfeitas condições de uso, conforme Laudo de Vistoria que passa a ser parte integrante deste contrato.

CLÁUSULA SEGUNDA - DA VIGÊNCIA E PRAZO
A locação terá a duração de {{duracao_meses}} meses, com início em {{data_inicio}} e término previsto para {{data_fim}}.
Parágrafo Único: Findo o prazo ajustado, se o LOCATÁRIO permanecer no imóvel por mais de trinta dias sem oposição do LOCADOR, presumir-se-á prorrogada a locação por tempo indeterminado, mantidas as demais cláusulas deste contrato.

CLÁUSULA TERCEIRA - DOS VALORES E REAJUSTE
O aluguel mensal pactuado é de R$ {{valor_aluguel}}, devendo ser pago até o dia {{dia_vencimento}} de cada mês, via PIX ou boleto bancário conforme orientação do LOCADOR.
Parágrafo Primeiro: O valor do aluguel será reajustado anualmente pela variação positiva do IGP-M/FGV ou, na sua ausência, pelo IPCA/IBGE.
Parágrafo Segundo: O atraso no pagamento acarretará multa moratória de 10% (dez por cento) sobre o valor do débito, acrescido de juros de 1% ao mês.

CLÁUSULA QUARTA - DOS ENCARGOS
Além do aluguel, o LOCATÁRIO é responsável pelo pagamento de:
a) Taxas de condomínio e IPTU ({{valor_condominio}} e {{valor_iptu}});
b) Consumo de energia, água e gás;
c) Seguro contra incêndio do imóvel.

CLÁUSULA QUINTA - DA GARANTIA (CAUÇÃO)
O LOCATÁRIO deposita, neste ato, a título de caução, a importância de R$ {{valor_caucao}}, equivalente a no máximo 03 (três) meses de aluguel.
Parágrafo Único: O valor será devolvido ao final da locação, devidamente corrigido pelos índices da caderneta de poupança, após a vistoria de saída e quitação de todos os débitos.

CLÁUSULA SEXTA - DA MULTA RESCISÓRIA
A infração de qualquer das cláusulas deste contrato sujeitará a parte infratora ao pagamento de multa equivalente a 03 (três) meses de aluguel vigente à época da infração, paga de forma proporcional ao tempo restante do contrato, conforme previsto no Art. 4º da Lei 8.245/91.

CLÁUSULA SÉTIMA - DA DESTINAÇÃO E BENFEITORIAS
O imóvel destina-se exclusivamente para fins residenciais. Qualquer alteração estrutural ou benfeitoria necessita de prévia autorização por escrito do LOCADOR. Benfeitorias úteis ou necessárias não serão indenizáveis, salvo ajuste prévio.

CLÁUSULA OITAVA - DO FORO
As partes elegem o Foro da Comarca de {{cidade_contrato}} para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, renunciando a qualquer outro por mais privilegiado que seja.

E, por estarem assim justos e contratados, as partes assinam o presente contrato.

{{cidade_contrato}}, {{data_hoje}}.

_______________________________________
{{nome_proprietario}} (LOCADOR)

_______________________________________
{{nome_inquilino}} (LOCATÁRIO)
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
