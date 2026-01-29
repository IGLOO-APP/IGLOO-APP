
import React, { useState, useEffect } from 'react';
import { Copy, MapPin, CheckCircle, Clock, FileText, AlertTriangle, ChevronRight, Bell, Moon, Sun, User, Settings, LogOut, Download, Barcode, Printer, Share2, X, CreditCard, Lock, Loader, ClipboardCheck, MessageCircle, Key, Camera, Info, Star, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { PropertyInspection } from '../../components/properties/PropertyInspection';
import { Property } from '../../types';

const TenantDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, triggerTestNotification } = useNotification();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'late'>('pending');
  const [copied, setCopied] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Inspection State
  const [showInspection, setShowInspection] = useState(false);
  
  // Mock Tenant Property for Inspection
  const mockTenantProperty: Property = {
      id: 101,
      name: 'Meu Apartamento',
      address: 'Rua das Flores, 123 - Apt 101',
      status: 'ALUGADO',
      price: 'R$ 1.500',
      area: '45m²',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=300',
      tenant: {
          id: user?.id || 't1',
          name: user?.name || 'Inquilino',
          email: user?.email || '',
          phone: '',
          status: 'active'
      }
  };
  
  // Invoice Modal State
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceCopied, setInvoiceCopied] = useState(false);

  // Credit Card Modal State
  const [showCreditCard, setShowCreditCard] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleCopyPix = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyBarcode = () => {
     navigator.clipboard.writeText('34191.79001 01043.510047 91020.150008 5 89230000015000');
     setInvoiceCopied(true);
     setTimeout(() => setInvoiceCopied(false), 2000);
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    setTimeout(() => {
        setProcessingPayment(false);
        setPaymentSuccess(true);
        setPaymentStatus('paid');
        setTimeout(() => {
            setShowCreditCard(false);
            setPaymentSuccess(false);
        }, 2000);
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto md:max-w-4xl md:px-6">
      <header className="flex items-center px-6 py-5 justify-between sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm transition-colors">
        <div className="relative z-30">
            <div 
                onClick={handleUserMenuClick}
                className="flex items-center gap-3 cursor-pointer p-1 -ml-1 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors select-none group"
            >
                <div className="relative">
                    <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 border-2 border-primary shadow-sm group-hover:border-primary-dark transition-colors"
                    style={{ backgroundImage: `url("${user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf'}")` }}
                    ></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></div>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Olá,</p>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">{user?.name || 'Inquilino'}</h2>
                </div>
            </div>

            {showUserMenu && (
                <>
                    <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 animate-scaleUp origin-top-left z-30">
                        <button onClick={() => { setShowUserMenu(false); logout(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium flex items-center gap-2 transition-colors">
                            <LogOut size={16} /> Sair da conta
                        </button>
                    </div>
                </>
            )}
        </div>

        <div className="flex items-center gap-3 relative z-30">
            <button 
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-slate-800 dark:text-white relative transition-all ${showNotifications ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>}
                </button>
                {showNotifications && (
                    <>
                        <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowNotifications(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 animate-scaleUp origin-top-right z-30 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-primary font-bold hover:underline">
                                        Ler tudo
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => { markAsRead(notif.id); if(notif.link) navigate(notif.link); }}
                                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 transition-colors ${!notif.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div>
                                                <p className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                            {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                        Nenhuma notificação
                                    </div>
                                )}
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-center">
                                <button onClick={triggerTestNotification} className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors">
                                    Simular Notificação (Teste)
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      {/* ALERT: PENDING INSPECTION REVIEW */}
      <div className="px-6 mb-4">
          <button 
            onClick={() => setShowInspection(true)}
            className="w-full bg-[#111111] dark:bg-black border border-orange-500/50 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:border-orange-500 cursor-pointer transition-all active:scale-[0.98] group text-left relative overflow-hidden"
          >
              <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20">
                      <ClipboardCheck size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-base">Vistoria Pendente</h4>
                      <p className="text-sm text-orange-200/70 mt-0.5">Você tem 48h para revisar a vistoria.</p>
                  </div>
              </div>
              <ChevronRight className="text-orange-500 group-hover:translate-x-1 transition-transform" size={24} />
          </button>
      </div>

      {/* RICH PAYMENT CARD */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Próximo Vencimento</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">R$ 1.500,00</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : paymentStatus === 'late' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {paymentStatus === 'paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                            {paymentStatus === 'paid' ? 'Pago' : paymentStatus === 'late' ? 'Atrasado' : 'A Vencer: 10 Mar'}
                        </span>
                    </div>
                </div>
             </div>

             {/* Breakdown */}
             <div className="flex gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar">
                 <div className="shrink-0">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Aluguel</p>
                     <p className="font-bold text-slate-700 dark:text-slate-300">R$ 1.200</p>
                 </div>
                 <div className="shrink-0">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Condomínio</p>
                     <p className="font-bold text-slate-700 dark:text-slate-300">R$ 200</p>
                 </div>
                 <div className="shrink-0">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">IPTU</p>
                     <p className="font-bold text-slate-700 dark:text-slate-300">R$ 100</p>
                 </div>
             </div>

             <div className="space-y-3">
                <button 
                    onClick={handleCopyPix}
                    className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 dark:shadow-none"
                >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    {copied ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowCreditCard(true)}
                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                    >
                        <CreditCard size={18} />
                        Cartão
                    </button>
                    <button 
                        onClick={() => setShowInvoice(true)}
                        className="flex-1 h-12 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <Barcode size={18} />
                        Boleto
                    </button>
                </div>
             </div>

             {/* Inline History */}
             <div className="mt-6 pt-2">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Últimos Pagamentos</p>
                 <div className="space-y-3">
                     {[
                         { date: '05/02', status: 'paid' },
                         { date: '04/01', status: 'paid' },
                         { date: '05/12', status: 'late' }
                     ].map((p, i) => (
                         <div key={i} className="flex items-center justify-between text-sm">
                             <span className="text-slate-600 dark:text-slate-400 font-medium">{p.date}</span>
                             <span className={`text-xs font-bold ${p.status === 'paid' ? 'text-emerald-500' : 'text-red-500'}`}>
                                 {p.status === 'paid' ? '✓ Pago' : '⚠️ Atrasado 2 dias'}
                             </span>
                         </div>
                     ))}
                     <button onClick={() => navigate('/tenant/payments')} className="text-xs font-bold text-primary hover:underline w-full text-center mt-2">Ver histórico completo</button>
                 </div>
             </div>
        </div>
      </div>

      {/* QUICK ACCESS GRID */}
      <div className="px-6 mb-6">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Acesso Rápido</h3>
         <div className="grid grid-cols-4 gap-3">
            {[
                { icon: Camera, label: 'Enviar Foto', color: 'bg-blue-100 text-blue-600', action: () => navigate('/tenant/maintenance') },
                { icon: FileText, label: 'Docs', color: 'bg-purple-100 text-purple-600', action: () => navigate('/tenant/profile') },
                { icon: MessageCircle, label: 'Chat', color: 'bg-emerald-100 text-emerald-600', action: () => navigate('/tenant/maintenance') },
                { icon: Key, label: 'Chaves', color: 'bg-amber-100 text-amber-600', action: () => alert('Solicitação de chave enviada!') },
            ].map((item, i) => (
                <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${item.color} dark:bg-opacity-20`}>
                        <item.icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{item.label}</span>
                </button>
            ))}
         </div>
      </div>

      {/* WIDGETS ROW */}
      <div className="px-6 mb-24 space-y-6">
          
          {/* Condo Notices */}
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-slate-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Avisos do Condomínio</h4>
              </div>
              <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                      <div className="w-1 h-8 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                      <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Manutenção do Elevador</p>
                          <p className="text-[10px] text-slate-500">Dia 20/03 das 09h às 12h.</p>
                      </div>
                  </div>
                  <div className="flex gap-3 items-start">
                      <div className="w-1 h-8 bg-orange-500 rounded-full shrink-0 mt-1"></div>
                      <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Reunião de Assembleia</p>
                          <p className="text-[10px] text-slate-500">Dia 15/03 no Salão de Festas.</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Tenant Score */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-surface-dark dark:to-black rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Award size={80} />
              </div>
              <div className="flex justify-between items-start relative z-10">
                  <div>
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Seu Score</p>
                      <h3 className="text-3xl font-black mt-1 flex items-center gap-2">
                          95<span className="text-lg text-slate-400 font-medium">/100</span>
                      </h3>
                      <div className="flex gap-1 mt-2">
                          {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />)}
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-xs font-medium text-slate-300">Você é um inquilino</p>
                      <p className="text-lg font-bold text-yellow-400">5 Estrelas!</p>
                  </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-slate-300">
                  <span>Pontualidade: 100%</span>
                  <span>Cuidado: 90%</span>
              </div>
          </div>
      </div>

      {showInspection && (
          <PropertyInspection 
            property={mockTenantProperty} 
            onClose={() => setShowInspection(false)}
            initialView="list"
            isTenant={true}
          />
      )}

      {showInvoice && (
        <ModalWrapper onClose={() => setShowInvoice(false)} showCloseButton={false} className="md:max-w-3xl">
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
                <div className="flex items-center justify-between px-4 md:px-6 pt-2 pb-2 md:pb-4 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes do Boleto</h2>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" title="Baixar PDF">
                            <Download size={20} />
                        </button>
                        <button 
                            onClick={() => setShowInvoice(false)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors ml-2"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 md:px-6 bg-background-light dark:bg-background-dark scroll-smooth pb-8">
                    <div className="bg-white dark:bg-surface-dark border border-slate-400 dark:border-gray-600 font-sans text-slate-900 dark:text-white mb-4">
                        <div className="flex items-center border-b border-slate-400 dark:border-gray-600 px-3 py-2 gap-4">
                            <div className="flex items-center gap-3 px-2 border-r-2 border-slate-400 dark:border-gray-500 pr-4">
                                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">341</div>
                                <span className="font-bold text-xl">341-7</span>
                            </div>
                            <div className="flex-1 text-right font-mono text-xs md:text-sm font-bold tracking-wider text-slate-700 dark:text-slate-200 truncate">34191.79001 01043.510047 91020.150008 5 89230000015000</div>
                        </div>
                        <div className="p-4 text-center">
                            <p className="font-bold text-lg mb-2">R$ 1.500,00</p>
                            <p className="text-sm text-slate-500">Vencimento: 10/03/2024</p>
                        </div>
                    </div>
                </div>
                <div className="flex-none p-4 md:p-6 pt-2 bg-background-light dark:bg-background-dark border-t border-transparent z-20">
                    <button onClick={handleCopyBarcode} className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 dark:shadow-none whitespace-nowrap">
                        {invoiceCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                        {invoiceCopied ? 'Código Copiado!' : 'Copiar Código de Barras'}
                    </button>
                </div>
            </div>
        </ModalWrapper>
     )}

     {showCreditCard && (
        <ModalWrapper onClose={() => setShowCreditCard(false)} title="Pagar com Cartão" showCloseButton={true}>
             <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {paymentSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10 animate-scaleUp">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-2">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pagamento Confirmado!</h3>
                        </div>
                    ) : (
                        <form id="card-form" onSubmit={handleCardPayment} className="space-y-6 animate-fadeIn">
                             <div className="w-full aspect-[1.586] rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                                <CreditCard size={24} className="opacity-80" />
                                <p className="font-mono text-xl tracking-wider">•••• •••• •••• ••••</p>
                            </div>
                            <div className="p-4 text-center text-sm text-slate-500">Formulário de cartão simulado. Clique em Pagar.</div>
                        </form>
                    )}
                </div>
                {!paymentSuccess && (
                    <div className="p-6 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5 z-20">
                        <button form="card-form" type="submit" disabled={processingPayment} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                            {processingPayment ? <Loader className="animate-spin" size={24} /> : <><CreditCard size={24} /> Pagar Agora</>}
                        </button>
                    </div>
                )}
            </div>
        </ModalWrapper>
     )}
    </div>
  );
};

export default TenantDashboard;
