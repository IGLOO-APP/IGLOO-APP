
import React, { useState } from 'react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Contract } from '../../types';
import { getStatusColor, getStatusLabel } from '../../utils/contractLogic';
import { FileText, Calendar, DollarSign, History, ShieldCheck, Download, Send, XCircle, RefreshCw, PenTool, CheckCircle, Mail, MessageCircle, AlertTriangle } from 'lucide-react';

interface ContractDetailsProps {
    contract: Contract;
    onClose: () => void;
    onUpdate: (updated: Contract) => void;
}

export const ContractDetails: React.FC<ContractDetailsProps> = ({ contract, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'document' | 'history'>('overview');
    const [isSigning, setIsSigning] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleSendSignature = () => {
        setIsSigning(true);
        setTimeout(() => {
            // Mock update
            const updated = {
                ...contract,
                status: 'active' as const,
                signers: contract.signers.map(s => ({ ...s, status: 'signed' as const, signed_at: new Date().toISOString() })),
                history: [
                    { id: Date.now().toString(), action: 'signed' as const, description: 'Assinado digitalmente por todas as partes', performed_by: 'Sistema', date: new Date().toLocaleString() },
                    ...contract.history
                ]
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
                { id: Date.now().toString(), action: 'cancelled' as const, description: 'Contrato rescindido manualmente', performed_by: 'Proprietário', date: new Date().toLocaleString() },
                ...contract.history
            ]
        };
        onUpdate(updated);
        setShowCancelConfirm(false);
    };

    return (
        <ModalWrapper onClose={onClose} title={`Contrato #${contract.contract_number}`} showCloseButton={true} className="md:max-w-4xl">
            <div className="flex flex-col h-[90vh] md:h-[700px] bg-background-light dark:bg-background-dark">
                
                {/* Status Header */}
                <div className="px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(contract.status)}`}>
                            {getStatusLabel(contract.status)}
                        </div>
                        <span className="text-sm text-slate-500">{contract.property}</span>
                    </div>
                    
                    <div className="flex gap-2">
                        {contract.status === 'pending_signature' && (
                            <button 
                                onClick={handleSendSignature}
                                disabled={isSigning}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
                            >
                                {isSigning ? 'Processando...' : <><PenTool size={16} /> Simular Assinatura</>}
                            </button>
                        )}
                        {contract.status === 'active' && (
                            <button 
                                onClick={() => setShowCancelConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-all"
                            >
                                <XCircle size={16} /> Rescindir
                            </button>
                        )}
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-gray-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                    <div className="flex gap-6">
                        {[
                            { id: 'overview', label: 'Visão Geral' },
                            { id: 'document', label: 'Documento Original' },
                            { id: 'history', label: 'Histórico & Auditoria' }
                        ].map(tab => (
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
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-black/10">
                    
                    {activeTab === 'overview' && (
                        <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
                            {/* Contract Info */}
                            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText size={18} className="text-primary" /> Dados do Contrato
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-50 dark:border-white/5 pb-2">
                                        <span className="text-slate-500">Inquilino</span>
                                        <span className="font-medium dark:text-white">{contract.tenant_name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 dark:border-white/5 pb-2">
                                        <span className="text-slate-500">Proprietário</span>
                                        <span className="font-medium dark:text-white">{contract.owner_name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 dark:border-white/5 pb-2">
                                        <span className="text-slate-500">Início</span>
                                        <span className="font-medium dark:text-white">{new Date(contract.start_date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Término</span>
                                        <span className="font-medium dark:text-white">{new Date(contract.end_date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <DollarSign size={18} className="text-emerald-500" /> Financeiro
                                </h3>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex justify-between items-center">
                                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">Valor Mensal</span>
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{contract.value}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500 px-2">
                                    <span>Dia do Vencimento</span>
                                    <span className="font-bold text-slate-900 dark:text-white">Todo dia {contract.payment_day}</span>
                                </div>
                            </div>

                            {/* Signers Status */}
                            <div className="md:col-span-2 bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-indigo-500" /> Status das Assinaturas
                                </h3>
                                <div className="space-y-3">
                                    {contract.signers.map(signer => (
                                        <div key={signer.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                    signer.status === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                    {signer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{signer.name}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{signer.role === 'owner' ? 'Proprietário' : 'Inquilino'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {signer.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button className="p-1.5 rounded bg-white border border-gray-200 hover:text-emerald-600 transition-colors" title="Reenviar Email"><Mail size={14}/></button>
                                                        <button className="p-1.5 rounded bg-white border border-gray-200 hover:text-emerald-600 transition-colors" title="Enviar WhatsApp"><MessageCircle size={14}/></button>
                                                    </div>
                                                )}
                                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                                    signer.status === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {signer.status === 'signed' ? 'Assinado' : 'Pendente'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'document' && (
                        <div className="h-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-400 p-10 animate-fadeIn">
                            <div className="text-center">
                                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                                <p>Visualização do PDF Simulada</p>
                                <button className="mt-4 px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                                    Abrir em nova aba
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="relative pl-4 border-l-2 border-slate-200 dark:border-gray-700 space-y-6">
                                {contract.history.map((event) => (
                                    <div key={event.id} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-4 border-white dark:border-surface-dark box-content"></div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{event.description}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {event.date} por <span className="font-medium text-slate-700 dark:text-slate-300">{event.performed_by}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Confirmation Modal Overlay */}
            {showCancelConfirm && (
                <div className="absolute inset-0 bg-white/95 dark:bg-surface-dark/95 z-50 flex flex-col items-center justify-center p-6 animate-fadeIn rounded-3xl">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Rescindir Contrato?</h3>
                    <p className="text-center text-sm text-slate-500 mb-6 max-w-sm">
                        Esta ação irá encerrar a vigência do contrato imediatamente e não pode ser desfeita.
                    </p>
                    <div className="flex gap-3 w-full max-w-xs">
                        <button 
                            onClick={() => setShowCancelConfirm(false)}
                            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold"
                        >
                            Voltar
                        </button>
                        <button 
                            onClick={handleCancelContract}
                            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}
        </ModalWrapper>
    );
};
