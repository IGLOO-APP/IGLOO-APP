import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  DollarSign,
  User,
  Copy,
  CheckCircle,
  Loader,
  ToggleRight,
  ToggleLeft,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { ownerPaymentConfigService } from '../../../services/tenancy/ownerPaymentConfigService';
import type { OwnerPaymentConfig } from '../../../types';

export const GuaranteeTab: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<OwnerPaymentConfig>({
    owner_id: user?.id || '',
    accepts_deposit: false,
    accepts_guarantor: false,
    pix_enabled: false,
    pix_key_type: '',
    pix_key: '',
    bank_transfer_enabled: false,
    bank_name: '',
    bank_agency: '',
    bank_account: '',
    bank_account_type: '',
    account_holder_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.id) {
      ownerPaymentConfigService.getByOwner(user.id).then((data) => {
        if (data) setConfig(data);
        setLoading(false);
      });
    }
  }, [user?.id]);

  const update = <K extends keyof OwnerPaymentConfig>(key: K, value: OwnerPaymentConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!config.accepts_deposit && !config.accepts_guarantor) {
      toast.error('Você deve aceitar pelo menos uma modalidade de garantia (Depósito Caução ou Fiador).');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await ownerPaymentConfigService.upsert({ ...config, owner_id: user.id });
      setSaved(true);
      toast.success('Configurações salvas com sucesso!');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader className='animate-spin text-primary' size={24} />
      </div>
    );
  }

  return (
    <div className='animate-fadeIn space-y-8 max-w-4xl'>
        <div className='lg-card lg-card-lift p-6 rounded-2xl border border-border'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center'>
            <ShieldCheck size={20} />
          </div>
          <div>
              <h3 className='font-bold text-foreground text-lg'>
              Modalidades de Garantia Aceitas
            </h3>
              <p className='text-sm text-muted-foreground'>
              Configure quais opções de garantia os inquilinos poderão escolher durante o
              onboarding.
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 rounded-xl border border-border bg-muted/35'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center'>
                <DollarSign size={18} className='text-amber-500' />
              </div>
              <div>
                <p className='font-bold text-sm text-foreground/80'>
                  Depósito Caução
                </p>
                <p className='text-xs text-muted-foreground/70'>
                  Inquilino paga 3 meses de aluguel antecipado
                </p>
              </div>
            </div>
            <button
              onClick={() => update('accepts_deposit', !config.accepts_deposit)}
              className={`transition-all ${config.accepts_deposit ? 'text-primary' : 'text-muted-foreground/60'}`}
            >
              {config.accepts_deposit ? (
                <ToggleRight size={32} strokeWidth={1.5} />
              ) : (
                <ToggleLeft size={32} strokeWidth={1.5} />
              )}
            </button>
          </div>

          <div className='flex items-center justify-between p-4 rounded-xl border border-border bg-muted/35'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center'>
                <User size={18} className='text-blue-500' />
              </div>
              <div>
                <p className='font-bold text-sm text-foreground/80'>Fiador</p>
                <p className='text-xs text-muted-foreground/70'>
                  Inquilino apresenta fiador com documentação para análise
                </p>
              </div>
            </div>
            <button
              onClick={() => update('accepts_guarantor', !config.accepts_guarantor)}
              className={`transition-all ${config.accepts_guarantor ? 'text-primary' : 'text-muted-foreground/60'}`}
            >
              {config.accepts_guarantor ? (
                <ToggleRight size={32} strokeWidth={1.5} />
              ) : (
                <ToggleLeft size={32} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {config.accepts_deposit && (
      <div className='lg-card lg-card-lift p-6 rounded-2xl border border-border'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center'>
              <DollarSign size={20} />
            </div>
            <div>
            <h3 className='font-bold text-foreground text-lg'>
                Configuração de Recebimento do Depósito
              </h3>
            <p className='text-sm text-muted-foreground'>
                Defina como o inquilino deverá fazer o pagamento do depósito caução.
              </p>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='flex items-center justify-between p-4 rounded-xl border border-border bg-muted/35'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                  <Copy size={18} className='text-emerald-500' />
                </div>
                <div>
                  <p className='font-bold text-sm text-foreground/80'>Pix</p>
                  <p className='text-xs text-muted-foreground/70'>Receber via chave Pix</p>
                </div>
              </div>
              <button
                onClick={() => update('pix_enabled', !config.pix_enabled)}
                className={`transition-all ${config.pix_enabled ? 'text-primary' : 'text-muted-foreground/60'}`}
              >
                {config.pix_enabled ? (
                  <ToggleRight size={32} strokeWidth={1.5} />
                ) : (
                  <ToggleLeft size={32} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {config.pix_enabled && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20'>
                <div className='space-y-2'>
                    <label className='text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest ml-1'>
                      Tipo de Chave
                    </label>
                  <select
                    value={config.pix_key_type || ''}
                    onChange={(e) => update('pix_key_type', e.target.value)}
                    className='w-full h-11 px-4 rounded-xl border border-border bg-background font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  >
                    <option value=''>Selecione...</option>
                    <option value='CPF'>CPF</option>
                    <option value='CNPJ'>CNPJ</option>
                    <option value='Email'>E-mail</option>
                    <option value='Telefone'>Telefone</option>
                    <option value='Chave aleatória'>Chave aleatória</option>
                  </select>
                </div>
                <div className='space-y-2'>
                    <label className='text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest ml-1'>
                      Chave Pix
                    </label>
                  <input
                    type='text'
                    value={config.pix_key || ''}
                    onChange={(e) => update('pix_key', e.target.value)}
                    placeholder='Digite a chave Pix'
                    className='w-full h-11 px-4 rounded-xl border border-border bg-background font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
              </div>
            )}

            <div className='flex items-center justify-between p-4 rounded-xl border border-border bg-muted/35'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <HelpCircle size={18} className='text-blue-500' />
                </div>
                <div>
                  <p className='font-bold text-sm text-foreground/80'>
                    Depósito Bancário
                  </p>
                  <p className='text-xs text-muted-foreground/70'>Receber via transferência bancária</p>
                </div>
              </div>
              <button
                onClick={() => update('bank_transfer_enabled', !config.bank_transfer_enabled)}
                className={`transition-all ${config.bank_transfer_enabled ? 'text-primary' : 'text-muted-foreground/60'}`}
              >
                {config.bank_transfer_enabled ? (
                  <ToggleRight size={32} strokeWidth={1.5} />
                ) : (
                  <ToggleLeft size={32} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {config.bank_transfer_enabled && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20'>
                <div className='space-y-2'>
                    <label className='text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest ml-1'>
                      Banco
                    </label>
                  <input
                    type='text'
                    value={config.bank_name || ''}
                    onChange={(e) => update('bank_name', e.target.value)}
                    placeholder='Ex: Itaú, Bradesco, Nubank'
                    className='w-full h-11 px-4 rounded-xl border border-border bg-background font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                    <label className='text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest ml-1'>
                      Agência
                    </label>
                  <input
                    type='text'
                    value={config.bank_agency || ''}
                    onChange={(e) => update('bank_agency', e.target.value)}
                    placeholder='Nº da agência'
                    className='w-full h-11 px-4 rounded-xl border border-border bg-background font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                    <label className='text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest ml-1'>
                      Conta
                    </label>
                  <input
                    type='text'
                    value={config.bank_account || ''}
                    onChange={(e) => update('bank_account', e.target.value)}
                    placeholder='Nº da conta'
                    className='w-full h-11 px-4 rounded-xl border border-border bg-background font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                    <label className='text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest ml-1'>
                      Tipo de Conta
                    </label>
                  <select
                    value={config.bank_account_type || ''}
                    onChange={(e) => update('bank_account_type', e.target.value)}
                    className='w-full h-11 px-4 rounded-xl border border-border bg-background font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  >
                    <option value=''>Selecione...</option>
                    <option value='Corrente'>Corrente</option>
                    <option value='Poupança'>Poupança</option>
                  </select>
                </div>
                <div className='space-y-2 md:col-span-2'>
                    <label className='text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest ml-1'>
                      Nome do Titular
                    </label>
                  <input
                    type='text'
                    value={config.account_holder_name || ''}
                    onChange={(e) => update('account_holder_name', e.target.value)}
                    placeholder='Nome completo do titular da conta'
                    className='w-full h-11 px-4 rounded-xl border border-border bg-background font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className='flex justify-end'>
        <button
          onClick={handleSave}
          disabled={saving}
          className='flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-all active:scale-95 shrink-0 bg-primary text-primary-foreground shadow-lg'
        >
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
          {!saving && !saved && <CheckCircle size={16} className='md:size-[18px]' />}
          {saved && <CheckCircle size={16} className='md:size-[18px]' />}
        </button>
      </div>
    </div>
  );
};
