import React, { useState } from 'react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Contract } from '../../types';
import { getStatusColor, getStatusLabel } from '../../utils/contractLogic';
import {
  FileText,
  Calendar,
  DollarSign,
  History,
  ShieldCheck,
  Download,
  Send,
  XCircle,
  RefreshCw,
  PenTool,
  CheckCircle,
  Mail,
  MessageCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Hash,
  Info,
  MapPin,
  User,
  Zap,
  CreditCard,
  Barcode,
  Bell,
  ArrowRight,
  ExternalLink,
  FilePlus,
  Eye,
} from 'lucide-react';

interface ContractDetailsProps {
  contract: Contract;
  onClose: () => void;
  onUpdate: (updated: Contract) => void;
}

export const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'document' | 'history'>('overview');
  const [isSigning, setIsSigning] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const calculateProgress = () => {
    const start = new Date(contract.start_date).getTime();
    const end = new Date(contract.end_date).getTime();
    const now = new Date().getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };
  const contractProgress = calculateProgress();

  const handleSendSignature = () => {
    setIsSigning(true);
    setTimeout(() => {
      // Mock update
      const updated = {
        ...contract,
        status: 'active' as const,
        signers: contract.signers.map((s) => ({
          ...s,
          status: 'signed' as const,
          signed_at: new Date().toISOString(),
        })),
        history: [
          {
            id: Date.now().toString(),
            action: 'signed' as const,
            description: 'Assinado digitalmente por todas as partes',
            performed_by: 'Sistema',
            date: new Date().toLocaleString(),
          },
          ...contract.history,
        ],
      };
      onUpdate(updated);
      setIsSigning(false);
    }, 2000);
  };

  const handleCancelContract = () => {
    const updated = {
      ...contract,
      status: 'cancelled' as const,
      history: [
        {
          id: Date.now().toString(),
          action: 'cancelled' as const,
          description: 'Contrato rescindido manualmente',
          performed_by: 'Proprietário',
          date: new Date().toLocaleString(),
        },
        ...contract.history,
      ],
    };
    onUpdate(updated);
    setShowCancelConfirm(false);
  };

  return (
    <ModalWrapper
      onClose={onClose}
      title={`Contrato #${contract.contract_number}`}
      showCloseButton={true}
      className='md:max-w-4xl'
    >
      <div className='flex flex-col h-[90vh] md:h-[700px] bg-background-light dark:bg-background-dark'>
        {/* Status Header */}
        <div className='px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div className='flex items-center gap-3'>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(contract.status)}`}
            >
              {getStatusLabel(contract.status)}
            </div>
            <span className='text-sm text-slate-500'>{contract.property}</span>
          </div>

          <div className='flex gap-2'>
            {contract.status === 'pending_signature' && (
              <button
                onClick={handleSendSignature}
                disabled={isSigning}
                className='flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-70'
              >
                {isSigning ? (
                  'Processando...'
                ) : (
                  <>
                    <PenTool size={16} /> Simular Assinatura
                  </>
                )}
              </button>
            )}
            {contract.status === 'active' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className='flex items-center gap-2 px-4 py-2 bg-transparent text-red-500/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 rounded-lg text-sm font-bold transition-all group'
              >
                <XCircle size={16} className='opacity-50 group-hover:opacity-100' /> Rescindir
              </button>
            )}
            <button className='p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500'>
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='px-6 border-b border-gray-200 dark:border-white/5 bg-slate-50 dark:bg-black/20'>
          <div className='flex gap-6'>
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'document', label: 'Documento Original' },
              { id: 'history', label: 'Histórico & Auditoria' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-black/10'>
          {activeTab === 'overview' && (
            <div className='grid md:grid-cols-2 gap-6 animate-fadeIn'>
              <div className='space-y-6'>
                {/* Contract Info */}
                <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4'>
                  <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                    <FileText size={18} className='text-primary' /> Dados do Contrato
                  </h3>
                  <div className='space-y-4'>
                    <div className='space-y-3 text-sm'>
                      <div className='flex justify-between items-center border-b border-slate-50 dark:border-white/5 pb-2'>
                        <span className='text-slate-500 flex items-center gap-1.5'><User size={14} /> Inquilino</span>
                        <span className='font-bold dark:text-white'>{contract.tenant_name}</span>
                      </div>
                      <div className='flex justify-between items-center border-b border-slate-50 dark:border-white/5 pb-2'>
                        <span className='text-slate-500 flex items-center gap-1.5'><ShieldCheck size={14} /> Proprietário</span>
                        <span className='font-medium dark:text-white'>{contract.owner_name}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <div className='flex flex-col'>
                          <span className='text-[10px] font-bold text-slate-400 uppercase'>Início</span>
                          <span className='font-bold dark:text-white'>{new Date(contract.start_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className='flex flex-col text-right'>
                          <span className='text-[10px] font-bold text-slate-400 uppercase'>Término</span>
                          <span className='font-bold dark:text-white'>{new Date(contract.end_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='pt-2'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Tempo Decorrido</span>
                        <span className='text-[10px] font-black text-primary'>{contractProgress}%</span>
                      </div>
                      <div className='w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
                        <div 
                          className='h-full bg-primary rounded-full transition-all duration-1000' 
                          style={{ width: `${contractProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Rules (Extracted Parameters) */}
                <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4'>
                  <div className='flex justify-between items-center'>
                    <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                      <ShieldCheck size={18} className='text-emerald-500' /> Regras Inteligentes
                    </h3>
                    <span className='text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30'>
                      Extraído
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-1.5'>
                          <Percent size={12} className='text-slate-400' />
                          <span className='text-[10px] font-bold text-slate-500 uppercase'>Multa</span>
                        </div>
                        <div title="Base legal: Jurisprudência consolidada do STJ (Contratos Civis). Limite usual de 10% para evitar abusividade." className='cursor-help text-slate-300 hover:text-primary transition-colors'>
                          <Info size={10} />
                        </div>
                      </div>
                      <p className='text-sm font-black dark:text-white'>10%</p>
                    </div>
                    <div className='p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-1.5'>
                          <TrendingUp size={12} className='text-slate-400' />
                          <span className='text-[10px] font-bold text-slate-500 uppercase'>Juros Diários</span>
                        </div>
                        <div title="Art. 406 do Código Civil: Limite de 1% ao mês (0,033% ao dia) para evitar usura em contratos civis." className='cursor-help text-slate-300 hover:text-primary transition-colors'>
                          <Info size={10} />
                        </div>
                      </div>
                      <p className='text-sm font-black dark:text-white'>0,033%</p>
                    </div>
                    <div className='p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-1.5'>
                          <RefreshCw size={12} className='text-slate-400' />
                          <span className='text-[10px] font-bold text-slate-500 uppercase'>Reajuste</span>
                        </div>
                        <div title="Lei 10.192/01: Proíbe reajustes com periodicidade inferior a 1 ano em contratos de locação." className='cursor-help text-slate-300 hover:text-primary transition-colors'>
                          <Info size={10} />
                        </div>
                      </div>
                      <p className='text-sm font-black dark:text-white'>IGP-M (Anual)</p>
                    </div>
                    <div className='p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5'>
                      <div className='flex items-center gap-1.5 mb-1'>
                        <ArrowUpRight size={12} className='text-slate-400' />
                        <span className='text-[10px] font-bold text-slate-500 uppercase'>
                          Próximo Reajuste
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-black text-primary'>Jan 2025</p>
                        <span className='text-[8px] font-black bg-amber-500/10 text-amber-600 px-1 py-0.5 rounded'>em 8 meses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-6'>
                {/* Financials */}
                <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4'>
                  <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                    <DollarSign size={18} className='text-emerald-500' /> Financeiro
                  </h3>
                  <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl'>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-emerald-800 dark:text-emerald-300 font-medium text-sm'>
                        Aluguel Base
                      </span>
                      <span className='text-xl font-black text-emerald-600 dark:text-emerald-400'>
                        {contract.value}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-[10px] text-emerald-600/60 dark:text-emerald-400/40 font-bold'>
                      <span>+ Condomínio/IPTU</span>
                      <span>R$ 550,00 (aprox.)</span>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4 px-2'>
                    <div className='flex flex-col'>
                      <span className='text-[10px] font-bold text-slate-400 uppercase'>Vencimento</span>
                      <span className='font-black text-slate-900 dark:text-white text-sm'>Dia {contract.payment_day}</span>
                    </div>
                    <div className='flex flex-col text-right'>
                      <span className='text-[10px] font-bold text-slate-400 uppercase'>Garantia</span>
                      <span className='font-bold text-indigo-500 text-sm'>Fiador</span>
                    </div>
                  </div>
                </div>

                {/* Signature Progress & Timeline */}
                <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4'>
                  <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                    <PenTool size={18} className='text-primary' /> Timeline de Assinatura
                  </h3>

                  <div className='relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
                    {contract.signers && contract.signers.length > 0 ? (
                      contract.signers.map((signer: any, idx: number) => (
                        <div key={signer.id || idx} className='relative'>
                          <div className={`absolute -left-[19px] top-1 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-surface-dark ${
                            signer.status === 'signed' ? 'bg-emerald-500' : 
                            signer.status === 'viewed' ? 'bg-blue-500' : 'bg-slate-200 dark:bg-white/10'
                          }`}>
                            {signer.status === 'signed' ? <CheckCircle size={10} className='text-white' /> : 
                             signer.status === 'viewed' ? <Clock size={10} className='text-white' /> : 
                             <div className='w-1.5 h-1.5 rounded-full bg-slate-400' />}
                          </div>
                          <div className='flex justify-between items-start'>
                            <div>
                              <p className='text-xs font-bold dark:text-white'>
                                {signer.role === 'owner' ? 'Proprietário' : signer.role === 'tenant' ? 'Inquilino' : 'Fiador'} {signer.status === 'signed' ? 'Assinou' : signer.status === 'viewed' ? 'Visualizou' : 'Pendente'}
                              </p>
                              <p className='text-[10px] text-slate-500'>
                                {signer.status === 'signed' ? `IP: ${signer.ip || '187.54.21.10'} • Hash: ${signer.hash || '4x9f...a2'}` : 
                                 signer.status === 'viewed' ? 'Aguardando confirmação digital' : 'Link de assinatura não acessado'}
                              </p>
                            </div>
                            <span className='text-[10px] text-slate-400'>
                              {signer.signed_at ? new Date(signer.signed_at).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'2-digit'}) : 
                               signer.viewed_at ? new Date(signer.viewed_at).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'2-digit'}) : ''}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">Nenhum signatário registrado.</p>
                    )}
                  </div>

                  <div className='pt-2 space-y-3'>
                    <div className='p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5'>
                      <p className='text-[10px] text-slate-500 font-medium'>Último envio do link para os pendentes:</p>
                      <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>Há 2 dias (15/04/2026)</p>
                    </div>
                    <button className='w-full py-3 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 transition-all flex items-center justify-center gap-2 group'>
                      <Send size={14} className='group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' />
                      Reenviar Links de Assinatura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'document' && (
            <div className='h-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden animate-fadeIn flex flex-col'>
              {contract.pdf_url ? (
                <>
                  <div className='flex-1 relative bg-slate-100 dark:bg-black/20'>
                    <iframe 
                      src={`${contract.pdf_url}${contract.pdf_url.includes('google.com') ? '' : '#toolbar=0'}`} 
                      className='w-full h-full border-none' 
                      title="Contrato PDF"
                    ></iframe>
                  </div>
                  <div className='p-3 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 flex justify-center'>
                    <a 
                      href={contract.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className='flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all'
                    >
                      <ExternalLink size={14} /> Abrir documento em tela cheia
                    </a>
                  </div>
                </>
              ) : (
                <div className='flex-1 flex items-center justify-center text-slate-400 p-10'>
                  <div className='text-center'>
                    <FileText size={64} className='mx-auto mb-4 opacity-50' />
                    <p className='font-bold'>Nenhum documento disponível</p>
                    <p className='text-xs mt-1'>O PDF original não foi carregado para este contrato.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className='space-y-6 animate-fadeIn py-4'>
              <div className='relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
                {contract.history.map((event: any) => (
                  <div key={event.id} className='relative group'>
                    {/* Timeline Dot with Icon */}
                    <div className='absolute -left-[27px] top-0 w-8 h-8 rounded-full bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/10 flex items-center justify-center ring-4 ring-white dark:ring-surface-dark group-hover:scale-110 transition-transform'>
                      {event.action === 'created' && <FilePlus size={14} className='text-blue-500' />}
                      {event.action === 'sent' && <Send size={14} className='text-amber-500' />}
                      {event.action === 'signed' && <PenTool size={14} className='text-emerald-500' />}
                      {event.action === 'viewed' && <Eye size={14} className='text-indigo-500' />}
                      {!['created', 'sent', 'signed', 'viewed'].includes(event.action) && <History size={14} className='text-slate-400' />}
                    </div>
                    
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          event.action === 'created' ? 'bg-blue-500/10 text-blue-500' :
                          event.action === 'sent' ? 'bg-amber-500/10 text-amber-500' :
                          event.action === 'signed' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-slate-500/10 text-slate-500'
                        }`}>
                          {event.action}
                        </span>
                        <span className='text-[10px] text-slate-400 font-medium'>{event.date}</span>
                      </div>
                      
                      <p className='text-sm font-bold text-slate-900 dark:text-white'>
                        {event.description}
                      </p>
                      
                      <div className='flex items-center gap-1.5 text-[10px] text-slate-500'>
                        <User size={10} />
                        <span>Realizado por: <span className='font-bold text-slate-700 dark:text-slate-300'>{event.performed_by}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal Overlay */}
      {showCancelConfirm && (
        <div className='absolute inset-0 bg-white/95 dark:bg-surface-dark/95 z-50 flex flex-col items-center justify-center p-6 animate-fadeIn rounded-3xl'>
          <div className='w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4'>
            <AlertTriangle size={32} />
          </div>
          <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>
            Rescindir Contrato?
          </h3>
          <p className='text-center text-sm text-slate-500 mb-6 max-w-sm'>
            Esta ação irá encerrar a vigência do contrato imediatamente e não pode ser desfeita.
          </p>
          <div className='flex gap-3 w-full max-w-xs'>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className='flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold'
            >
              Voltar
            </button>
            <button
              onClick={handleCancelContract}
              className='flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors'
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};