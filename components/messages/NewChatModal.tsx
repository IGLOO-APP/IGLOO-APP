import React, { useState, useEffect } from 'react';
import { Search, User, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { messageService } from '../../services/messageService';

interface NewChatModalProps {
  show: boolean;
  onClose: () => void;
  onSelectTenant: (tenantId: string) => void;
}

interface TenantContact {
  id: string;
  name: string | null;
  email: string;
  avatar_url?: string | null;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ show, onClose, onSelectTenant }) => {
  const [tenants, setTenants] = useState<TenantContact[]>([]);
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

  const filteredTenants = tenants.filter(
    (t) =>
      (t.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!show) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0' showCloseButton={true}>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-lg font-semibold'>Novo Contato</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='flex flex-col bg-background max-h-[80vh] overflow-hidden'>
          <div className='p-6 border-b border-border bg-card'>
            <div className='relative group'>
              <input
                type='text'
                placeholder='Buscar por nome ou e-mail...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full h-12 pl-12 pr-6 rounded-2xl text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all lg-card'
              />
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors'
                size={18}
                strokeWidth={2.5}
              />
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar'>
            <h3 className='text-xs font-medium text-muted-foreground px-1 mb-4 flex items-center justify-between'>
              <span>Contatos Disponíveis</span>
              <span className='bg-muted px-2 py-0.5 rounded text-muted-foreground'>
                {filteredTenants.length}
              </span>
            </h3>

            {loading ? (
              <div className='py-12 flex flex-col items-center justify-center gap-4 opacity-50'>
                <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
                <span className='text-xs font-medium text-muted-foreground'>
                  Sincronizando Contatos...
                </span>
              </div>
            ) : filteredTenants.length > 0 ? (
              <div className='grid grid-cols-1 gap-2'>
                {filteredTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTenant(t.id)}
                    className='w-full p-4 rounded-2xl lg-card lg-card-lift flex items-center gap-4 transition-all group text-left relative'
                  >
                    <div className='shrink-0'>
                  <div
                    className={`w-12 h-12 rounded-2xl ${getAvatarColor(t.name ?? '')} flex items-center justify-center text-white font-semibold text-lg shadow-md group-hover:scale-105 transition-transform`}
                  >
                    {t.avatar_url ? (
                      <img
                        src={t.avatar_url}
                        alt=''
                        className='w-full h-full object-cover rounded-2xl'
                      />
                    ) : (
                      <span>{(t.name ?? '?').charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors'>
                    {t.name ?? 'Sem nome'}
                  </h4>
                      <p className='text-xs text-muted-foreground truncate mt-0.5'>
                        {t.email}
                      </p>
                    </div>
                    <div className='w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all'>
                      <Plus size={16} strokeWidth={3} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className='py-20 flex flex-col items-center justify-center text-center px-8 lg-card rounded-3xl border-2 border-dashed border-border'>
                <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4'>
                  <User size={32} />
                </div>
                <h4 className='text-sm font-medium text-foreground mb-2'>
                  Nenhum inquilino encontrado
                </h4>
                <p className='text-sm text-muted-foreground leading-relaxed max-w-[200px]'>
                  Verifique se o nome está correto ou se o inquilino já possui uma conta ativa.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
