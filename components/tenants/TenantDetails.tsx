import React, { useState } from 'react';
import { 
    X, Phone, Mail, MessageCircle, MapPin, Calendar, 
    ShieldCheck, TrendingUp, DollarSign, Clock, FileText, 
    ArrowUpRight, AlertCircle, CheckCircle2, Download, 
    History, ChevronRight, User, MoreVertical, CreditCard
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';

interface TenantDetailsProps {
    id: number;
    onClose: () => void;
}

export const TenantDetails: React.FC<TenantDetailsProps> = ({ id, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'docs'>('overview');

    // Robust Mock Data for a single tenant
    const tenant = {
        name: id === 3 ? 'Carlos Pereira' : id === 2 ? 'Maria Oliveira' : 'João Silva',
        image: id === 1 ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf' : id === 2 ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuD78MRhEj5vokBi3Zr5ORCa84xM4Q0aoHqRqMtmFY5rqqioFglngu_CVvuUlAwFFXylrVwhOX-6rB0xO0RM04aD6spoISdNI-pJR9jsw0SwQsb3-TQPyS3OBbENLbte3Z-Zqv9lEOgt3WuKjxTIrLaStD2Bove6Q5jDIX7PpiUDn1x-gcN2lMoAOEi9fV_nI4dv-32WMg0se3QVylj1o0-E7hPHafz8wUKADMIvPRoIn91W1pDK1-L-SQnqBavDYiPc4Udc_4ypGJ2q' : undefined,
        status: id === 3 ? 'late' : 'active',
        property: {
            name: id === 3 ? 'Studio 22 - Vila Madalena' : id === 2 ? 'Kitnet 05 - Centro' : 'Apt 101 - Ed. Horizonte',
            address: 'Rua Augusta, 150 - SP',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=300'
        },
        financials: {
            totalPaid: 'R$ 18.000,00',
            pending: id === 3 ? 'R$ 2.400,00' : 'R$ 0,00',
            performance: '98%',
            lastPayment: '05/02/2024'
        },
        contract: {
            start: '10/01/2024',
            end: '10/01/2026',
            progress: 15, // percentage
            value: id === 1 ? 'R$ 1.500,00' : id === 2 ? 'R$ 850,00' : 'R$ 2.400,00'
        },
        paymentHistory: [
            { id: 1, month: 'Março', status: id === 3 ? 'late' : 'paid', value: 'R$ 1.500,00', date: '-' },
            { id: 2, month: 'Fevereiro', status: 'paid', value: 'R$ 1.500,00', date: '05/02/2024' },
            { id: 3, month: 'Janeiro', status: 'paid', value: 'R$ 1.500,00', date: '04/01/2024' },
            { id: 4, month: 'Dezembro', status: 'paid', value: 'R$ 1.500,00', date: '05/12/2023' },
        ]
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/5511999999999`, '_blank');
    };

    return (
        <ModalWrapper onClose={onClose} className="md:max-w-3xl" showCloseButton={true}>
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
                
                {/* 1. Header Profile Section */}
                <div className="bg-white dark:bg-surface-dark p-6 border-b border-gray-100 dark:border-white/5 shrink-0">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            {tenant.image ? (
                                <div className="h-24 w-24 rounded-3xl bg-cover bg-center border-4 border-slate-50 dark:border-white/5 shadow-xl" style={{ backgroundImage: `url(${tenant.image})` }}></div>
                            ) : (
                                <div className="h-24 w-24 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-4 border-slate-50 dark:border-white/5 shadow-xl text-indigo-600 dark:text-indigo-400 font-bold text-3xl">CP</div>
                            )}
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 border-white dark:border-surface-dark shadow-sm ${
                                tenant.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                                {tenant.status === 'active' ? 'Bom Pagador' : 'Em Atraso'}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{tenant.name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1.5 text-xs font-medium"><Phone size={14} className="text-primary" /> (11) 99999-9999</span>
                                <span className="flex items-center gap-1.5 text-xs font-medium"><Mail size={14} className="text-primary" /> inquilino@email.com</span>
                            </div>
                            
                            <div className="flex gap-2 mt-5">
                                <button onClick={handleWhatsApp} className="flex-1 md:flex-none h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                                    <MessageCircle size={16} /> WhatsApp
                                </button>
                                <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Tabs Navigation */}
                <div className="bg-white dark:bg-surface-dark px-6 border-b border-gray-100 dark:border-white/5 shrink-0">
                    <div className="flex gap-8">
                        {[
                            { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
                            { id: 'payments', label: 'Financeiro', icon: DollarSign },
                            { id: 'docs', label: 'Contrato & Docs', icon: FileText }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                                    activeTab === tab.id 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Associated Property Card */}
                            <div className="group relative overflow-hidden bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="h-20 w-20 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${tenant.property.image})` }}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Imóvel Alugado</p>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{tenant.property.name}</h3>
                                            </div>
                                            <button className="text-slate-400 hover:text-primary transition-colors"><ArrowUpRight size={20}/></button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {tenant.property.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pontualidade</p>
                                    <p className="text-xl font-black text-emerald-500">{tenant.financials.performance}</p>
                                </div>
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Pago</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">R$ 18k</p>
                                </div>
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Em Aberto</p>
                                    <p className={`text-xl font-black ${tenant.status === 'late' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{tenant.financials.pending}</p>
                                </div>
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dia Vencimento</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">Todo dia 10</p>
                                </div>
                            </div>

                            {/* Contract Progress Card */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-primary" />
                                        Vigência do Contrato
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500">{tenant.contract.progress}% concluído</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${tenant.contract.progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-slate-500">
                                    <div className="flex flex-col">
                                        <span>Início</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{tenant.contract.start}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span>Fim</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{tenant.contract.end}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline / Recent Activity */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 ml-1">
                                    <History size={16} className="text-primary" /> Atividade Recente
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { icon: DollarSign, text: 'Aluguel de Fevereiro recebido', date: '05/02/2024', color: 'text-emerald-500 bg-emerald-50' },
                                        { icon: Clock, text: 'Vistoria anual agendada', date: '20/01/2024', color: 'text-blue-500 bg-blue-50' },
                                        { icon: FileText, text: 'Contrato assinado digitalmente', date: '10/01/2024', color: 'text-slate-500 bg-slate-50' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-surface-dark rounded-xl border border-gray-50 dark:border-white/5 shadow-sm">
                                            <div className={`p-2 rounded-lg ${item.color.split(' ')[1]} ${item.color.split(' ')[0]}`}><item.icon size={16} /></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.text}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{item.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 dark:text-white">Fluxo Financeiro</h3>
                                <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"><Download size={14}/> Baixar Extrato</button>
                            </div>

                            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                                {tenant.paymentHistory.map((pay, idx) => (
                                    <div key={pay.id} className={`p-4 flex items-center justify-between border-b last:border-0 border-gray-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                pay.status === 'paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                                            }`}>
                                                {pay.status === 'paid' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">Aluguel {pay.month}</p>
                                                <p className="text-xs text-slate-500">
                                                    {pay.status === 'paid' ? `Pago em ${pay.date}` : 'Vencido em 10/03'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{pay.value}</p>
                                            <p className={`text-[10px] font-bold uppercase ${pay.status === 'paid' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {pay.status === 'paid' ? 'Liquidado' : 'Cobrar Agora'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm shrink-0">
                                    <CreditCard size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Próxima Fatura</p>
                                    <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70 mt-0.5">Vencimento previsto para Abril (Dia 10).</p>
                                </div>
                                <ChevronRight className="text-indigo-400 self-center" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'docs' && (
                        <div className="animate-fadeIn space-y-4">
                             <h3 className="font-bold text-slate-900 dark:text-white px-1">Documentos Digitais</h3>
                             {[
                                 { name: 'Contrato de Locação Digital', size: '2.4 MB', date: '10/01/2024', type: 'PDF' },
                                 { name: 'Laudo de Vistoria (Entrada)', size: '15.8 MB', date: '08/01/2024', type: 'ZIP' },
                                 { name: 'RG / CPF Inquilino', size: '1.1 MB', date: '05/01/2024', type: 'IMG' },
                                 { name: 'Comprovante de Rendimentos', size: '0.9 MB', date: '05/01/2024', type: 'PDF' },
                             ].map((doc, idx) => (
                                <div key={idx} className="group flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{doc.name}</p>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">{doc.type} • {doc.size} • {doc.date}</p>
                                    </div>
                                    <Download size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                                </div>
                             ))}
                        </div>
                    )}
                </div>

                {/* 4. Sticky Quick Actions Footer (Only if late) */}
                {tenant.status === 'late' && (
                    <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                        <button className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                            <AlertCircle size={20} /> Notificar Inadimplência
                        </button>
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
};