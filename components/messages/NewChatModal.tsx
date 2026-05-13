import React, { useState, useEffect } from 'react';
import { Search, User, X, Plus } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { messageService } from '../../services/messageService';

interface NewChatModalProps {
  show: boolean;
  onClose: () => void;
  onSelectTenant: (tenantId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ show, onClose, onSelectTenant }) => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      loadTenants();
    }
  }, [show]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await messageService.listTenantsForMessaging();
      setTenants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 
      'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!show) return null;

  return (
    <ModalWrapper title='Novo Contato' onClose={onClose}>
      <div className='flex flex-col bg-background-light dark:bg-background-dark max-h-[80vh] overflow-hidden'>
        <div className='p-6 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark'>
          <div className='relative group'>
            <input
              type='text'
              placeholder='Buscar por nome ou e-mail...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full h-14 pl-12 pr-6 rounded-[24px] bg-slate-50 dark:bg-black/20 border-none text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner'
            />
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' size={20} strokeWidth={2.5} />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar'>
          <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4 flex items-center justify-between'>
            <span>Contatos Disponíveis</span>
            <span className='bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500'>{filteredTenants.length}</span>
          </h3>

          {loading ? (
            <div className='py-12 flex flex-col items-center justify-center gap-4 opacity-50'>
              <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
              <span className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Sincronizando Contatos...</span>
            </div>
          ) : filteredTenants.length > 0 ? (
            <div className='grid grid-cols-1 gap-2'>
              {filteredTenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTenant(t.id)}
                  className='w-full p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 flex items-center gap-4 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:shadow-xl hover:shadow-black/5 transition-all group text-left relative'
                >
                  <div className='shrink-0'>
                    <div className={`w-12 h-12 rounded-2xl ${getAvatarColor(t.name)} flex items-center justify-center text-white font-black text-lg shadow-lg shadow-black/5 group-hover:scale-105 transition-transform`}>
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt='' className='w-full h-full object-cover rounded-2xl' />
                      ) : (
                        <span>{t.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-primary transition-colors'>{t.name}</h4>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5'>{t.email}</p>
                  </div>
                  <div className='w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all'>
                    <Plus size={16} strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className='py-20 flex flex-col items-center justify-center text-center px-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px]'>
              <div className='w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-4'>
                <User size={32} />
              </div>
              <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2'>Nenhum inquilino encontrado</h4>
              <p className='text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]'>
                Verifique se o nome está correto ou se o inquilino já possui uma conta ativa.
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
