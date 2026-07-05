import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 70,
    paddingHorizontal: 50,
    fontSize: 10,
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 8,
    color: '#64748b',
  },
  metaSection: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaCol: {
    width: '50%',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 7,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    color: '#0f172a',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 16,
  },
  contractBody: {
    marginTop: 4,
  },
  paragraph: {
    fontSize: 9.5,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'justify',
    lineHeight: 1.6,
  },
  // Dedicated styles for the Isolated Signature Page
  signaturePage: {
    paddingTop: 60,
    paddingBottom: 70,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  sigTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8,
  },
  sigSubtitle: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 40,
    lineHeight: 1.5,
  },
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sigCol: {
    width: '46%',
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: '#a1a1aa',
    width: '100%',
    marginBottom: 8,
    marginTop: 10,
  },
  sigName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#18181b',
    marginBottom: 2,
  },
  sigRole: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sigMeta: {
    fontSize: 7.5,
    color: '#71717a',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94a3b8',
  },
});

interface ContractPDFProps {
  data: {
    property?: string;
    tenantName?: string;
    tenantCpf?: string;
    startDate?: string;
    duration?: string;
    rentValue?: string | number;
    depositValue?: string | number;
    hasMaintenanceFee?: boolean;
    maintenanceFee?: string | number;
    earlyTerminationFee?: string;
    lockInPeriod?: string;
    propertyName?: string;
    propertyAddress?: string;
    contractText?: string;
    landlordName?: string;
    tenantEmail?: string;
  };
}

const safeNum = (val: string | number | undefined): number =>
  Number(String(val ?? '0').replace(/[^\d.]/g, '')) || 0;

const formatBRL = (val: string | number | undefined): string =>
  `R$ ${safeNum(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ContractPDFTemplate: React.FC<ContractPDFProps> = ({ data }) => {
  const startStr = data.startDate
    ? new Date(data.startDate).toLocaleDateString('pt-BR')
    : '___/___/______';

  const endStr = (() => {
    if (!data.startDate || !data.duration) return '___/___/______';
    const date = new Date(data.startDate);
    date.setMonth(date.getMonth() + parseInt(data.duration));
    return date.toLocaleDateString('pt-BR');
  })();

  const paragraphs: string[] = (data.contractText ?? '').split('\n');

  return (
    <Document>
      {/* SEÇÃO 1: CORPO COMPLETO DO CONTRATO */}
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Contrato de Locação Residencial</Text>
          <Text style={styles.subtitle}>Gerado eletronicamente via IGLOO Property Manager</Text>
        </View>

        {/* Summary metadata block */}
        <View style={styles.metaSection}>
          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Imóvel</Text>
              <Text style={styles.metaValue}>
                {data.propertyName || data.property || '________________________'}
              </Text>
              <Text style={[styles.metaValue, { fontSize: 8, color: '#64748b' }]}>
                {data.propertyAddress || '________________________'}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Locatário</Text>
              <Text style={styles.metaValue}>{data.tenantName || '________________________'}</Text>
              <Text style={[styles.metaValue, { fontSize: 8, color: '#64748b' }]}>
                CPF: {data.tenantCpf || '___.___.___-__'}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Aluguel Mensal</Text>
              <Text style={styles.metaValue}>{formatBRL(data.rentValue)}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Garantia (Caução)</Text>
              <Text style={styles.metaValue}>{formatBRL(data.depositValue)}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Início</Text>
              <Text style={styles.metaValue}>{startStr}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Término</Text>
              <Text style={styles.metaValue}>{endStr}</Text>
            </View>
            {data.hasMaintenanceFee && data.maintenanceFee && (
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Taxa de Rateio Fixa</Text>
                <Text style={styles.metaValue}>{formatBRL(data.maintenanceFee)} / mês</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Full contract body from the Step 5 editor */}
        <View style={styles.contractBody}>
          {paragraphs.length > 0 && paragraphs[0] !== '' ? (
            paragraphs.map((line, index) => (
              <Text key={index} style={styles.paragraph}>
                {line}
              </Text>
            ))
          ) : (
            <Text style={styles.paragraph}>
              O texto do contrato será exibido aqui após a edição da minuta no Passo 5.
            </Text>
          )}
        </View>

        {/* Footer for Page 1 */}
        <View style={styles.footer} fixed>
          <Text>IGLOO – Plataforma Integrada de Gestão de Aluguel</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      {/* SEÇÃO 2: FOLHA DE ASSINATURA ISOLADA */}
      <Page size='A4' style={styles.signaturePage}>
        <Text style={styles.sigTitle}>LOG DE ASSINATURAS E CONFORMIDADE ELETRÔNICA</Text>
        <Text style={styles.sigSubtitle}>
          Este documento foi gerado e assinado digitalmente em conformidade com as diretrizes e
          legislação do ecossistema de assinatura eletrônica IGLOO.
        </Text>

        <View style={styles.sigRow}>
          {/* Coluna LOCADOR */}
          <View style={styles.sigCol}>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{data.landlordName || 'Investidor Exemplo'}</Text>
            <Text style={styles.sigRole}>LOCADOR</Text>
            <Text style={styles.sigMeta}>Assinado eletronicamente como LOCADOR</Text>
            <Text style={styles.sigMeta}>IP de Origem: 186.230.122.45</Text>
            <Text style={styles.sigMeta}>Data/Hora: {startStr} às 14:30 BRT</Text>
            <Text style={styles.sigMeta}>Status: Documento Finalizado</Text>
          </View>

          {/* Coluna LOCATÁRIO */}
          <View style={styles.sigCol}>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{data.tenantName || '________________________'}</Text>
            <Text style={styles.sigRole}>LOCATÁRIO</Text>
            <Text style={styles.sigMeta}>Assinado eletronicamente como LOCATÁRIO</Text>
            <Text style={styles.sigMeta}>CPF: {data.tenantCpf || '___.___.___-__'}</Text>
            <Text style={styles.sigMeta}>
              E-mail:{' '}
              {data.tenantEmail ||
                (data.tenantName
                  ? `${data.tenantName.toLowerCase().replace(/\s+/g, '')}@exemplo.com`
                  : '________________________')}
            </Text>
            <Text style={styles.sigMeta}>Status: Assinatura Confirmada</Text>
          </View>
        </View>

        {/* Footer for Signature Page */}
        <View style={styles.footer} fixed>
          <Text>IGLOO – Plataforma Integrada de Gestão de Aluguel</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
