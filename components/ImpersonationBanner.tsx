import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

const ImpersonationBanner: React.FC = () => {
    const { user, impersonatingFrom, stopImpersonation } = useAuth();

    if (!impersonatingFrom) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white z-[9999] shadow-xl animate-slideDown">
            <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <ShieldAlert size={18} className="text-white" />
                    </div>
                    <p className="text-sm font-bold">
                        Você está navegando como <span className="underline">{user?.name}</span> ({user?.email})
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <p className="text-[10px] hidden md:block uppercase font-black tracking-widest text-white/70">
                        Sessão de Suporte Ativa
                    </p>
                    <button
                        onClick={stopImpersonation}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white text-amber-600 rounded-full text-xs font-black shadow-lg hover:bg-slate-100 transition-all active:scale-95"
                    >
                        <LogOut size={14} />
                        SAIR DA IMPERSONIFICAÇÃO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImpersonationBanner;
