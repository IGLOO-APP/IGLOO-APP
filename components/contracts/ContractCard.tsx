
import React from 'react';
import { FileText, Calendar, DollarSign, Clock, Users, ArrowRight, AlertCircle, CheckCircle2, PenTool } from 'lucide-react';
import { Contract } from '../../types';
import { getStatusColor, getStatusLabel } from '../../utils/contractLogic';

interface ContractCardProps {
    contract: Contract;
    onClick: (contract: Contract) => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({ contract, onClick }) => {
    const statusColor = getStatusColor(contract.status);
    const statusLabel = getStatusLabel(contract.status);

    // Calculate signature progress
    const signedCount = contract.signers.filter(s => s.status === 'signed').length;
    const totalSigners = contract.signers.length;
    const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

    return (
        <div 
            onClick={() => onClick(contract)}
            className="group bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor.split(' ')[0]}`}></div>
            
            <div className="flex justify-between items-start mb-3 pl-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${statusColor}`}>
                            {statusLabel}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{contract.contract_number}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{contract.property}</h3>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{contract.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Mensal</p>
                </div>
            </div>

            <div className="pl-3 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Users size={14} className="text-slate-400" />
                    <span>{contract.tenant_name}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>Fim: {new Date(contract.end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {contract.status === 'expiring_soon' && (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                            <Clock size={12} /> {contract.days_remaining} dias
                        </span>
                    )}
                </div>

                {contract.status === 'pending_signature' && (
                    <div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                            <span>Assinaturas</span>
                            <span>{signedCount}/{totalSigners}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
};
