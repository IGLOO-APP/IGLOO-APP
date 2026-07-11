import { useState, useEffect } from 'react';
import { Tenant } from '../types';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';

export interface UseOnboardingProfileReturn {
  name: string;
  cpf: string;
  phone: string;
  rg: string;
  companyName: string;
  companyCnpj: string;
  companyAddress: string;
  occupation: string;
  monthlyIncome: string;
  admissionDate: string;
  loading: boolean;
  errorMsg: string | null;

  setName: (v: string) => void;
  setCpf: (v: string) => void;
  setPhone: (v: string) => void;
  setRg: (v: string) => void;
  setCompanyName: (v: string) => void;
  setCompanyCnpj: (v: string) => void;
  setCompanyAddress: (v: string) => void;
  setOccupation: (v: string) => void;
  setMonthlyIncome: (v: string) => void;
  setAdmissionDate: (v: string) => void;
  handleCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (guaranteeType?: string) => Promise<void>;
  setErrorMsg: (m: string | null) => void;
}

export function useOnboardingProfile(
  tenant: Tenant,
  onStepComplete: () => void
): UseOnboardingProfileReturn {
  const { user } = useAuth();
  const [name, setName] = useState(tenant.name || user?.name || '');
  const [cpf, setCpf] = useState(tenant.cpf || '');
  const [phone, setPhone] = useState(tenant.phone || '');
  const [rg, setRg] = useState(tenant.rg || '');
  const [companyName, setCompanyName] = useState(tenant.company_name || '');
  const [companyCnpj, setCompanyCnpj] = useState(tenant.company_cnpj || '');
  const [companyAddress, setCompanyAddress] = useState(tenant.company_address || '');
  const [occupation, setOccupation] = useState(tenant.occupation || '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    tenant.monthly_income ? `R$ ${tenant.monthly_income.toFixed(2)}` : ''
  );
  const [admissionDate, setAdmissionDate] = useState(tenant.admission_date || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || user?.name || '');
      setCpf(tenant.cpf || '');
      setPhone(tenant.phone || '');
    }
  }, [tenant, user?.name]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setCpf(value);
  };

  const handleSaveProfile = async (guaranteeType?: string) => {
    if (!name.trim()) {
      setErrorMsg('Por favor, preencha seu nome.');
      return;
    }
    if (!cpf.trim() || cpf.replace(/\D/g, '').length < 11) {
      setErrorMsg('Por favor, insira um CPF válido.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const monthlyIncomeNum = monthlyIncome
        ? parseFloat(monthlyIncome.replace(/[R$\s.]/g, '').replace(',', '.'))
        : null;

      await profileService.updateByEmail(tenant.email, {
        name,
        cpf: cpf.replace(/\D/g, ''),
        rg,
        phone,
        company_name: companyName || null,
        company_cnpj: companyCnpj || null,
        company_address: companyAddress || null,
        occupation: occupation || null,
        monthly_income: monthlyIncomeNum,
        admission_date: admissionDate || null,
        guarantee_type: guaranteeType || null,
        onboarding_profile_status: 'submitted',
        onboarding_stage: 'profile',
      });
      onStepComplete();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Erro ao salvar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    cpf,
    phone,
    rg,
    companyName,
    companyCnpj,
    companyAddress,
    occupation,
    monthlyIncome,
    admissionDate,
    loading,
    errorMsg,
    setName,
    setCpf,
    setPhone,
    setRg,
    setCompanyName,
    setCompanyCnpj,
    setCompanyAddress,
    setOccupation,
    setMonthlyIncome,
    setAdmissionDate,
    handleCpfChange,
    handleSaveProfile,
    setErrorMsg,
  };
}
