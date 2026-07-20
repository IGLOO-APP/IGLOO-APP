import React from 'react';
import {
  Settings,
  Shield,
  Cpu,
  Save,
  RotateCcw,
  ToggleRight,
  Lock,
  Mail,
  Zap,
  CreditCard,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Loader2,
} from 'lucide-react';
import FeatureFlagManager from '../../components/admin/FeatureFlagManager';
import PlanManager from '../../components/admin/PlanManager';
import AdminProfile from '../../components/admin/AdminProfile';
import { useSystemSettings } from './hooks/useSystemSettings';

const SystemSettings: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    toast,
    templateContent,
    setTemplateContent,
    loadingTemplate,
    savingTemplate,
    integrations,
    notifications,
    tabs,
    handleSaveTemplate,
    handleToggle,
    testConnection,
    showToast,
  } = useSystemSettings();

  return (
    <div className='p-8 space-y-8 animate-fadeIn relative'>
      {toast && (
        <div
          className={`fixed top-8 right-8 z-50 px-6 py-3 rounded-2xl text-white font-bold shadow-2xl animate-slideDown ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          {toast.message}
        </div>
      )}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white tracking-tight'>
            Configurações do Sistema
          </h2>
          <p className='text-sm text-slate-500'>
            Controle global da plataforma e parâmetros técnicos.
          </p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={() => {
              setTemplateContent(templateContent);
              showToast('Alterações descartadas.', 'success');
            }}
            className='flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all'
          >
            <RotateCcw size={18} />
            Descartar
          </button>
          <button
            onClick={() => handleSaveTemplate()}
            className='flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all'
          >
            <Save size={18} />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Navigation Tabs */}
        <aside className='lg:w-64 space-y-1'>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab
                  ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </aside>

        <div className='flex-1 space-y-6'>
          {activeTab === 'Perfil' ? (
            <AdminProfile />
          ) : (
            <div className='bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-8'>
              {activeTab === 'Geral' && (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-400 uppercase tracking-widest px-1'>
                        Nome da Plataforma
                      </label>
                      <input
                        type='text'
                        defaultValue='Igloo Gestão Imobiliária'
                        className='w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-400 uppercase tracking-widest px-1'>
                        URL de Suporte
                      </label>
                      <input
                        type='text'
                        defaultValue='https://suporte.igloo.pt'
                        className='w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-400 uppercase tracking-widest px-1'>
                        E-mail de Contato Principal
                      </label>
                      <input
                        type='email'
                        defaultValue='contato@igloo.pt'
                        className='w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-400 uppercase tracking-widest px-1'>
                        Idioma Padrão
                      </label>
                      <select className='w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium appearance-none'>
                        <option>Português (Brasil)</option>
                        <option>Português (Portugal)</option>
                        <option>English (US)</option>
                      </select>
                    </div>
                  </div>

                  <div className='pt-6 border-t border-gray-50 dark:border-white/5 space-y-6'>
                    <h4 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                      <Zap className='text-primary' size={20} />
                      Limites Globais
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1'>
                          Max Imóveis (Free)
                        </p>
                        <input
                          type='number'
                          defaultValue='1'
                          className='bg-transparent border-none p-0 text-xl font-bold dark:text-white w-full'
                        />
                      </div>
                      <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1'>
                          Max Fotos / Imóvel
                        </p>
                        <input
                          type='number'
                          defaultValue='20'
                          className='bg-transparent border-none p-0 text-xl font-bold dark:text-white w-full'
                        />
                      </div>
                      <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1'>
                          Backup Retenção (Dias)
                        </p>
                        <input
                          type='number'
                          defaultValue='30'
                          className='bg-transparent border-none p-0 text-xl font-bold dark:text-white w-full'
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Planos' && <PlanManager />}

              {activeTab === 'Feature Flags' && <FeatureFlagManager />}

              {activeTab === 'Integrações' && (
                <div className='space-y-10'>
                  <section className='space-y-4'>
                    <h4 className='text-xs font-black text-slate-400 uppercase tracking-widest px-1'>
                      PAGAMENTOS
                    </h4>
                    <div className='grid grid-cols-1 gap-4'>
                      <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6'>
                        <div className='flex items-center gap-4'>
                          <div className='w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20'>
                            <CreditCard size={28} />
                          </div>
                          <div>
                            <h5 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                              Stripe
                              <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
                              <span className='text-[10px] text-emerald-500 font-black uppercase tracking-tighter'>
                                Online
                              </span>
                            </h5>
                            <p className='text-xs text-slate-500'>
                              Processamento de cartões e recorrência (MRR).
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={() => testConnection('Stripe')}
                            className='px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all'
                          >
                            Testar conexão
                          </button>
                          <button className='px-6 py-2 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 transition-all'>
                            Gerenciar
                          </button>
                          <button
                            onClick={() => handleToggle('stripe', true)}
                            className='text-primary'
                          >
                            <ToggleRight size={40} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6'>
                        <div className='flex items-center gap-4'>
                          <div className='w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                            <CheckCircle size={28} />
                          </div>
                          <div className='space-y-1'>
                            <h5 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                              ClickSign
                              <span className='px-2 py-0.5 rounded-lg bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-tighter'>
                                Erro de conexão
                              </span>
                            </h5>
                            <div className='flex items-center gap-2'>
                              <input
                                type='password'
                                value={integrations.clicksign.apiKey}
                                className='bg-white/5 border-none p-0 text-xs font-mono text-slate-500 w-32 focus:ring-0'
                                readOnly
                              />
                              <button className='text-[10px] font-bold text-primary hover:underline'>
                                Alterar Key
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={() => testConnection('ClickSign')}
                            className='px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all'
                          >
                            Testar conexão
                          </button>
                          <button className='px-6 py-2 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 transition-all'>
                            Configurar
                          </button>
                          <button
                            onClick={() => handleToggle('clicksign', true)}
                            className='text-primary'
                          >
                            <ToggleRight size={40} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className='space-y-4'>
                    <h4 className='text-xs font-black text-slate-400 uppercase tracking-widest px-1'>
                      COMUNICAÇÃO
                    </h4>
                    <div className='grid grid-cols-1 gap-4'>
                      <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6'>
                        <div className='flex items-center gap-4'>
                          <div className='w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20'>
                            <MessageSquare size={28} />
                          </div>
                          <div>
                            <h5 className='font-bold text-slate-900 dark:text-white'>
                              WhatsApp Business API
                            </h5>
                            <p className='text-xs text-slate-500'>
                              Envio de notificações por WhatsApp.
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={() => handleToggle('whatsapp', false)}
                            className='text-slate-300'
                          >
                            <ToggleRight size={40} strokeWidth={1.5} className='rotate-180' />
                          </button>
                        </div>
                      </div>

                      <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 space-y-6'>
                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                          <div className='flex items-center gap-4'>
                            <div className='w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20'>
                              <Mail size={28} />
                            </div>
                            <div>
                              <h5 className='font-bold text-slate-900 dark:text-white'>
                                SMTP / E-mail
                              </h5>
                              <p className='text-xs text-slate-500'>
                                Servidor de e-mail transacional próprio.
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={() => testConnection('SMTP')}
                              className='px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all'
                            >
                              Testar SMTP
                            </button>
                          </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                          <div className='space-y-1'>
                            <label className='text-[10px] font-bold text-slate-400 uppercase px-1'>
                              Host
                            </label>
                            <input
                              type='text'
                              value={integrations.smtp.host}
                              className='w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm'
                            />
                          </div>
                          <div className='space-y-1'>
                            <label className='text-[10px] font-bold text-slate-400 uppercase px-1'>
                              Porta
                            </label>
                            <input
                              type='text'
                              value={integrations.smtp.port}
                              className='w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm'
                            />
                          </div>
                          <div className='space-y-1'>
                            <label className='text-[10px] font-bold text-slate-400 uppercase px-1'>
                              Usuário
                            </label>
                            <input
                              type='text'
                              value={integrations.smtp.user}
                              className='w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm'
                            />
                          </div>
                          <div className='space-y-1'>
                            <label className='text-[10px] font-bold text-slate-400 uppercase px-1'>
                              Senha
                            </label>
                            <input
                              type='password'
                              value={integrations.smtp.pass}
                              className='w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Notificações' && (
                <div className='space-y-10'>
                  <section className='space-y-4'>
                    <h4 className='text-xs font-black text-slate-400 uppercase tracking-widest px-1'>
                      NOTIFICAÇÕES DO SISTEMA — ADMIN
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {[
                        {
                          id: 'newOwner',
                          label: 'Novo proprietário cadastrado',
                          email: notifications.admin.newOwner.email,
                        },
                        {
                          id: 'integrationError',
                          label: 'Erro em integração',
                          email: notifications.admin.integrationError.email,
                        },
                        { id: 'paymentReceived', label: 'Pagamento de assinatura recebido' },
                        {
                          id: 'churnDetected',
                          label: 'Churn detectado',
                          email: notifications.admin.churnDetected.email,
                        },
                        { id: 'backupCompleted', label: 'Backup concluído' },
                        { id: 'suspiciousLogin', label: 'Acesso suspeito', mandatory: true },
                      ].map((notif) => (
                        <div
                          key={notif.id}
                          className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 space-y-3'
                        >
                          <div className='flex items-center justify-between'>
                            <span className='font-bold text-slate-700 dark:text-white text-sm'>
                              {notif.label}
                            </span>
                            <div className='flex items-center gap-2'>
                              {notif.mandatory && (
                                <span className='px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-500 text-[8px] font-black uppercase tracking-tighter'>
                                  Obrigatório
                                </span>
                              )}
                              <button
                                disabled={notif.mandatory}
                                onClick={() =>
                                  handleToggle(`notifications.admin.${notif.id}`, true)
                                }
                                className={
                                  notif.mandatory ? 'text-primary opacity-50' : 'text-primary'
                                }
                              >
                                <ToggleRight size={32} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                          {notif.email !== undefined && (
                            <input
                              type='email'
                              defaultValue={notif.email}
                              className='w-full px-4 py-2 bg-white dark:bg-white/5 border border-transparent rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-xs'
                              placeholder='Email de destino'
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className='space-y-4'>
                    <h4 className='text-xs font-black text-slate-400 uppercase tracking-widest px-1'>
                      NOTIFICAÇÕES GLOBAIS — PROPRIETÁRIOS
                    </h4>
                    <div className='grid grid-cols-1 gap-4'>
                      <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 space-y-6'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <Calendar className='text-primary' size={20} />
                            <h5 className='font-bold text-slate-900 dark:text-white'>
                              Lembrete de vencimento de contrato
                            </h5>
                          </div>
                          <button
                            onClick={() =>
                              handleToggle('notifications.owners.contractExpiry', true)
                            }
                            className='text-primary'
                          >
                            <ToggleRight size={32} strokeWidth={1.5} />
                          </button>
                        </div>
                        <div className='flex items-center gap-3'>
                          <span className='text-sm text-slate-500'>Enviar lembrete</span>
                          <input
                            type='number'
                            defaultValue={notifications.owners.contractExpiry.daysBefore}
                            className='w-20 px-4 py-2 bg-white dark:bg-white/5 border border-transparent rounded-xl focus:ring-2 focus:ring-primary outline-none text-center font-bold dark:text-white'
                          />
                          <span className='text-sm text-slate-500'>dias antes do vencimento.</span>
                        </div>
                      </div>

                      <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <AlertTriangle className='text-orange-500' size={20} />
                            <h5 className='font-bold text-slate-900 dark:text-white'>
                              Alerta de inadimplência
                            </h5>
                          </div>
                          <button
                            onClick={() => handleToggle('notifications.owners.delinquency', true)}
                            className='text-primary'
                          >
                            <ToggleRight size={32} strokeWidth={1.5} />
                          </button>
                        </div>
                        <div className='flex items-center gap-3'>
                          <span className='text-sm text-slate-500'>Notificar após</span>
                          <input
                            type='number'
                            defaultValue={notifications.owners.delinquency.daysAfter}
                            className='w-20 px-4 py-2 bg-white dark:bg-white/5 border border-transparent rounded-xl focus:ring-2 focus:ring-primary outline-none text-center font-bold dark:text-white'
                          />
                          <span className='text-sm text-slate-500'>dias de atraso.</span>
                        </div>
                      </div>

                      <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-[32px] border border-gray-100 dark:border-white/5 space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <Settings className='text-slate-400' size={20} />
                            <h5 className='font-bold text-slate-900 dark:text-white'>
                              Aviso de manutenção programada
                            </h5>
                          </div>
                          <button
                            onClick={() => handleToggle('notifications.owners.maintenance', false)}
                            className='text-slate-300'
                          >
                            <ToggleRight size={32} strokeWidth={1.5} className='rotate-180' />
                          </button>
                        </div>
                        <textarea
                          defaultValue={notifications.owners.maintenance.message}
                          rows={3}
                          className='w-full px-5 py-3.5 bg-white dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium text-sm resize-none'
                          placeholder='Mensagem para os proprietários...'
                        />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Segurança' && (
                <div className='space-y-6'>
                  <div className='p-6 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-3xl flex items-start gap-4'>
                    <div className='p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20'>
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 className='font-bold text-rose-900 dark:text-rose-400'>
                        Proteção de Força Bruta
                      </h4>
                      <p className='text-sm text-rose-800/70 dark:text-rose-400/70'>
                        O sistema está configurado para bloquear IPs após 5 tentativas de login
                        mal-sucedidas em 10 minutos.
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='p-6 border border-gray-100 dark:border-white/5 rounded-[32px] space-y-4'>
                      <div className='flex items-center gap-3 text-slate-900 dark:text-white font-bold'>
                        <Lock size={20} className='text-primary' />
                        <span>Políticas de Senha</span>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-slate-500'>Mínimo de caracteres</span>
                          <span className='font-bold dark:text-white'>8</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-slate-500'>Exigir letras maiúsculas</span>
                          <div className='w-10 h-5 bg-primary rounded-full relative'>
                            <div className='absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full'></div>
                          </div>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-slate-500'>Exigir caracteres especiais</span>
                          <div className='w-10 h-5 bg-primary rounded-full relative'>
                            <div className='absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full'></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='p-6 border border-gray-100 dark:border-white/5 rounded-[32px] space-y-4'>
                      <div className='flex items-center gap-3 text-slate-900 dark:text-white font-bold'>
                        <Cpu size={20} className='text-primary' />
                        <span>Logs de Auditoria</span>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-slate-500'>Retenção de Logs</span>
                          <span className='font-bold dark:text-white'>90 dias</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-slate-500'>Log de Visualização de Dados</span>
                          <div className='w-10 h-5 bg-slate-200 dark:bg-white/10 rounded-full relative'>
                            <div className='absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full'></div>
                          </div>
                        </div>
                        <button className='w-full text-center py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-all'>
                          Baixar Backup Completo de Logs
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Minutas' && (
                <div className='space-y-6 animate-fadeIn'>
                  <div className='flex flex-col md:flex-row items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/5'>
                    <div>
                      <h4 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg'>
                        <FileText className='text-primary' size={22} />
                        Edição Global de Minuta de Contrato
                      </h4>
                      <p className='text-xs text-slate-500 mt-1 font-medium'>
                        Edite as cláusulas contratuais globais. Todas as novas minutas criadas por
                        proprietários herdarão este texto.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate || loadingTemplate}
                      className='flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 transition-all active:scale-95'
                    >
                      {savingTemplate ? (
                        <Loader2 className='animate-spin' size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {savingTemplate ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>

                  {loadingTemplate ? (
                    <div className='flex flex-col items-center justify-center py-20 text-slate-400'>
                      <Loader2 className='animate-spin mb-2' size={32} />
                      <p className='text-xs font-bold uppercase tracking-widest'>
                        Carregando minuta global...
                      </p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                      {/* Editor Panel */}
                      <div className='lg:col-span-2 space-y-4'>
                        <div className='bg-slate-50 dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex flex-col h-[600px]'>
                          <div className='flex justify-between items-center mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1'>
                            <span>Editor de Minuta Padrão (Kitnet)</span>
                            <span className='text-primary animate-pulse'>Editando Modo Seguro</span>
                          </div>
                          <textarea
                            value={templateContent}
                            onChange={(e) => setTemplateContent(e.target.value)}
                            className='flex-1 w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 rounded-xl p-5 text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none resize-none shadow-inner overflow-y-auto'
                            placeholder='Digite o texto da minuta aqui...'
                          />
                        </div>
                      </div>

                      {/* Placeholder Guide Panel */}
                      <div className='space-y-6'>
                        <div className='bg-slate-50 dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-white/5 p-6 space-y-4'>
                          <h5 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider'>
                            <Settings size={18} className='text-primary' />
                            Campos Dinâmicos
                          </h5>
                          <p className='text-xs text-slate-500 leading-relaxed'>
                            Use as tags dinâmicas abaixo exatamente como escritas para que o
                            assistente substitua automaticamente pelas informações reais do imóvel,
                            proprietário e inquilino.
                          </p>

                          <div className='space-y-4 pt-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar'>
                            {[
                              { tag: '{{nome_proprietario}}', label: 'Nome do Proprietário' },
                              { tag: '{{cpf_proprietario}}', label: 'CPF do Proprietário' },
                              {
                                tag: '{{endereco_proprietario}}',
                                label: 'Endereço do Proprietário',
                              },
                              { tag: '{{nome_inquilino}}', label: 'Nome do Inquilino' },
                              { tag: '{{cpf_inquilino}}', label: 'CPF do Inquilino' },
                              { tag: '{{email_inquilino}}', label: 'E-mail do Inquilino' },
                              { tag: '{{profissao_inquilino}}', label: 'Profissão do Inquilino' },
                              { tag: '{{endereco_imovel}}', label: 'Endereço Completo do Imóvel' },
                              { tag: '{{valor_aluguel}}', label: 'Aluguel Mensal formatado' },
                              {
                                tag: '{{dia_vencimento}}',
                                label: 'Dia de Vencimento (PIX/Boleto)',
                              },
                              { tag: '{{valor_caucao}}', label: 'Valor do depósito de garantia' },
                              { tag: '{{duracao_meses}}', label: 'Duração do Contrato (meses)' },
                              { tag: '{{data_inicio}}', label: 'Data de Início (dd/mm/aaaa)' },
                              { tag: '{{data_fim}}', label: 'Data de Término (dd/mm/aaaa)' },
                              {
                                tag: '{{valor_taxa_rateio}}',
                                label: 'Taxa de Rateio Fixa (se aplicável)',
                              },
                              {
                                tag: '{{multa_rescisoria_meses}}',
                                label: 'Multa Rescisória (meses)',
                              },
                              {
                                tag: '{{periodo_lockin}}',
                                label: 'Período mínimo de permanência (meses)',
                              },
                              { tag: '{{cidade_contrato}}', label: 'Cidade do Foro e Assinatura' },
                              { tag: '{{data_hoje}}', label: 'Data Atual (dd/mm/aaaa)' },
                            ].map((item) => (
                              <div
                                key={item.tag}
                                onClick={() => {
                                  navigator.clipboard.writeText(item.tag);
                                  showToast(item.tag);
                                }}
                                className='group p-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 hover:border-primary/40 rounded-xl flex items-center justify-between gap-3 cursor-pointer shadow-sm hover:shadow transition-all'
                              >
                                <div className='flex flex-col min-w-0'>
                                  <span className='text-[10px] font-black font-mono text-primary group-hover:scale-105 transition-transform'>
                                    {item.tag}
                                  </span>
                                  <span className='text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium'>
                                    {item.label}
                                  </span>
                                </div>
                                <span className='text-[8px] bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 px-2 py-1 rounded font-bold uppercase group-hover:bg-primary group-hover:text-slate-900 transition-all'>
                                  Copiar
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
