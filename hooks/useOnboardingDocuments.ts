import { useState, useEffect } from 'react';
import { Tenant, OwnerPaymentConfig } from '../types';
import { documentService } from '../services/documentService';
import { storageService } from '../services/storageService';
import { profileService } from '../services/profileService';
import { spouseService } from '../services/tenancy/spouseService';
import { validateCPF } from '../utils/formatters';
import { ownerPaymentConfigService } from '../services/tenancy/ownerPaymentConfigService';

export interface UseOnboardingDocumentsReturn {
  rgFile: File | null;
  incomeFile: File | null;
  residenceFile: File | null;
  selfieFile: File | null;
  certidaoEstadoCivilFile: File | null;
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
  spouseRgFile: File | null;
  spouseIncomeFile: File | null;
  spouseMarriageCertFile: File | null;
  copiedPix: boolean;
  paymentTabMode: 'pix' | 'bank';
  loading: boolean;
  errorMsg: string | null;

  setRgFile: (f: File | null) => void;
  setIncomeFile: (f: File | null) => void;
  setResidenceFile: (f: File | null) => void;
  setSelfieFile: (f: File | null) => void;
  setCertidaoEstadoCivilFile: (f: File | null) => void;
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
  setSpouseRgFile: (f: File | null) => void;
  setSpouseIncomeFile: (f: File | null) => void;
  setSpouseMarriageCertFile: (f: File | null) => void;
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
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [certidaoEstadoCivilFile, setCertidaoEstadoCivilFile] = useState<File | null>(null);
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
  const [spouseRgFile, setSpouseRgFile] = useState<File | null>(null);
  const [spouseIncomeFile, setSpouseIncomeFile] = useState<File | null>(null);
  const [spouseMarriageCertFile, setSpouseMarriageCertFile] = useState<File | null>(null);
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
      setErrorMsg('Por favor, selecione RG e Comprovante de Renda.');
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    const filesToCheck = [
      rgFile, incomeFile, residenceFile, selfieFile,
      certidaoEstadoCivilFile, paymentReceiptFile,
      guarantorRgFile, guarantorIncomeProofFile,
      spouseRgFile, spouseIncomeFile,
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
      if (!guarantorName.trim()) { setErrorMsg('Preencha o nome do fiador.'); return; }
      if (!guarantorBirthDate.trim()) { setErrorMsg('Preencha a data de nascimento do fiador.'); return; }
      const cpfDigits = guarantorCpf.replace(/\D/g, '');
      if (cpfDigits.length < 11 || !validateCPF(guarantorCpf)) { setErrorMsg('CPF do fiador inválido.'); return; }
      if (!guarantorRg.trim()) { setErrorMsg('Preencha o RG do fiador.'); return; }
      if (!guarantorRgFile) { setErrorMsg('Envie o RG do fiador.'); return; }
      if (!guarantorIncomeProofFile) { setErrorMsg('Envie o comprovante de renda do fiador.'); return; }
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const timestamp = Date.now();
      const rgPath = `${tenant.id}/${timestamp}_rg_${rgFile.name}`;
      const incPath = `${tenant.id}/${timestamp}_income_${incomeFile.name}`;
      const uploads: Promise<string | null>[] = [
        storageService.uploadFile('tenant-documents', rgPath, rgFile),
        storageService.uploadFile('tenant-documents', incPath, incomeFile),
      ];
      if (residenceFile) {
        uploads.push(storageService.uploadFile('tenant-documents', `${tenant.id}/${timestamp}_residence_${residenceFile.name}`, residenceFile));
      }
      if (selfieFile) {
        uploads.push(storageService.uploadFile('tenant-documents', `${tenant.id}/${timestamp}_selfie_${selfieFile.name}`, selfieFile));
      }
      if (certidaoEstadoCivilFile) {
        uploads.push(storageService.uploadFile('tenant-documents', `${tenant.id}/${timestamp}_certidao_${certidaoEstadoCivilFile.name}`, certidaoEstadoCivilFile));
      }

      const results = await Promise.all(uploads);
      const [rgUrl, incomeUrl] = results;
      const resUrl = residenceFile ? results[2] : null;
      let selfieUrl: string | null = null;
      let certidaoUrl: string | null = null;
      let idx = residenceFile ? 3 : 2;
      if (selfieFile) { selfieUrl = results[idx]; idx++; }
      if (certidaoEstadoCivilFile) { certidaoUrl = results[idx]; idx++; }

      if (!rgUrl || !incomeUrl) throw new Error('Falha no upload para o storage.');

      const docUrls: Record<string, string> = {
        rg_name: rgFile.name, rg_url: rgUrl,
        income_name: incomeFile.name, income_url: incomeUrl,
      };
      if (residenceFile && resUrl) { docUrls.residence_name = residenceFile.name; docUrls.residence_url = resUrl; }
      if (selfieFile && selfieUrl) { docUrls.selfie_name = selfieFile.name; docUrls.selfie_url = selfieUrl; }
      if (certidaoEstadoCivilFile && certidaoUrl) { docUrls.certidao_name = certidaoEstadoCivilFile.name; docUrls.certidao_url = certidaoUrl; }

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
        const docsToCreate: { name: string; category: 'Jurídico' | 'Financeiro'; url?: string }[] = [
          { name: `RG/CNH - ${tenant.name}`, category: 'Jurídico', url: rgUrl || undefined },
          { name: `Comp. Renda - ${tenant.name}`, category: 'Financeiro', url: incomeUrl || undefined },
        ];
        if (residenceFile && resUrl) docsToCreate.push({ name: `Comp. Residência - ${tenant.name}`, category: 'Financeiro', url: resUrl || undefined });
        if (selfieFile && selfieUrl) docsToCreate.push({ name: `Selfie - ${tenant.name}`, category: 'Jurídico', url: selfieUrl || undefined });
        if (certidaoEstadoCivilFile && certidaoUrl) docsToCreate.push({ name: `Certidão Estado Civil - ${tenant.name}`, category: 'Jurídico', url: certidaoUrl || undefined });

        for (const d of docsToCreate) {
          await documentService.create(tenant.property_id, {
            name: d.name, category: d.category,
            type: 'Imagem', size: '0 MB', status: 'Pendente', url: d.url,
          });
        }
      }

      if (guaranteeType === 'fiador' && guarantorName) {
        const guarantorUploads: Promise<string | null>[] = [];
        if (guarantorRgFile) {
          guarantorUploads.push(storageService.uploadFile('tenant-documents', `${tenant.id}/guarantor_rg_${timestamp}_${guarantorRgFile.name}`, guarantorRgFile));
        }
        if (guarantorIncomeProofFile) {
          guarantorUploads.push(storageService.uploadFile('tenant-documents', `${tenant.id}/guarantor_income_proof_${timestamp}_${guarantorIncomeProofFile.name}`, guarantorIncomeProofFile));
        }
        const guarantorResults = (await Promise.all(guarantorUploads)).filter(Boolean) as string[];
        const guarantorRgDocUrl = guarantorRgFile && guarantorResults[0] ? guarantorResults[0] : undefined;
        const guarantorIncomeProofUrl = guarantorIncomeProofFile && guarantorResults.length > 0 ? guarantorResults[guarantorResults.length - 1] : undefined;

        const { guarantorService } = await import('../services/tenancy/guarantorService');
        await guarantorService.upsert({
          tenant_id: tenant.id, property_id: tenant.property_id || undefined,
          name: guarantorName, birth_date: guarantorBirthDate || undefined,
          cpf: guarantorCpf.replace(/\D/g, ''), rg: guarantorRg || '',
          phone: guarantorPhone || '', email: guarantorEmail || '',
          rg_document_url: guarantorRgDocUrl, income_proof_url: guarantorIncomeProofUrl,
          status: 'pendente',
        });
      }

      if (guaranteeType === 'deposito_caucao' && paymentReceiptFile && tenant.property_id) {
        const receiptUrl = await storageService.uploadFile('tenant-documents', `${tenant.id}/payment_receipt_${timestamp}_${paymentReceiptFile.name}`, paymentReceiptFile);
        if (receiptUrl) {
          await documentService.create(tenant.property_id, {
            name: `Comprovante de Depósito - ${tenant.name}`, category: 'Financeiro',
            type: paymentReceiptFile.type.includes('pdf') ? 'PDF' : 'Imagem',
            size: `${(paymentReceiptFile.size / 1024 / 1024).toFixed(2)} MB`,
            status: 'Pendente', url: receiptUrl,
            document_type: 'payment_receipt', tenant_id: tenant.id,
          });
        }
      }

      if ((spouseRgFile || spouseIncomeFile) && tenant.spouse?.id) {
        const spouseUploads: Promise<string | null>[] = [];
        if (spouseRgFile) {
          spouseUploads.push(storageService.uploadFile('tenant-documents', `${tenant.id}/spouse_rg_${timestamp}_${spouseRgFile.name}`, spouseRgFile));
        }
        if (spouseIncomeFile) {
          spouseUploads.push(storageService.uploadFile('tenant-documents', `${tenant.id}/spouse_income_${timestamp}_${spouseIncomeFile.name}`, spouseIncomeFile));
        }
        const spouseResults = await Promise.all(spouseUploads);
        if (tenant.property_id && isValidUUID(tenant.property_id)) {
          if (spouseRgFile && spouseResults[0]) {
            await documentService.create(tenant.property_id, {
              name: `RG Cônjuge - ${tenant.name}`, category: 'Jurídico',
              type: 'Imagem', size: '0 MB', status: 'Pendente', url: spouseResults[0],
            });
          }
          if (spouseIncomeFile && spouseResults.length > 0) {
            const spouseIncomeUrl = spouseIncomeFile ? (spouseRgFile ? spouseResults[1] : spouseResults[0]) : null;
            if (spouseIncomeUrl) {
              await documentService.create(tenant.property_id, {
                name: `Comp. Renda Cônjuge - ${tenant.name}`, category: 'Financeiro',
                type: 'Imagem', size: '0 MB', status: 'Pendente', url: spouseIncomeUrl,
              });
            }
          }
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
    rgFile, incomeFile, residenceFile, selfieFile, certidaoEstadoCivilFile,
    guaranteeType, ownerConfig,
    guarantorName, guarantorCpf, guarantorRg, guarantorPhone, guarantorEmail, guarantorBirthDate,
    guarantorRgFile, guarantorIncomeProofFile, paymentReceiptFile,
    spouseRgFile, spouseIncomeFile, spouseMarriageCertFile,
    copiedPix, paymentTabMode, loading, errorMsg,
    setRgFile, setIncomeFile, setResidenceFile, setSelfieFile, setCertidaoEstadoCivilFile,
    setGuaranteeType,
    setGuarantorName, setGuarantorCpf, setGuarantorRg, setGuarantorPhone, setGuarantorEmail, setGuarantorBirthDate,
    setGuarantorRgFile, setGuarantorIncomeProofFile, setPaymentReceiptFile,
    setSpouseRgFile, setSpouseIncomeFile, setSpouseMarriageCertFile,
    handleGuarantorCpfChange, handleUploadDocs,
    setCopiedPix, setPaymentTabMode, setErrorMsg, setLoading,
  };
}
