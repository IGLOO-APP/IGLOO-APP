import React, { useState, useEffect } from 'react';
import { Copy, MapPin, CheckCircle, Clock, FileText, AlertTriangle, ChevronRight, Bell, Moon, Sun, User, Settings, LogOut, Download, Barcode, Printer, Share2, X, CreditCard, Lock, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ModalWrapper } from '../../components/ui/ModalWrapper';

const TenantDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'late'>('pending');
  const [copied, setCopied] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  // Invoice Modal State
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceCopied, setInvoiceCopied] = useState(false);

  // Credit Card Modal State
  const [showCreditCard, setShowCreditCard] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [installments, setInstallments] = useState(1);

  const latestMessage = {
    id: 1,
    subject: "Aviso sobre vistoria anual",
    preview: "Olá João, gostaria de agendar a vistoria anual do imóvel para a próxima semana. Por favor, me informe qual...",
    date: "Hoje, 09:30",
    isRead: false
  };

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

  const notifications = [
    { 
      id: 0, 
      title: 'Mensagem do Proprietário', 
      desc: latestMessage.subject, 
      time: 'Agora', 
      type: 'message',
      path: '/tenant/maintenance'
    },
    { 
      id: 1, 
      title: 'Fatura Disponível', 
      desc: 'O boleto de Março já pode ser pago.', 
      time: '2 h', 
      type: 'info',
      path: '/tenant/payments'
    },
    { 
      id: 2, 
      title: 'Aviso de Manutenção', 
      desc: 'Manutenção no elevador dia 15/03', 
      time: '1 dia', 
      type: 'alert',
      path: '/tenant/maintenance'
    },
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setHasUnread(false);
    setShowUserMenu(false);
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

  const cycleStatus = () => {
    if (paymentStatus === 'pending') setPaymentStatus('paid');
    else if (paymentStatus === 'paid') setPaymentStatus('late');
    else setPaymentStatus('pending');
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    // Simulate API delay
    setTimeout(() => {
        setProcessingPayment(false);
        setPaymentSuccess(true);
        setPaymentStatus('paid'); // Update main dashboard status
        
        // Close modal after success message
        setTimeout(() => {
            setShowCreditCard(false);
            setPaymentSuccess(false);
            setInstallments(1);
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
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                        </div>
                        
                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary font-medium flex items-center gap-2 transition-colors">
                            <User size={16} /> Meu Perfil
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary font-medium flex items-center gap-2 transition-colors">
                            <Settings size={16} /> Configurações
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                        <button 
                            onClick={() => { setShowUserMenu(false); logout(); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium flex items-center gap-2 transition-colors"
                        >
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
                    onClick={handleNotificationClick}
                    className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-slate-800 dark:text-white relative transition-all ${showNotifications ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <Bell size={20} />
                    {hasUnread && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>}
                </button>

                {showNotifications && (
                    <>
                        <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowNotifications(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 animate-scaleUp origin-top-right z-30">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notificações</h3>
                                <button className="text-xs text-primary font-bold hover:underline">Marcar lidas</button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => {
                                            if (notif.path) navigate(notif.path);
                                            setShowNotifications(false);
                                        }}
                                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer transition-colors flex gap-3 group"
                                    >
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                            notif.type === 'message' ? 'bg-indigo-500' :
                                            notif.type === 'info' ? 'bg-blue-500' : 'bg-red-500'
                                        }`}></div>
                                        <div>
                                            <p className={`text-sm font-bold ${notif.type === 'message' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{notif.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{notif.desc}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{notif.time} atrás</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      <div className="px-6 mb-6">
        <div 
            onClick={() => navigate('/tenant/maintenance')}
            className="group bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3')` }}></div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wide mb-0.5">Mensagem do Proprietário</p>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{latestMessage.subject}</h3>
                    </div>
                </div>
                <span className="text-[10px] text-blue-500 font-bold bg-white dark:bg-blue-900/30 px-2 py-1 rounded-full shadow-sm">{latestMessage.date}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 leading-relaxed line-clamp-2 pl-[52px]">{latestMessage.preview}</p>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Próximo Vencimento</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">R$ 1.500,00</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Vence em 10 de Março</p>
                </div>
                <div 
                    onClick={cycleStatus} 
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
                        paymentStatus === 'pending' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                        paymentStatus === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                        'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    }`}
                >
                    {paymentStatus === 'pending' ? <Clock size={24} /> : 
                     paymentStatus === 'paid' ? <CheckCircle size={24} /> : 
                     <AlertTriangle size={24} />}
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
                <button 
                    onClick={() => setShowCreditCard(true)}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                >
                    <CreditCard size={18} />
                    Pagar com Cartão
                </button>
                <button 
                    onClick={() => setShowInvoice(true)}
                    className="w-full h-12 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    <FileText size={18} />
                    Visualizar Boleto
                </button>
             </div>
        </div>
      </div>

      <div className="px-6 pb-24">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Acesso Rápido</h3>
         <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => navigate('/tenant/maintenance')}
                className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors text-left group"
            >
                <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900/10 rounded-xl flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={20} />
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Reportar Problema</p>
                <p className="text-slate-400 text-xs mt-0.5">Manutenção e reparos</p>
            </button>
            <button 
                onClick={() => navigate('/tenant/profile')}
                className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors text-left group"
            >
                <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Meu Contrato</p>
                <p className="text-slate-400 text-xs mt-0.5">Ver documentos</p>
            </button>
         </div>
      </div>

      {showInvoice && (
        <ModalWrapper onClose={() => setShowInvoice(false)} showCloseButton={false} className="md:max-w-3xl">
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
                
                {/* Custom Header */}
                <div className="flex items-center justify-between px-4 md:px-6 pt-2 pb-2 md:pb-4 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes do Boleto</h2>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" title="Baixar PDF">
                            <Download size={20} />
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" title="Compartilhar">
                            <Share2 size={20} />
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
                    
                    {/* Boleto Container */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-400 dark:border-gray-600 font-sans text-slate-900 dark:text-white mb-4">
                        
                        {/* Header: Bank & Line */}
                        <div className="flex items-center border-b border-slate-400 dark:border-gray-600 px-3 py-2 gap-4">
                            <div className="flex items-center gap-3 px-2 border-r-2 border-slate-400 dark:border-gray-500 pr-4">
                                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    341
                                </div>
                                <span className="font-bold text-xl">341-7</span>
                            </div>
                            <div className="flex-1 text-right font-mono text-xs md:text-sm font-bold tracking-wider text-slate-700 dark:text-slate-200 truncate">
                                34191.79001 01043.510047 91020.150008 5 89230000015000
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Left Column (Main Info) */}
                            <div className="w-full md:w-3/4 border-b md:border-b-0 md:border-r border-slate-400 dark:border-gray-600">
                                
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-3">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Local de Pagamento</p>
                                    <p className="text-xs font-semibold">PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO</p>
                                </div>

                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-3">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Beneficiário</p>
                                    <p className="text-xs font-semibold">IMOBILIÁRIA IGLOO LTDA - CNPJ: 12.345.678/0001-90</p>
                                    <p className="text-[10px] text-slate-400">Av. Paulista, 1000 - São Paulo/SP</p>
                                </div>

                                <div className="grid grid-cols-12 border-b border-slate-400 dark:border-gray-600">
                                    <div className="col-span-3 p-1.5 px-3 border-r border-slate-400 dark:border-gray-600">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Data Doc.</p>
                                        <p className="text-xs">05/03/2024</p>
                                    </div>
                                    <div className="col-span-3 p-1.5 px-3 border-r border-slate-400 dark:border-gray-600">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Nº Doc.</p>
                                        <p className="text-xs">102030</p>
                                    </div>
                                    <div className="col-span-2 p-1.5 px-3 border-r border-slate-400 dark:border-gray-600">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Espécie</p>
                                        <p className="text-xs">RC</p>
                                    </div>
                                    <div className="col-span-2 p-1.5 px-3 border-r border-slate-400 dark:border-gray-600">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Aceite</p>
                                        <p className="text-xs">N</p>
                                    </div>
                                    <div className="col-span-2 p-1.5 px-3">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Processam.</p>
                                        <p className="text-xs">05/03/24</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 border-b border-slate-400 dark:border-gray-600">
                                    <div className="col-span-3 p-1.5 px-3 border-r border-slate-400 dark:border-gray-600">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Carteira</p>
                                        <p className="text-xs">109</p>
                                    </div>
                                    <div className="col-span-3 p-1.5 px-3 border-r border-slate-400 dark:border-gray-600">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Espécie</p>
                                        <p className="text-xs">R$</p>
                                    </div>
                                    <div className="col-span-6 p-1.5 px-3">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Quantidade</p>
                                        <p className="text-xs"></p>
                                    </div>
                                </div>

                                {/* Instructions / Breakdown Area */}
                                <div className="p-3 h-full min-h-[220px] flex flex-col relative">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Instruções</p>
                                    
                                    <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300 font-medium mb-6">
                                        <p>• MULTA DE R$ 30,00 APÓS O VENCIMENTO.</p>
                                        <p>• JUROS DE R$ 1,50 AO DIA.</p>
                                        <p>• NÃO RECEBER APÓS 30 DIAS DO VENCIMENTO.</p>
                                    </div>
                                    
                                    <div className="mt-auto border-t border-dashed border-slate-300 dark:border-gray-700 pt-3">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-3">Demonstrativo</p>
                                        <div className="w-full text-xs space-y-2">
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-600 dark:text-slate-400">Aluguel (Ref. Março/24)</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">1.200,00</span>
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-600 dark:text-slate-400">Condomínio</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">250,00</span>
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-600 dark:text-slate-400">IPTU (Parcela 3/10)</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">45,00</span>
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-600 dark:text-slate-400">Taxa de Gestão</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">5,00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column (Values) - Strict Grid */}
                            <div className="w-full md:w-1/4 flex flex-col">
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 bg-orange-50 dark:bg-orange-900/10 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Vencimento</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white text-right">10/03/2024</p>
                                </div>
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Agência/Código Beneficiário</p>
                                    <p className="text-xs text-right font-mono">0001 / 12345-6</p>
                                </div>
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Nosso Número</p>
                                    <p className="text-xs text-right font-mono">109/12345678-9</p>
                                </div>
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">(=) Valor do Documento</p>
                                    <p className="text-sm font-bold text-right">R$ 1.500,00</p>
                                </div>
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">(-) Desconto / Abatimento</p>
                                    <p className="text-xs text-right">&nbsp;</p>
                                </div>
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">(-) Outras Deduções</p>
                                    <p className="text-xs text-right">&nbsp;</p>
                                </div>
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">(+) Mora / Multa</p>
                                    <p className="text-xs text-right">&nbsp;</p>
                                </div>
                                <div className="border-b border-slate-400 dark:border-gray-600 p-1.5 px-2 h-12 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">(+) Outros Acréscimos</p>
                                    <p className="text-xs text-right">&nbsp;</p>
                                </div>
                                <div className="p-1.5 px-2 bg-slate-100 dark:bg-white/5 flex-1 flex flex-col justify-center min-h-[50px]">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">(=) Valor Cobrado</p>
                                    <p className="text-lg font-bold text-right text-slate-900 dark:text-white">R$ 1.500,00</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-400 dark:border-gray-600 p-3">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pagador</p>
                            <p className="text-sm font-bold">{user?.name || 'INQUILINO'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Rua das Flores, 123 - Apt 101 - Centro - São Paulo/SP - CEP: 01000-000</p>
                        </div>

                        <div className="p-2 px-4 border-t border-dashed border-slate-400 dark:border-gray-600 text-right text-[10px] text-slate-400">
                            Autenticação Mecânica / Ficha de Compensação
                        </div>
                    </div>
                </div>

                <div className="flex-none p-4 md:p-6 pt-2 bg-background-light dark:bg-background-dark border-t border-transparent z-20">
                    <button 
                        onClick={handleCopyBarcode}
                        className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 dark:shadow-none whitespace-nowrap"
                    >
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
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs">
                                Seu pagamento de <span className="font-bold text-slate-900 dark:text-white">R$ 1.500,00</span> foi processado com sucesso. O comprovante foi enviado para seu e-mail.
                            </p>
                        </div>
                    ) : (
                        <form id="card-form" onSubmit={handleCardPayment} className="space-y-6 animate-fadeIn">
                            {/* Card Visual */}
                            <div className="w-full aspect-[1.586] rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                                
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="w-12 h-8 bg-yellow-400/80 rounded-md flex items-center justify-center">
                                        <div className="w-8 h-5 border border-black/20 rounded"></div>
                                    </div>
                                    <CreditCard size={24} className="opacity-80" />
                                </div>
                                
                                <div className="space-y-4 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Número do Cartão</p>
                                        <p className="font-mono text-xl tracking-wider">•••• •••• •••• ••••</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Titular</p>
                                            <p className="text-sm font-medium tracking-wide">NOME NO CARTÃO</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Validade</p>
                                            <p className="text-sm font-medium tracking-wide">MM/AA</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Número do Cartão</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white font-mono placeholder-slate-300 dark:placeholder-slate-600 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Nome Impresso no Cartão</label>
                                    <input 
                                        type="text" 
                                        placeholder="COMO NO CARTÃO"
                                        className="w-full px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 transition-all uppercase"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Validade</label>
                                        <input 
                                            type="text" 
                                            placeholder="MM/AA"
                                            className="w-full px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white font-mono placeholder-slate-300 dark:placeholder-slate-600 transition-all text-center"
                                            required
                                            maxLength={5}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">CVV</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="123"
                                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white font-mono placeholder-slate-300 dark:placeholder-slate-600 transition-all"
                                                required
                                                maxLength={4}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Parcelamento</label>
                                    <div className="relative">
                                        <select 
                                            value={installments}
                                            onChange={(e) => setInstallments(Number(e.target.value))}
                                            className="w-full appearance-none px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all"
                                        >
                                            <option value={1}>1x de R$ 1.500,00 (Sem juros)</option>
                                            <option value={2}>2x de R$ 750,00 (Sem juros)</option>
                                            <option value={3}>3x de R$ 500,00 (Sem juros)</option>
                                            <option value={6}>6x de R$ 265,00 (Com juros)</option>
                                            <option value={12}>12x de R$ 142,00 (Com juros)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {!paymentSuccess && (
                    <div className="p-6 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5 z-20">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Total a pagar</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">R$ 1.500,00</span>
                        </div>
                        <button 
                            form="card-form"
                            type="submit"
                            disabled={processingPayment}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                        >
                            {processingPayment ? (
                                <><Loader className="animate-spin" size={24} /> Processando...</>
                            ) : (
                                <><CreditCard size={24} /> Pagar Agora</>
                            )}
                        </button>
                        <div className="flex justify-center items-center gap-2 mt-4 text-xs text-slate-400">
                            <Lock size={12} /> Ambiente Seguro e Criptografado
                        </div>
                    </div>
                )}
            </div>
        </ModalWrapper>
     )}
    </div>
  );
};

export default TenantDashboard;