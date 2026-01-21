import React, { useState } from 'react';
import { 
    Filter, Download, Calendar, CheckCircle, AlertTriangle, 
    ChevronDown, CreditCard, DollarSign, FileText, ArrowUpRight,
    PieChart, Clock
} from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';

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
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                                <span className="text-xs font-bold flex items-center gap-1"><Calendar size={12} /> 2024</span>
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
                            onClick={() => setSelectedPayment(payment)}
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

            {selectedPayment && (
                <ModalWrapper onClose={() => setSelectedPayment(null)} title={`Detalhes - ${selectedPayment.month}`} showCloseButton={true} className="md:max-w-lg">
                    <div className="p-6 space-y-6 bg-background-light dark:bg-background-dark">
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
                            {selectedPayment.breakdown.fine && (
                                <div className="flex justify-between text-sm text-red-500">
                                    <span>Multa/Juros</span>
                                    <span className="font-bold">R$ {selectedPayment.breakdown.fine.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button className="w-full h-12 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                                <Download size={18} /> Baixar Recibo / Boleto
                            </button>
                            {selectedPayment.status !== 'paid' && (
                                <button className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
                                    <CreditCard size={18} /> Pagar Agora
                                </button>
                            )}
                        </div>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
};

export default TenantPayments;