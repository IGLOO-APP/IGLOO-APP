import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Search, 
  User, 
  ExternalLink, 
  Filter,
  Loader2,
  Building2,
  Calendar
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminConversations: React.FC = () => {
  const { startImpersonation } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all users to allow starting a conversation/impersonating
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-conversations-users', searchTerm],
    queryFn: () => adminService.getUsers(1, 20, searchTerm, 'Ativo', 'Todos', 'owner'),
  });

  const owners = usersData?.users || [];

  return (
    <div className='p-8 space-y-8 animate-fadeIn max-w-[1200px] mx-auto'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm'>
        <div>
          <h1 className='text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3'>
            Central de Conversas
            <span className='px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest'>Admin</span>
          </h1>
          <p className='text-sm text-slate-500 font-medium mt-1'>Acesse as mensagens de qualquer proprietário para suporte direto.</p>
        </div>

        <div className='relative w-full md:w-96'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
          <input
            type='text'
            placeholder='Buscar proprietário por nome ou email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {loadingUsers ? (
          <div className='col-span-full py-20 flex flex-col items-center gap-4 text-slate-400'>
            <Loader2 className='animate-spin' size={40} />
            <p className='font-bold uppercase tracking-widest text-xs'>Carregando proprietários...</p>
          </div>
        ) : owners.length === 0 ? (
          <div className='col-span-full py-20 bg-white dark:bg-surface-dark rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center gap-4 text-slate-400'>
            <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-full'>
              <MessageSquare size={32} />
            </div>
            <p className='font-bold'>Nenhum proprietário encontrado.</p>
          </div>
        ) : (
          owners.map((owner) => (
            <div 
              key={owner.id}
              className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group'
            >
              <div className='flex items-start justify-between mb-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-600 dark:text-white font-black text-xl shadow-inner'>
                    {owner.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className='font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors'>
                      {owner.name}
                    </h3>
                    <p className='text-xs text-slate-500 truncate max-w-[150px]'>{owner.email}</p>
                  </div>
                </div>
                <div className='px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest'>
                  Ativo
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3 mb-6'>
                <div className='p-3 bg-slate-50 dark:bg-white/5 rounded-2xl'>
                  <div className='flex items-center gap-2 text-slate-400 mb-1'>
                    <Building2 size={12} />
                    <span className='text-[10px] font-bold uppercase tracking-widest'>Imóveis</span>
                  </div>
                  <p className='text-sm font-black text-slate-900 dark:text-white'>12 Ativos</p>
                </div>
                <div className='p-3 bg-slate-50 dark:bg-white/5 rounded-2xl'>
                  <div className='flex items-center gap-2 text-slate-400 mb-1'>
                    <Calendar size={12} />
                    <span className='text-[10px] font-bold uppercase tracking-widest'>Plano</span>
                  </div>
                  <p className='text-sm font-black text-slate-900 dark:text-white'>Pro</p>
                </div>
              </div>

              <button
                onClick={() => startImpersonation(owner, '/messages')}
                className='w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg'
              >
                <MessageSquare size={16} />
                Acessar Mensagens
                <ExternalLink size={14} className='opacity-50' />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminConversations;
