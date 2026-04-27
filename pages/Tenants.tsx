import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Search,
  Phone,
  Mail,
  ChevronRight,
  Plus,
  User,
  Briefcase,
  FileText,
  X,
  CloudUpload,
  Trash2,
  Filter,
  DollarSign,
  MessageCircle,
  Star,
  History,
  CheckCircle,
} from 'lucide-react';
import { TenantDetails } from '../components/tenants/TenantDetails';
import { BillingModal } from '../components/tenants/BillingModal';
import { tenantService } from '../services/tenantService';
import { propertyService } from '../services/propertyService';
import { useNotification } from '../context/NotificationContext';
import { formatCPF, formatPhone } from '../utils/formatters';
import { Tenant } from '../types';

const Tenants: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [billingTenant, setBillingTenant] = useState<Tenant | null>(null);
  const { addToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Liquidado' | 'Vencendo' | 'Atrasado'>(
    'Todos'
  );
  const location = useLocation();

  const queryClient = useQueryClient();
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.getAll(),
  });

  // Form State
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    propertyId: '',
    sendInvite: true,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: any) => (data.sendInvite ? tenantService.invite(data) : tenantService.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      addToast(
        newTenant.sendInvite ? 'Convite Enviado' : 'Inquilino Adicionado',
        newTenant.sendInvite 
          ? `O convite foi enviado para ${newTenant.email} com sucesso.`
          : `O inquilino ${newTenant.name} foi cadastrado com sucesso.`,
        'success'
      );
      setShowAddForm(false);
      setNewTenant({ name: '', email: '', phone: '', cpf: '', propertyId: '', sendInvite: true });
    },
    onError: (error: any) => {
      addToast('Erro', `Ocorreu um erro ao processar: ${error.message}`, 'error');
    },
  });

  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
      setShowAddForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAction = (e: React.MouseEvent, type: 'tel' | 'mailto', value: string) => {
    e.stopPropagation();
    window.location.href = `${type}:${value}`;
  };

  const getPaymentStatus = (tenant: Tenant) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const lastPayment = tenant.last_payment_date ? new Date(tenant.last_payment_date) : null;
    const isPaidThisMonth =
      lastPayment && lastPayment.getMonth() === currentMonth && lastPayment.getFullYear() === currentYear;

    if (isPaidThisMonth) {
      return {
        type: 'Liquidado',
        label: 'Liquidado',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      };
    }

    const dueDay = tenant.due || 10;
    const dueDate = new Date(currentYear, currentMonth, dueDay);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        type: 'Vencendo',
        label: `Vence em ${diffDays} dias`,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      };
    } else if (diffDays === 0) {
      return {
        type: 'Vencendo',
        label: 'Vence hoje',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      };
    } else {
      return {
        type: 'Atrasado',
        label: `Atrasado ${Math.abs(diffDays)} dias`,
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      };
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.cpf && t.cpf.includes(searchTerm));

    if (statusFilter === 'Todos') return matchesSearch;

    const status = getPaymentStatus(t);
    return matchesSearch && status.type === statusFilter;
  });

  const handleWhatsAppInvite = (e: React.MouseEvent, tenant: any) => {
    e.stopPropagation();
    const message = `Olá ${tenant.name}! Boas-vindas ao IGLOO. 🏠\n\nSou seu proprietário e estou te convidando para gerenciar nosso aluguel pela plataforma. Por lá você acessa boletos, assina contratos e solicita manutenção.\n\nComplete seu cadastro aqui: https://igloo-app.vercel.app/signup?email=${encodeURIComponent(tenant.email)}`;
    window.open(`https://wa.me/${tenant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col w-full max-w-md mx-auto md:max-w-5xl relative'>
      <header className='sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors'>
        <div>
          <h1 className='text-xl font-bold text-slate-900 dark:text-white tracking-tight'>
            Inquilinos
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {tenants.length} locatários ativos
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className='flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95'
        >
          <Plus size={18} /> Novo Inquilino
        </button>
      </header>

      <div className='px-6 py-4 flex flex-col gap-4'>
        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400'>
              <Search size={20} />
            </div>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='block w-full h-12 pl-10 pr-4 text-sm border-none rounded-2xl bg-white dark:bg-surface-dark dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-gray-100 dark:ring-white/5 transition-all'
              placeholder='Buscar por nome ou CPF...'
              type='text'
            />
          </div>
          <button className='h-12 w-12 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-500 shadow-sm'>
            <Filter size={20} />
          </button>
        </div>

        {/* Status Filter Bar */}
        <div className='flex gap-2 overflow-x-auto pb-2 hide-scrollbar'>
          {['Todos', 'Liquidado', 'Vencendo', 'Atrasado'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-6 pb-24 space-y-4'>
        {filteredTenants.length > 0 ? (
          filteredTenants.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTenantId(t.id.toString())}
              className='group flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-transparent dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-md transition-all cursor-pointer relative select-none overflow-hidden'
            >
              <div className='p-4 flex items-start gap-4'>
                <div className='relative shrink-0'>
                  {t.image ? (
                    <div
                      className='h-14 w-14 rounded-2xl bg-cover bg-center border-2 border-white dark:border-surface-dark shadow-sm'
                      style={{ backgroundImage: `url(${t.image})` }}
                    ></div>
                  ) : (
                    <div className='h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-white dark:border-surface-dark shadow-sm text-indigo-600 dark:text-indigo-400 font-bold text-xl'>
                      {t.name[0]}
                    </div>
                  )}
                </div>

                <div className='flex flex-1 flex-col justify-center min-w-0'>
                  <div className='flex justify-between items-start'>
                    <h3 className='text-slate-900 dark:text-white text-base font-bold truncate pr-2 leading-tight group-hover:text-primary transition-colors'>
                      {t.name}
                    </h3>
                    <ChevronRight
                      className='text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors'
                      size={20}
                    />
                  </div>
                  <p className='text-slate-500 dark:text-slate-400 text-xs font-medium mt-1 uppercase tracking-wider'>
                    {t.property || properties.find(p => p.id === (t as any).property_id)?.name || 'Imóvel não vinculado'}
                  </p>

                  <div className='flex items-center justify-between mt-4'>
                    {/* Quick Actions */}
                    <div className='flex gap-2'>
                      {(t as any).is_pending ? (
                        <>
                          <button
                            onClick={(e) => handleWhatsAppInvite(e, t)}
                            className='px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20'
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(`https://igloo-app.vercel.app/signup?email=${t.email}`);
                              addToast('Link Copiado', 'O link de convite foi copiado para a área de transferência.', 'success');
                            }}
                            className='px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5 text-[10px] font-bold'
                          >
                            <FileText size={14} /> Link
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBillingTenant(t);
                            }}
                            className='px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold'
                            title='Gerar Cobrança'
                          >
                            <DollarSign size={14} /> <span className='hidden sm:inline'>Cobrar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Msg');
                            }}
                            className='px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold'
                            title='Enviar Mensagem'
                          >
                            <MessageCircle size={14} /> <span className='hidden sm:inline'>Msg</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className='flex items-center gap-3'>
                      {/* Monthly Payment Status Badge */}
                      {(() => {
                        const status = getPaymentStatus(t);
                        return (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border border-transparent shadow-sm ${status.color}`}
                          >
                            {status.label}
                          </span>
                        );
                      })()}

                      <div className='text-right'>
                        {(t as any).is_pending ? (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider mb-1 shadow-sm shadow-amber-900/20'>
                            <Mail size={10} /> Convite Pendente
                          </span>
                        ) : t.status === 'late' ? (
                          <span className='inline-block px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase tracking-wider mb-1 shadow-sm shadow-red-900/20'>
                            Atraso Crítico
                          </span>
                        ) : (
                          <p className='text-[10px] font-bold uppercase tracking-tight text-slate-400 mb-0.5'>
                            Vence todo dia {t.due || 10}
                          </p>
                        )}
                        <p className='text-sm font-bold text-slate-900 dark:text-white leading-none'>
                          {t.rent || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {t.status === 'late' && <div className='bg-red-500 h-1 w-full'></div>}
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400'>
            <User size={48} className='mb-4 opacity-20' />
            <p className='text-sm font-medium'>Nenhum inquilino encontrado</p>
          </div>
        )}
      </div>


      {/* Add Tenant Modal */}
      {showAddForm && (
        <div className='fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn'>
          <div className='w-full h-[95vh] md:h-auto md:max-h-[85vh] md:max-w-md bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp ring-1 ring-white/10'>
            <header className='flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5'>
              <button
                onClick={() => setShowAddForm(false)}
                className='text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white transition-colors'
              >
                Cancelar
              </button>
              <h1 className='text-slate-900 dark:text-white text-lg font-bold'>Novo Inquilino</h1>
              <button 
                onClick={() => inviteMutation.mutate(newTenant)}
                disabled={inviteMutation.isPending || !newTenant.name || !newTenant.email}
                className='text-primary font-bold hover:text-primary-dark transition-colors disabled:opacity-50'
              >
                {inviteMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </header>

            <div className='flex-1 overflow-y-auto px-6 py-6 space-y-6'>
              {/* Invite Toggle */}
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-slate-900 dark:text-white text-sm font-bold">Enviar convite por e-mail</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">O inquilino receberá um link para completar o cadastro</p>
                </div>
                <button 
                  onClick={() => setNewTenant(prev => ({ ...prev, sendInvite: !prev.sendInvite }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${newTenant.sendInvite ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newTenant.sendInvite ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <label className='text-slate-900 dark:text-white text-sm font-semibold'>
                    Nome Completo
                  </label>
                  <div className='relative'>
                    <User
                      className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                      size={20}
                    />
                    <input
                      value={newTenant.name}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                      className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors'
                      placeholder='Ex: João da Silva'
                      type='text'
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  <label className='text-slate-900 dark:text-white text-sm font-semibold'>
                    Vincular a Imóvel
                  </label>
                  <div className='relative'>
                    <Briefcase
                      className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                      size={20}
                    />
                    <select
                      value={newTenant.propertyId}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, propertyId: e.target.value }))}
                      className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white appearance-none transition-colors'
                    >
                      <option value="">Selecione um imóvel (Opcional)</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!newTenant.sendInvite && (
                  <div className='flex flex-col gap-2 animate-fadeIn'>
                    <label className='text-slate-900 dark:text-white text-sm font-semibold flex justify-between'>
                      CPF / CNPJ{' '}
                      <span className='text-xs font-normal text-slate-400'>Somente números</span>
                    </label>
                    <div className='relative'>
                      <FileText
                        className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                        size={20}
                      />
                      <input
                        value={newTenant.cpf}
                        onChange={(e) => setNewTenant(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                        className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors'
                        placeholder='000.000.000-00'
                        type='tel'
                        maxLength={14}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className='h-px bg-gray-200 dark:bg-white/5'></div>

              <div className='flex flex-col gap-4'>
                <h2 className='text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider'>
                  Contatos
                </h2>
                <div className='flex flex-col gap-2'>
                  <label className='text-slate-900 dark:text-white text-sm font-semibold'>
                    E-mail
                  </label>
                  <div className='relative'>
                    <Mail
                      className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                      size={20}
                    />
                    <input
                      value={newTenant.email}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
                      className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors'
                      placeholder='email@exemplo.com'
                      type='email'
                    />
                  </div>
                </div>
                {!newTenant.sendInvite && (
                  <div className='flex flex-col gap-2 animate-fadeIn'>
                    <label className='text-slate-900 dark:text-white text-sm font-semibold'>
                      Telefone
                    </label>
                    <div className='relative'>
                      <Phone
                        className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                        size={20}
                      />
                      <input
                        value={newTenant.phone}
                        onChange={(e) => setNewTenant(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                        className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors'
                        placeholder='(00) 00000-0000'
                        type='tel'
                        maxLength={15}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!newTenant.sendInvite && (
                <>
                  <div className='h-px bg-gray-200 dark:bg-white/5'></div>
                  <div className='flex flex-col gap-4 animate-fadeIn'>
                    <div className='flex justify-between items-end'>
                      <h2 className='text-slate-900 dark:text-white text-sm font-semibold'>
                        Documentos Anexos
                      </h2>
                      <span className='text-xs text-slate-500 dark:text-slate-400'>Max 5MB</span>
                    </div>
                    <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-gray-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-primary/50 transition-all'>
                      <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <div className='bg-primary/10 p-3 rounded-full mb-3'>
                          <CloudUpload className='text-primary' size={24} />
                        </div>
                        <p className='mb-1 text-sm text-slate-900 dark:text-white font-medium'>
                          Toque para anexar
                        </p>
                      </div>
                      <input type='file' className='hidden' />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenant Detail Dashboard */}
      {selectedTenantId && (
        <TenantDetails id={selectedTenantId} onClose={() => setSelectedTenantId(null)} />
      )}

      {/* Smart Billing Modal */}
      {billingTenant && (
        <BillingModal
          tenant={billingTenant}
          onClose={() => setBillingTenant(null)}
          onConfirm={(data) => {
            console.log('Billing Confirmed:', data);
            
            // Register activity (Demo)
            const channelLabel = data.channel === 'whatsapp' ? 'WhatsApp' : data.channel === 'copy' ? 'Cópia' : 'Pix/Boleto';
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = new Date().toLocaleDateString('pt-BR');
            
            addToast(
              'Cobrança Enviada',
              `A cobrança para ${billingTenant.name} foi registrada com sucesso via ${channelLabel}.`,
              'success'
            );
            
            setBillingTenant(null);
          }}
        />
      )}
    </div>
  );
};

export default Tenants;
