import { useState, useEffect } from 'react';
import { Tenant } from '../types';
import { profileService } from '../services/profileService';
import { spouseService } from '../services/tenancy/spouseService';
import { referenceService } from '../services/tenancy/referenceService';
import { useAuth } from '../context/AuthContext';

export interface UseOnboardingProfileReturn {
  name: string;
  cpf: string;
  phone: string;
  rg: string;
  birthDate: string;
  maritalStatus: string;
  nationality: string;
  rgIssuer: string;
  rgUf: string;
  companyName: string;
  companyCnpj: string;
  companyAddress: string;
  occupation: string;
  monthlyIncome: string;
  admissionDate: string;
  otherIncome: string;
  employmentType: string;
  cep: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  residenceTime: string;
  previousAddress: string;
  adultsCount: string;
  childrenCount: string;
  currentlyPaysRent: string;
  currentRentWhere: string;
  tenantType: string;
  companyLegalName: string;
  companyTradeName: string;
  companyStateRegistration: string;
  hasSpouse: string;
  spouseName: string;
  spouseCpf: string;
  spouseRg: string;
  spouseBirthDate: string;
  spousePhone: string;
  spouseOccupation: string;
  spouseIncome: string;
  refBankName: string;
  refBankAgency: string;
  refBankAccount: string;
  refPersonal1Name: string;
  refPersonal1Phone: string;
  refPersonal1Relation: string;
  refPersonal2Name: string;
  refPersonal2Phone: string;
  refPersonal2Relation: string;
  loading: boolean;
  errorMsg: string | null;

  setName: (v: string) => void;
  setCpf: (v: string) => void;
  setPhone: (v: string) => void;
  setRg: (v: string) => void;
  setBirthDate: (v: string) => void;
  setMaritalStatus: (v: string) => void;
  setNationality: (v: string) => void;
  setRgIssuer: (v: string) => void;
  setRgUf: (v: string) => void;
  setCompanyName: (v: string) => void;
  setCompanyCnpj: (v: string) => void;
  setCompanyAddress: (v: string) => void;
  setOccupation: (v: string) => void;
  setMonthlyIncome: (v: string) => void;
  setAdmissionDate: (v: string) => void;
  setOtherIncome: (v: string) => void;
  setEmploymentType: (v: string) => void;
  setCep: (v: string) => void;
  setStreet: (v: string) => void;
  setStreetNumber: (v: string) => void;
  setComplement: (v: string) => void;
  setNeighborhood: (v: string) => void;
  setCity: (v: string) => void;
  setState: (v: string) => void;
  setResidenceTime: (v: string) => void;
  setPreviousAddress: (v: string) => void;
  setAdultsCount: (v: string) => void;
  setChildrenCount: (v: string) => void;
  setCurrentlyPaysRent: (v: string) => void;
  setCurrentRentWhere: (v: string) => void;
  setTenantType: (v: string) => void;
  setCompanyLegalName: (v: string) => void;
  setCompanyTradeName: (v: string) => void;
  setCompanyStateRegistration: (v: string) => void;
  setHasSpouse: (v: string) => void;
  setSpouseName: (v: string) => void;
  setSpouseCpf: (v: string) => void;
  setSpouseRg: (v: string) => void;
  setSpouseBirthDate: (v: string) => void;
  setSpousePhone: (v: string) => void;
  setSpouseOccupation: (v: string) => void;
  setSpouseIncome: (v: string) => void;
  setRefBankName: (v: string) => void;
  setRefBankAgency: (v: string) => void;
  setRefBankAccount: (v: string) => void;
  setRefPersonal1Name: (v: string) => void;
  setRefPersonal1Phone: (v: string) => void;
  setRefPersonal1Relation: (v: string) => void;
  setRefPersonal2Name: (v: string) => void;
  setRefPersonal2Phone: (v: string) => void;
  setRefPersonal2Relation: (v: string) => void;
  handleCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSpouseCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  const [birthDate, setBirthDate] = useState(tenant.birth_date || '');
  const [maritalStatus, setMaritalStatus] = useState(tenant.marital_status || '');
  const [nationality, setNationality] = useState(tenant.nationality || '');
  const [rgIssuer, setRgIssuer] = useState(tenant.rg_issuer || '');
  const [rgUf, setRgUf] = useState(tenant.rg_uf || '');
  const [companyName, setCompanyName] = useState(tenant.company_name || '');
  const [companyCnpj, setCompanyCnpj] = useState(tenant.company_cnpj || '');
  const [companyAddress, setCompanyAddress] = useState(tenant.company_address || '');
  const [occupation, setOccupation] = useState(tenant.occupation || '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    tenant.monthly_income ? `R$ ${tenant.monthly_income.toFixed(2)}` : ''
  );
  const [admissionDate, setAdmissionDate] = useState(tenant.admission_date || '');
  const [otherIncome, setOtherIncome] = useState(
    tenant.other_income ? `R$ ${tenant.other_income.toFixed(2)}` : ''
  );
  const [employmentType, setEmploymentType] = useState('CLT');
  const [cep, setCep] = useState(tenant.cep || '');
  const [street, setStreet] = useState(tenant.street || '');
  const [streetNumber, setStreetNumber] = useState(tenant.street_number || '');
  const [complement, setComplement] = useState(tenant.complement || '');
  const [neighborhood, setNeighborhood] = useState(tenant.neighborhood || '');
  const [city, setCity] = useState(tenant.city || '');
  const [state, setState] = useState(tenant.state || '');
  const [residenceTime, setResidenceTime] = useState(tenant.residence_time || '');
  const [previousAddress, setPreviousAddress] = useState('');
  const [adultsCount, setAdultsCount] = useState(String(tenant.adults_count || 1));
  const [childrenCount, setChildrenCount] = useState(String(tenant.children_count || 0));
  const [currentlyPaysRent, setCurrentlyPaysRent] = useState(
    tenant.currently_pays_rent ? 'Sim' : 'Não'
  );
  const [currentRentWhere, setCurrentRentWhere] = useState(tenant.current_rent_where || '');
  const [tenantType, setTenantType] = useState<string>(tenant.tenant_type || 'pf');
  const [companyLegalName, setCompanyLegalName] = useState(tenant.company_legal_name || '');
  const [companyTradeName, setCompanyTradeName] = useState(tenant.company_trade_name || '');
  const [companyStateRegistration, setCompanyStateRegistration] = useState(tenant.company_state_registration || '');
  const [hasSpouse, setHasSpouse] = useState('Não');
  const [spouseName, setSpouseName] = useState(tenant.spouse?.name || '');
  const [spouseCpf, setSpouseCpf] = useState(tenant.spouse?.cpf || '');
  const [spouseRg, setSpouseRg] = useState(tenant.spouse?.rg || '');
  const [spouseBirthDate, setSpouseBirthDate] = useState(tenant.spouse?.birth_date || '');
  const [spousePhone, setSpousePhone] = useState(tenant.spouse?.phone || '');
  const [spouseOccupation, setSpouseOccupation] = useState(tenant.spouse?.occupation || '');
  const [spouseIncome, setSpouseIncome] = useState(
    tenant.spouse?.monthly_income ? `R$ ${tenant.spouse.monthly_income.toFixed(2)}` : ''
  );
  const [refBankName, setRefBankName] = useState('');
  const [refBankAgency, setRefBankAgency] = useState('');
  const [refBankAccount, setRefBankAccount] = useState('');
  const [refPersonal1Name, setRefPersonal1Name] = useState('');
  const [refPersonal1Phone, setRefPersonal1Phone] = useState('');
  const [refPersonal1Relation, setRefPersonal1Relation] = useState('');
  const [refPersonal2Name, setRefPersonal2Name] = useState('');
  const [refPersonal2Phone, setRefPersonal2Phone] = useState('');
  const [refPersonal2Relation, setRefPersonal2Relation] = useState('');
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

  const handleSpouseCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setSpouseCpf(value);
  };

  const parseIncome = (v: string): number | null => {
    if (!v) return null;
    return parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.'));
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
    if (tenantType === 'pj' && !companyLegalName.trim()) {
      setErrorMsg('Por favor, preencha a razão social da empresa.');
      return;
    }
    if (maritalStatus === 'casado' && hasSpouse === 'Sim' && !spouseName.trim()) {
      setErrorMsg('Por favor, preencha o nome do cônjuge.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const monthlyIncomeNum = parseIncome(monthlyIncome);
      const otherIncomeNum = parseIncome(otherIncome);
      const spouseIncomeNum = parseIncome(spouseIncome);

      await profileService.updateByEmail(tenant.email, {
        name,
        cpf: cpf.replace(/\D/g, ''),
        rg,
        phone,
        birth_date: birthDate || null,
        marital_status: maritalStatus || null,
        nationality: nationality || null,
        rg_issuer: rgIssuer || null,
        rg_uf: rgUf || null,
        company_name: companyName || null,
        company_cnpj: companyCnpj || null,
        company_address: companyAddress || null,
        occupation: occupation || null,
        monthly_income: monthlyIncomeNum,
        admission_date: admissionDate || null,
        other_income: otherIncomeNum,
        employment_type: employmentType || null,
        cep: cep || null,
        street: street || null,
        street_number: streetNumber || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        residence_time: residenceTime || null,
        adults_count: parseInt(adultsCount) || 1,
        children_count: parseInt(childrenCount) || 0,
        currently_pays_rent: currentlyPaysRent === 'Sim',
        current_rent_where: currentRentWhere || null,
        tenant_type: tenantType || 'pf',
        company_legal_name: companyLegalName || null,
        company_trade_name: companyTradeName || null,
        company_state_registration: companyStateRegistration || null,
        guarantee_type: guaranteeType || null,
        onboarding_profile_status: 'submitted',
        onboarding_stage: 'profile',
      });

      if (hasSpouse === 'Sim' && spouseName.trim()) {
        await spouseService.upsert({
          tenant_id: tenant.id,
          name: spouseName,
          cpf: spouseCpf.replace(/\D/g, '') || undefined,
          rg: spouseRg || undefined,
          birth_date: spouseBirthDate || undefined,
          phone: spousePhone || undefined,
          occupation: spouseOccupation || undefined,
          monthly_income: spouseIncomeNum ?? undefined,
        });
      } else if (tenant.spouse?.id) {
        await spouseService.delete(tenant.id);
      }

      const refs: { type: 'bancaria' | 'pessoal'; bank_name?: string; bank_agency?: string; bank_account?: string; name?: string; phone?: string; relationship?: string }[] = [];
      if (refBankName) {
        refs.push({ type: 'bancaria', bank_name: refBankName, bank_agency: refBankAgency, bank_account: refBankAccount });
      }
      if (refPersonal1Name) {
        refs.push({ type: 'pessoal', name: refPersonal1Name, phone: refPersonal1Phone, relationship: refPersonal1Relation });
      }
      if (refPersonal2Name) {
        refs.push({ type: 'pessoal', name: refPersonal2Name, phone: refPersonal2Phone, relationship: refPersonal2Relation });
      }
      if (refs.length > 0) {
        await referenceService.upsertMany(tenant.id, refs);
      }

      onStepComplete();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Erro ao salvar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    name, cpf, phone, rg, birthDate, maritalStatus, nationality, rgIssuer, rgUf,
    companyName, companyCnpj, companyAddress, occupation, monthlyIncome, admissionDate,
    otherIncome, employmentType,
    cep, street, streetNumber, complement, neighborhood, city, state, residenceTime, previousAddress,
    adultsCount, childrenCount, currentlyPaysRent, currentRentWhere,
    tenantType, companyLegalName, companyTradeName, companyStateRegistration,
    hasSpouse, spouseName, spouseCpf, spouseRg, spouseBirthDate, spousePhone, spouseOccupation, spouseIncome,
    refBankName, refBankAgency, refBankAccount,
    refPersonal1Name, refPersonal1Phone, refPersonal1Relation,
    refPersonal2Name, refPersonal2Phone, refPersonal2Relation,
    loading, errorMsg,
    setName, setCpf, setPhone, setRg, setBirthDate, setMaritalStatus, setNationality, setRgIssuer, setRgUf,
    setCompanyName, setCompanyCnpj, setCompanyAddress, setOccupation, setMonthlyIncome, setAdmissionDate,
    setOtherIncome, setEmploymentType,
    setCep, setStreet, setStreetNumber, setComplement, setNeighborhood, setCity, setState, setResidenceTime, setPreviousAddress,
    setAdultsCount, setChildrenCount, setCurrentlyPaysRent, setCurrentRentWhere,
    setTenantType, setCompanyLegalName, setCompanyTradeName, setCompanyStateRegistration,
    setHasSpouse, setSpouseName, setSpouseCpf, setSpouseRg, setSpouseBirthDate, setSpousePhone, setSpouseOccupation, setSpouseIncome,
    setRefBankName, setRefBankAgency, setRefBankAccount,
    setRefPersonal1Name, setRefPersonal1Phone, setRefPersonal1Relation,
    setRefPersonal2Name, setRefPersonal2Phone, setRefPersonal2Relation,
    handleCpfChange, handleSpouseCpfChange, handleSaveProfile, setErrorMsg,
  };
}
