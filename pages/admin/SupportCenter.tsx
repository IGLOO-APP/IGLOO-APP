import React, { useState } from 'react';
import {
    Search,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Filter,
    MoreVertical,
    Send,
    Paperclip
} from 'lucide-react';

const SupportCenter: React.FC = () => {
    const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

    const tickets = [
        { id: 1234, subject: 'Problema com pagamento', owner: 'Maria Silva', status: 'Aberto', priority: 'Alta', category: 'Billing', time: '10:30', sla: '2h' },
        { id: 1235, subject: 'Dificuldade em cadastrar imóvel', owner: 'João Santos', status: 'In Progress', priority: 'Média', category: 'Technical', time: '11:15', sla: '24h' },
        { id: 1236, subject: 'Sugestão de nova feature', owner: 'Pedro Lima', status: 'Waiting', priority: 'Baixa', category: 'Feedback', time: 'Ontem', sla: '48h' },
    ];

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden animate-fadeIn">
            {/* Ticket List */}
            <div className="w-96 border-r border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white">Tickets</h3>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400">
                            <Filter size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar tickets..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                    {tickets.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTicket(t.id)}
                            className={`w-full p-6 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-l-4 ${selectedTicket === t.id ? 'border-primary bg-slate-50 dark:bg-white/5' : 'border-transparent'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{t.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.priority === 'Alta' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' :
                                        t.priority === 'Média' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                                            'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                                    }`}>
                                    {t.priority}
                                </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">{t.subject}</h4>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1"><User size={12} /> {t.owner}</span>
                                <span>{t.time}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Ticket Details */}
            <div className="flex-1 bg-slate-50 dark:bg-background-dark flex flex-col overflow-hidden">
                {selectedTicket ? (
                    <>
                        <div className="p-8 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ticket #{selectedTicket}</h3>
                                    <p className="text-sm text-slate-500">Problemas com cobranças duplicadas no cartão</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                                    <CheckCircle2 size={18} />
                                    Resolver Ticket
                                </button>
                                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {/* Messages */}
                            <div className="flex flex-col gap-6">
                                <div className="flex gap-4 max-w-2xl self-start">
                                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 shrink-0 font-bold flex items-center justify-center text-slate-600 dark:text-white">M</div>
                                    <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-50 dark:border-white/5">
                                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                                            Olá equipe do Igloo, notei que fui cobrada duas vezes este mês. Podem verificar o que aconteceu com minha fatura do plano Professional?
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-bold mt-2 block">10:30 AM</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 max-w-2xl self-end flex-row-reverse text-right">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 shrink-0 font-bold flex items-center justify-center text-white">A</div>
                                    <div className="bg-amber-500 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-amber-500/20 text-white">
                                        <p className="text-sm leading-relaxed">
                                            Olá Maria! Estou verificando agora mesmo no painel do Stripe. Por favor, aguarde um momento enquanto processo o seu estorno.
                                        </p>
                                        <span className="text-[10px] text-white/70 font-bold mt-2 block">10:45 AM</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-400/20 p-4 rounded-2xl flex items-start gap-3 max-w-lg self-center">
                                    <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">Nota Interna</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-300">Duplicação confirmada no Stripe. ID da transação: ch_3Ok2n4L.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-8 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 shrink-0">
                            <div className="relative group">
                                <textarea
                                    placeholder="Escreva sua resposta aqui..."
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 pr-32 min-h-[100px] outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-slate-900 dark:text-white"
                                ></textarea>
                                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-400 transition-all">
                                        <Paperclip size={20} />
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                                        <Send size={18} />
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare size={40} className="opacity-20" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Selecione um ticket</h3>
                        <p className="text-sm max-w-sm">Escolha um ticket na lista à esquerda para visualizar os detalhes e interagir com o usuário.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportCenter;
