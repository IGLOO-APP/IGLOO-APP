import React from 'react';
import { Clock, Mail, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const PendingAccess: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-white/5 text-center"
      >
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-6">
          <Clock size={40} strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
          Acesso Pendente
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
          Olá, <span className="text-slate-900 dark:text-white font-bold">{user?.name || user?.email}</span>. 
          Seu acesso ainda não foi liberado.
        </p>

        <div className="space-y-4 text-left mb-8">
          <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquilinos</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                Você precisa ser cadastrado pelo seu proprietário para acessar o IGLOO.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
              <ChevronRight size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proprietários</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                Se você é um novo proprietário, aguarde a ativação da sua conta pelo administrador.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>

        <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          IGLOO &bull; Gestão Patrimonial
        </p>
      </motion.div>
    </div>
  );
};

export default PendingAccess;
