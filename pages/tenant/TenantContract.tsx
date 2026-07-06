import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  PenTool,
} from 'lucide-react';
import { contractService } from '../../services/contractService';
import { Contract } from '../../types';
import { getStatusColor, getStatusLabel } from '../../utils/contractLogic';

interface ContextType {
  isOnboardingRequired: boolean;
  loadingOnboarding: boolean;
  tenantData: any;
  pendingInspection: any;
  refetchOnboarding: () => void;
}

const TenantContract: React.FC = () => {
  const { tenantData } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContract = async () => {
      if (!tenantData?.contracts?.length) {
        setLoading(false);
        return;
      }
      try {
        const contractId = tenantData.contracts[0].id;
        const data = await contractService.getById(contractId);
        setContract(data);
      } catch (err) {
        console.error('Error loading contract:', err);
      } finally {
        setLoading(false);
      }
    };
    loadContract();
  }, [tenantData]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center'>
            <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
          <p className='text-sm font-bold text-slate-500 animate-pulse'>Carregando contrato...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6'>
        <div className='text-center max-w-md'>
          <div className='w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6'>
            <FileText size={40} className='text-slate-300' />
          </div>
          <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>
            Nenhum contrato encontrado
          </h2>
          <p className='text-slate-500 text-sm'>
            Você ainda não possui um contrato de locação ativo.
          </p>
        </div>
      </div>
    );
  }

  const calculateProgress = () => {
    const start = new Date(contract.start_date).getTime();
    const end = new Date(contract.end_date).getTime();
    const now = new Date().getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  return (
    <div className='min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8 max-w-4xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 dark:text-white'>Meu Contrato</h1>
          <p className='text-sm text-slate-500'>Detalhes do contrato de locação</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(contract.status)}`}
        >
          {getStatusLabel(contract.status)}
        </div>
      </div>

      <div className='grid gap-6'>
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl'>
                <Building2 size={18} className='text-primary shrink-0' />
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Imóvel</p>
                  <p className='text-sm font-bold text-slate-900 dark:text-white'>
                    {contract.property}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl'>
                <User size={18} className='text-primary shrink-0' />
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Proprietário</p>
                  <p className='text-sm font-bold text-slate-900 dark:text-white'>
                    {contract.owner_name}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl'>
                <FileText size={18} className='text-primary shrink-0' />
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Contrato</p>
                  <p className='text-sm font-bold text-slate-900 dark:text-white'>
                    Ref: {contract.contract_number}
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl'>
                <DollarSign size={18} className='text-emerald-500 shrink-0' />
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Valor Mensal</p>
                  <p className='text-lg font-black text-emerald-600 dark:text-emerald-400'>
                    {contract.value}
                  </p>
                  <p className='text-[10px] text-emerald-500/60 font-bold'>
                    Vencimento dia {contract.payment_day}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl'>
                <Calendar size={18} className='text-primary shrink-0' />
                <div className='flex-1 flex justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-slate-400 uppercase'>Início</p>
                    <p className='text-sm font-bold text-slate-900 dark:text-white'>
                      {new Date(contract.start_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[10px] font-bold text-slate-400 uppercase'>Término</p>
                    <p className='text-sm font-bold text-slate-900 dark:text-white'>
                      {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Vigência
              </span>
              <span className='text-[10px] font-black text-primary'>{calculateProgress()}%</span>
            </div>
            <div className='w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary rounded-full transition-all duration-1000'
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {contract.security_deposit ? (
          <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6'>
            <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4'>
              <DollarSign size={18} className='text-primary' /> Garantia
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-300'>
              Caução:{' '}
              <strong>
                R$ {contract.security_deposit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </p>
          </div>
        ) : null}

        {contract.condominium_value ? (
          <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6'>
            <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4'>
              <DollarSign size={18} className='text-primary' /> Encargos
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              {contract.condominium_value ? (
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Condomínio</p>
                  <p className='text-sm font-bold text-slate-900 dark:text-white'>
                    R${' '}
                    {contract.condominium_value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ) : null}
              {contract.iptu_value ? (
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>IPTU</p>
                  <p className='text-sm font-bold text-slate-900 dark:text-white'>
                    R$ {contract.iptu_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {contract.signers && contract.signers.length > 0 && (
          <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6'>
            <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4'>
              <PenTool size={18} className='text-primary' /> Assinaturas
            </h3>
            <div className='space-y-3'>
              {contract.signers.map((signer, idx) => (
                <div
                  key={signer.id || idx}
                  className='flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl'
                >
                  <div className='flex items-center gap-3'>
                    {signer.status === 'signed' ? (
                      <CheckCircle size={18} className='text-emerald-500' />
                    ) : (
                      <Clock size={18} className='text-amber-500' />
                    )}
                    <div>
                      <p className='text-sm font-bold text-slate-900 dark:text-white'>
                        {signer.name}
                      </p>
                      <p className='text-[10px] text-slate-500'>
                        {signer.role === 'owner'
                          ? 'Proprietário'
                          : signer.role === 'tenant'
                            ? 'Inquilino'
                            : 'Fiador'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase ${signer.status === 'signed' ? 'text-emerald-500' : 'text-amber-500'}`}
                  >
                    {signer.status === 'signed' ? 'Assinou' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {contract.pdf_url && (
          <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6'>
            <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4'>
              <FileText size={18} className='text-primary' /> Documento
            </h3>
            <a
              href={contract.pdf_url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-sm transition-all'
            >
              <ExternalLink size={18} /> Visualizar Contrato Completo
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantContract;
