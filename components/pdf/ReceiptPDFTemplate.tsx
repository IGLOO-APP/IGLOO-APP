import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
    color: '#334155',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  logoAccent: {
    color: '#10b981',
  },
  receiptTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  receiptNumber: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 2,
  },
  section: {
    marginBottom: 15,
  },
  statement: {
    fontSize: 10,
    color: '#334155',
    marginBottom: 15,
    textAlign: 'justify',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
  },
  tableColDesc: {
    width: '70%',
    fontSize: 9,
  },
  tableColVal: {
    width: '30%',
    textAlign: 'right',
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  totalLabel: {
    width: '70%',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValue: {
    width: '30%',
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  signatureLine: {
    width: '60%',
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    marginTop: 40,
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#334155',
  },
});

interface ReceiptPDFProps {
  transaction: {
    id: string;
    title: string;
    amount: number;
    date: string;
    category?: string;
    propertyName?: string;
  };
  tenantName?: string;
}

export const ReceiptPDFTemplate: React.FC<ReceiptPDFProps> = ({ transaction, tenantName }) => {
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR');
  const formattedAmount = transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoText}>
              IGLOO<Text style={styles.logoAccent}>.</Text>
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.receiptTitle}>Recibo de Quitação</Text>
              <Text style={styles.receiptNumber}>ID: {transaction.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          {/* Statement */}
          <View style={styles.section}>
            <Text style={styles.statement}>
              Declaramos para os devidos fins que recebemos de {tenantName || 'Inquilino registrado'}, a importância de R$ {formattedAmount} referente ao pagamento de &quot;{transaction.title}&quot; para o imóvel {transaction.propertyName || 'Imóvel Cadastrado'}, liquidado com sucesso na data de {formattedDate}.
            </Text>
          </View>

          {/* Breakdown Table */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableColDesc}>Item / Discriminação</Text>
              <Text style={styles.tableColVal}>Valor</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableColDesc}>{transaction.title || 'Aluguel Mensal'}</Text>
              <Text style={styles.tableColVal}>R$ {formattedAmount}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Pago</Text>
              <Text style={styles.totalValue}>R$ {formattedAmount}</Text>
            </View>
          </View>

          {/* Assinatura */}
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Investidor Exemplo</Text>
            <Text style={{ fontSize: 7, color: '#64748b' }}>LOCADOR</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Comprovante emitido eletronicamente via IGLOO Property Manager</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
