import React, { useState, useEffect } from 'react';
import { Search, User, X } from 'lucide-react';
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

  if (!show) return null;

  return (
    <ModalWrapper title='Iniciar Nova Conversa' onClose={onClose}>
      <div className='p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-background-light dark:bg-background-dark'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Buscar inquilino por nome ou e-mail...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all'
          />
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
        </div>

        <div className='space-y-2'>
          {loading ? (
            <div className='py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse'>
              Carregando inquilinos...
            </div>
          ) : filteredTenants.length > 0 ? (
            filteredTenants.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTenant(t.id)}
                className='w-full p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 flex items-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left'
              >
                <div className='shrink-0'>
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt='' className='w-12 h-12 rounded-full border border-gray-200' />
                  ) : (
                    <div className='w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-bold text-slate-900 dark:text-white truncate'>{t.name}</h4>
                  <p className='text-xs text-slate-500 truncate'>{t.email}</p>
                </div>
              </button>
            ))
          ) : (
            <div className='py-12 text-center text-slate-400'>
              <p className='text-sm'>Nenhum inquilino encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
