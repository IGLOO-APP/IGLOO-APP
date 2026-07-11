import { useState, useEffect } from 'react';
import { Tenant, OwnerPaymentConfig } from '../types';
import { documentService } from '../services/documentService';
import { storageService } from '../services/storageService';
import { profileService } from '../services/profileService';
import { validateCPF } from '../utils/formatters';
import { ownerPaymentConfigService } from '../services/tenancy/ownerPaymentConfigService';

export interface UseOnboardingDocumentsReturn {
  rgFile: File | null;
  incomeFile: File | null;
  residenceFile: File | null;
  guaranteeType: string;
  ownerConfig: OwnerPaymentConfig | null;
  guarantorName: string;
  guarantorCpf: string;
  guarantorRg: string;
  guarantorPhone: string;
  guarantorEmail: string;
  guarantorBirthDate: string;
  guarantorRgFile: File | null;
  guarantorIncomeProofFile: File | null;
  paymentReceiptFile: File | null;
  copiedPix: boolean;
  paymentTabMode: 'pix' | 'bank';
  loading: boolean;
  errorMsg: string | null;

  setRgFile: (f: File | null) => void;
  setIncomeFile: (f: File | null) => void;
  setResidenceFile: (f: File | null) => void;
  setGuaranteeType: (t: string) => void;
  setGuarantorName: (v: string) => void;
  setGuarantorCpf: (v: string) => void;
  setGuarantorRg: (v: string) => void;
  setGuarantorPhone: (v: string) => void;
  setGuarantorEmail: (v: string) => void;
  setGuarantorBirthDate: (v: string) => void;
  setGuarantorRgFile: (f: File | null) => void;
  setGuarantorIncomeProofFile: (f: File | null) => void;
  setPaymentReceiptFile: (f: File | null) => void;
  handleGuarantorCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadDocs: () => Promise<void>;
  setCopiedPix: (v: boolean) => void;
  setPaymentTabMode: (m: 'pix' | 'bank') => void;
  setErrorMsg: (m: string | null) => void;
  setLoading: (v: boolean) => void;
}

export function useOnboardingDocuments(
  tenant: Tenant,
  onStepComplete: () => void
): UseOnboardingDocumentsReturn {
  const [rgFile, setRgFile] = useState<File | null>(null);
  const [incomeFile, setIncomeFile] = useState<File | null>(null);
  const [residenceFile, setResidenceFile] = useState<File | null>(null);
  const [guaranteeType, setGuaranteeType] = useState(tenant.guarantee_type || '');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorCpf, setGuarantorCpf] = useState('');
  const [guarantorRg, setGuarantorRg] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorEmail, setGuarantorEmail] = useState('');
  const [guarantorBirthDate, setGuarantorBirthDate] = useState('');
  const [guarantorRgFile, setGuarantorRgFile] = useState<File | null>(null);
  const [guarantorIncomeProofFile, setGuarantorIncomeProofFile] = useState<File | null>(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
  const [ownerConfig, setOwnerConfig] = useState<OwnerPaymentConfig | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [paymentTabMode, setPaymentTabMode] = useState<'pix' | 'bank'>('pix');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerConfig) {
      ownerPaymentConfigService.getByTenantContract(tenant.id).then((cfg) => {
        setOwnerConfig(cfg);
        if (cfg && !guaranteeType) {
          const hasDeposit = cfg.accepts_deposit && (cfg.pix_enabled || cfg.bank_transfer_enabled);
          const hasGuarantor = cfg.accepts_guarantor;
          if (hasDeposit && !hasGuarantor) setGuaranteeType('deposito_caucao');
          else if (!hasDeposit && hasGuarantor) setGuaranteeType('fiador');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.id, ownerConfig]);

  const handleGuarantorCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setGuarantorCpf(value);
  };

  const handleUploadDocs = async () => {
    if (!rgFile || !incomeFile) {
      setErrorMsg('Por favor, selecione ambos os arquivos de documentos.');
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    const filesToCheck = [
      rgFile,
      incomeFile,
      residenceFile,
      paymentReceiptFile,
      guarantorRgFile,
      guarantorIncomeProofFile,
    ].filter(Boolean) as File[];
    for (const f of filesToCheck) {
      if (f.size > maxSize) {
        setErrorMsg(`O arquivo "${f.name}" excede o limite de 10MB.`);
        return;
      }
    }
    if (!guaranteeType) {
      setErrorMsg('Por favor, selecione a modalidade de garantia.');
      return;
    }
    if (guaranteeType === 'deposito_caucao' && !paymentReceiptFile) {
      setErrorMsg('Por favor, envie o comprovante de pagamento do depósito.');
      return;
    }
    if (guaranteeType === 'fiador') {
      if (!guarantorName.trim()) {
        setErrorMsg('Por favor, preencha o nome do fiador.');
        return;
      }
      if (!guarantorBirthDate.trim()) {
        setErrorMsg('Por favor, preencha a data de nascimento do fiador.');
        return;
      }
      const cpfDigits = guarantorCpf.replace(/\D/g, '');
      if (cpfDigits.length < 11 || !validateCPF(guarantorCpf)) {
        setErrorMsg('CPF do fiador inválido. Verifique os dígitos.');
        return;
      }
      if (!guarantorRg.trim()) {
        setErrorMsg('Por favor, preencha o RG do fiador.');
        return;
      }
      if (!guarantorRgFile) {
        setErrorMsg('Por favor, envie o RG do fiador.');
        return;
      }
      if (!guarantorIncomeProofFile) {
        setErrorMsg('Por favor, envie o comprovante de renda do fiador.');
        return;
      }
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const timestamp = Date.now();
      const rgPath = `${tenant.id}/${timestamp}_rg_${rgFile.name}`;
      const incPath = `${tenant.id}/${timestamp}_income_${incomeFile.name}`;
      const uploads = [
        storageService.uploadFile('tenant-documents', rgPath, rgFile),
        storageService.uploadFile('tenant-documents', incPath, incomeFile),
      ];
      if (residenceFile) {
        const resPath = `${tenant.id}/${timestamp}_residence_${residenceFile.name}`;
        uploads.push(storageService.uploadFile('tenant-documents', resPath, residenceFile));
      }
      const [rgUrl, incomeUrl, resUrl] = await Promise.all(uploads);
      if (!rgUrl || !incomeUrl) throw new Error('Falha no upload para o storage.');
      const docUrls: Record<string, string> = {
        rg_name: rgFile.name,
        rg_url: rgUrl,
        income_name: incomeFile.name,
        income_url: incomeUrl,
      };
      if (residenceFile && resUrl) {
        docUrls.residence_name = residenceFile.name;
        docUrls.residence_url = resUrl;
      }
      await profileService.update(tenant.id, {
        onboarding_documents_status: 'submitted',
        onboarding_documents_urls: docUrls,
        guarantee_type: guaranteeType,
      });
      const isValidUUID = (val: unknown): boolean => {
        if (!val || typeof val !== 'string') return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      };
      if (tenant.property_id && isValidUUID(tenant.property_id)) {
        await documentService.create(tenant.property_id, {
          name: `RG/CNH - ${tenant.name}`,
          category: 'Jurídico',
          type: rgFile.type.includes('pdf') ? 'PDF' : 'Imagem',
          size: `${(rgFile.size / 1024 / 1024).toFixed(2)} MB`,
          status: 'Pendente',
          url: rgUrl,
        });
        await documentService.create(tenant.property_id, {
          name: `Comp. Renda - ${tenant.name}`,
          category: 'Financeiro',
          type: incomeFile.type.includes('pdf') ? 'PDF' : 'Imagem',
          size: `${(incomeFile.size / 1024 / 1024).toFixed(2)} MB`,
          status: 'Pendente',
          url: incomeUrl,
        });
        if (residenceFile && resUrl) {
          await documentService.create(tenant.property_id, {
            name: `Comp. Residência - ${tenant.name}`,
            category: 'Financeiro',
            type: residenceFile.type.includes('pdf') ? 'PDF' : 'Imagem',
            size: `${(residenceFile.size / 1024 / 1024).toFixed(2)} MB`,
            status: 'Pendente',
            url: resUrl,
          });
        }
      }
      if (guaranteeType === 'fiador' && guarantorName) {
        const guarantorUploads: Promise<string | null>[] = [];
        let guarantorRgDocUrl = '';
        let guarantorIncomeProofUrl = '';
        if (guarantorRgFile) {
          const grgPath = `${tenant.id}/guarantor_rg_${timestamp}_${guarantorRgFile.name}`;
          guarantorUploads.push(
            storageService.uploadFile('tenant-documents', grgPath, guarantorRgFile)
          );
        }
        if (guarantorIncomeProofFile) {
          const gipPath = `${tenant.id}/guarantor_income_proof_${timestamp}_${guarantorIncomeProofFile.name}`;
          guarantorUploads.push(
            storageService.uploadFile('tenant-documents', gipPath, guarantorIncomeProofFile)
          );
        }
        const guarantorResults = await Promise.all(guarantorUploads);
        if (guarantorRgFile && guarantorResults[0]) {
          guarantorRgDocUrl = guarantorResults[0] || '';
        }
        if (guarantorIncomeProofFile && guarantorResults.length > 0) {
          guarantorIncomeProofUrl = guarantorResults[guarantorResults.length - 1] || '';
        }
        const { guarantorService } = await import('../services/tenancy/guarantorService');
        await guarantorService.upsert({
          tenant_id: tenant.id,
          property_id: tenant.property_id || undefined,
          name: guarantorName,
          birth_date: guarantorBirthDate || undefined,
          cpf: guarantorCpf.replace(/\D/g, ''),
          rg: guarantorRg || '',
          phone: guarantorPhone || '',
          email: guarantorEmail || '',
          rg_document_url: guarantorRgDocUrl,
          income_proof_url: guarantorIncomeProofUrl,
          status: 'pendente',
        });
      }

      if (guaranteeType === 'deposito_caucao' && paymentReceiptFile && tenant.property_id) {
        const receiptPath = `${tenant.id}/payment_receipt_${timestamp}_${paymentReceiptFile.name}`;
        const receiptUrl = await storageService.uploadFile(
          'tenant-documents',
          receiptPath,
          paymentReceiptFile
        );
        if (receiptUrl) {
          await documentService.create(tenant.property_id, {
            name: `Comprovante de Depósito - ${tenant.name}`,
            category: 'Financeiro',
            type: paymentReceiptFile.type.includes('pdf') ? 'PDF' : 'Imagem',
            size: `${(paymentReceiptFile.size / 1024 / 1024).toFixed(2)} MB`,
            status: 'Pendente',
            url: receiptUrl,
            document_type: 'payment_receipt',
            tenant_id: tenant.id,
          });
        }
      }
      onStepComplete();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg((err as Error)?.message || 'Erro ao enviar documentos.');
    } finally {
      setLoading(false);
    }
  };

  return {
    rgFile,
    incomeFile,
    residenceFile,
    guaranteeType,
    ownerConfig,
    guarantorName,
    guarantorCpf,
    guarantorRg,
    guarantorPhone,
    guarantorEmail,
    guarantorBirthDate,
    guarantorRgFile,
    guarantorIncomeProofFile,
    paymentReceiptFile,
    copiedPix,
    paymentTabMode,
    loading,
    errorMsg,
    setRgFile,
    setIncomeFile,
    setResidenceFile,
    setGuaranteeType,
    setGuarantorName,
    setGuarantorCpf,
    setGuarantorRg,
    setGuarantorPhone,
    setGuarantorEmail,
    setGuarantorBirthDate,
    setGuarantorRgFile,
    setGuarantorIncomeProofFile,
    setPaymentReceiptFile,
    handleGuarantorCpfChange,
    handleUploadDocs,
    setCopiedPix,
    setPaymentTabMode,
    setErrorMsg,
    setLoading,
  };
}
