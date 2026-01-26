import React, { useState, useEffect } from 'react';
import { 
    Filter, Download, Calendar, CheckCircle, AlertTriangle, 
    ChevronDown, CreditCard, DollarSign, FileText, ArrowUpRight,
    PieChart, Clock, RefreshCw, Plus, X, Lock
} from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { SavedCards } from '../../components/payments/SavedCards';
import { PaymentForm } from '../../components/payments/PaymentForm';
import { stripeService, PaymentMethod } from '../../services/stripeService';

interface Payment {
    id: number;
    month: string;
    dueDate: string;
    paidDate?: string;
    amount: number;
    breakdown: {
        rent: number;
        condo: number;
        iptu: number;
        water?: number;
        electricity?: number;
        fine?: number;
    };
    status: 'paid' | 'pending' | 'late';
    method?: string;
}

const MOCK_PAYMENTS: Payment[] = [
    {
        id: 1,
        month: 'Março 2024',
        dueDate: '10/03/2024',
        paidDate: '08/03/2024',
        amount: 1500.00,
        breakdown: { rent: 1200, condo: 200, iptu: 100 },
        status: 'paid',
        method: 'Pix'
    },
    {
        id: 2,
        month: 'Fevereiro 2024',
        dueDate: '10/02/2024',
        paidDate: '12/02/2024',
        amount: 1515.00,
        breakdown: { rent: 1200, condo: 200, iptu: 100, fine: 15 },
        status: 'late',
        method: 'Boleto'
    },
    {
        id: 3,
        month: 'Janeiro 2024',
        dueDate: '10/01/2024',
        paidDate: '10/01/2024',
        amount: 1500.00,
        breakdown: { rent: 1200, condo: 200, iptu: 100 },
        status: 'paid',
        method: 'Pix'
    },
    {
        id: 4,
        month: 'Abril 2024',
        dueDate: '10/04/2024',
        amount: 1500.00,
        breakdown: { rent: 1200, condo: 200, iptu: 100 },
        status: 'pending'
    }
];

const TenantPayments: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [step, setStep] = useState<'details' | 'method' | 'processing' | 'success'>('details');
    
    // Stripe State
    const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(false);
    const [showAddNewCard, setShowAddNewCard] = useState(false);

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        const methods = await stripeService.getPaymentMethods();
        setSavedCards(methods);
        if (methods.length > 0) {
            setSelectedCardId(methods.find(m => m.is_default)?.id || methods[0].id);
        }
    };

    const handlePayClick = () => {
        if (selectedPayment?.status === 'pending' || selectedPayment?.status === 'late') {
            setStep('method');
        }
    };

    const processPayment = async () => {
        setIsPaying(true);
        try {
            // Simulate Stripe Flow
            await stripeService.createPaymentIntent(selectedPayment!.amount, {
                property_id: 'prop_123',
                breakdown: selectedPayment!.breakdown
            });
            
            // If new card, attach it
            if (showAddNewCard) {
                await stripeService.attachPaymentMethod({});
            }

            setStep('success');
        } catch (error) {
            console.error(error);
            alert('Erro ao processar pagamento');
        } finally {
            setIsPaying(false);
        }
    };

    const handleAutoPayToggle = async () => {
        // Toggle Subscription logic
        setIsAutoPayEnabled(!isAutoPayEnabled);
        if (!isAutoPayEnabled) {
            // Enable
            await stripeService.createSubscription('price_123', selectedCardId!);
        }
    };

    const filteredPayments = MOCK_PAYMENTS.filter(p => {
        if (filter === 'all') return true;
        if (filter === 'paid') return p.status === 'paid' || p.status === 'late';
        return p.status === 'pending';
    });

    const totalPaid2024 = MOCK_PAYMENTS.filter(p => p.status !== 'pending').reduce((acc, curr) => acc + curr.amount, 0);
    const onTimePayments = MOCK_PAYMENTS.filter(p => p.status === 'paid').length;
    const totalPayments = MOCK_PAYMENTS.filter(p => p.status !== 'pending').length;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pagamentos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Histórico financeiro</p>
                </div>
                <button className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                    <Download size={20} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><PieChart size={100} /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Total Pago em 2024</p>
                                <h2 className="text-3xl font-extrabold mt-1">R$ {totalPaid2024.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/30 transition-colors" onClick={handleAutoPayToggle}>
                                <RefreshCw size={14} className={isAutoPayEnabled ? 'animate-spin-slow' : ''} />
                                <span className="text-xs font-bold">{isAutoPayEnabled ? 'Débito Automático Ativo' : 'Ativar Débito Auto'}</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-xs text-indigo-100 mb-1">Pontualidade</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400" style={{ width: `${(onTimePayments/totalPayments)*100}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold">{onTimePayments}/{totalPayments}</span>
                                </div>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-indigo-100">Próximo</p>
                                    <p className="font-bold text-sm">10 Abr</p>
                                </div>
                                <ArrowUpRight className="text-indigo-300" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {['all', 'paid', 'pending'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                                filter === f
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md'
                                : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-primary'
                            }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagos / Finalizados' : 'Pendentes'}
                        </button>
                    ))}
                </div>

                {/* Payments List */}
                <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                        <div 
                            key={payment.id}
                            onClick={() => { setSelectedPayment(payment); setStep('details'); setShowAddNewCard(false); }}
                            className="group bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                payment.status === 'paid' ? 'bg-emerald-500' : 
                                payment.status === 'late' ? 'bg-red-500' : 'bg-orange-500'
                            }`}></div>
                            
                            <div className="flex justify-between items-start pl-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{payment.month}</h3>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        Vencimento: {payment.dueDate}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white text-lg">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                        payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                        payment.status === 'late' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                    }`}>
                                        {payment.status === 'paid' ? <CheckCircle size={10} /> : payment.status === 'late' ? <AlertTriangle size={10} /> : <Clock size={10} />}
                                        {payment.status === 'paid' ? `Pago em ${payment.paidDate}` : payment.status === 'late' ? 'Atrasado' : 'A Vencer'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 pl-3 flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 flex justify-between w-32">
                                        <span>Aluguel:</span> <span className="font-medium">R$ {payment.breakdown.rent}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 flex justify-between w-32">
                                        <span>Condomínio:</span> <span className="font-medium">R$ {payment.breakdown.condo}</span>
                                    </p>
                                </div>
                                <button className="text-xs font-bold text-primary hover:underline">Ver Detalhes</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PAYMENT MODAL FLOW */}
            {selectedPayment && (
                <ModalWrapper onClose={() => setSelectedPayment(null)} title={step === 'success' ? 'Sucesso!' : `Pagamento - ${selectedPayment.month}`} showCloseButton={true} className="md:max-w-lg">
                    <div className="p-6 space-y-6 bg-background-light dark:bg-background-dark h-full overflow-y-auto">
                        
                        {/* STEP 1: DETAILS */}
                        {step === 'details' && (
                            <>
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Valor Total</p>
                                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                                        R$ {selectedPayment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </h2>
                                    <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        selectedPayment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                                        selectedPayment.status === 'late' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {selectedPayment.status === 'paid' ? 'Pago' : selectedPayment.status === 'late' ? 'Atrasado' : 'Aberto'}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-white/5 space-y-3">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 border-b border-gray-100 dark:border-white/5 pb-2">Composição</h3>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Aluguel</span>
                                        <span className="font-bold text-slate-900 dark:text-white">R$ {selectedPayment.breakdown.rent.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Condomínio</span>
                                        <span className="font-bold text-slate-900 dark:text-white">R$ {selectedPayment.breakdown.condo.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">IPTU</span>
                                        <span className="font-bold text-slate-900 dark:text-white">R$ {selectedPayment.breakdown.iptu.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {selectedPayment.status !== 'paid' ? (
                                        <button 
                                            onClick={handlePayClick}
                                            className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
                                        >
                                            <CreditCard size={18} /> Pagar Agora
                                        </button>
                                    ) : (
                                        <button className="w-full h-12 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                                            <Download size={18} /> Baixar Recibo
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {/* STEP 2: METHOD SELECTION */}
                        {step === 'method' && (
                            <>
                                {!showAddNewCard ? (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white">Selecione o Cartão</h3>
                                            <button 
                                                onClick={() => setStep('details')} 
                                                className="text-xs text-primary font-bold hover:underline"
                                            >
                                                Alterar valor
                                            </button>
                                        </div>
                                        
                                        <SavedCards 
                                            cards={savedCards} 
                                            selectedId={selectedCardId || undefined} 
                                            onSelect={setSelectedCardId}
                                            onDelete={(id) => stripeService.detachPaymentMethod(id).then(loadPaymentMethods)}
                                            onAddNew={() => setShowAddNewCard(true)}
                                        />

                                        <div className="mt-6">
                                            <button 
                                                onClick={processPayment} 
                                                disabled={!selectedCardId || isPaying}
                                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {isPaying ? 'Processando...' : `Pagar R$ ${selectedPayment.amount.toLocaleString()}`}
                                            </button>
                                            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                                                <Lock size={12} /> Pagamento seguro via Stripe
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-4">
                                            <button onClick={() => setShowAddNewCard(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10"><X size={20}/></button>
                                            <h3 className="font-bold text-slate-900 dark:text-white">Novo Cartão</h3>
                                        </div>
                                        <PaymentForm 
                                            onSubmit={processPayment} 
                                            isLoading={isPaying} 
                                            buttonText={`Pagar R$ ${selectedPayment.amount.toLocaleString()}`}
                                        />
                                    </>
                                )}
                            </>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8 animate-scaleUp">
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-2">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pagamento Confirmado!</h3>
                                <p className="text-slate-500 text-sm max-w-xs">
                                    O recibo foi enviado para seu e-mail. O status será atualizado em instantes.
                                </p>
                                <button 
                                    onClick={() => setSelectedPayment(null)}
                                    className="mt-6 w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                                >
                                    Fechar
                                </button>
                            </div>
                        )}
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
};

export default TenantPayments;