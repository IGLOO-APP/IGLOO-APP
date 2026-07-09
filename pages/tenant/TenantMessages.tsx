import React, { useState, useEffect } from 'react';
import { ChevronLeft, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { announcementService } from '../../services/announcementService';
import type { OwnerAnnouncement } from '../../types';

interface MessageDisplay {
  id: string;
  text: string;
  isAnnouncement: boolean;
  time: string;
  created_at: string;
}

const TenantMessages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyName, setPropertyName] = useState('');

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;
    return d.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    (async () => {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*, properties(name)')
        .eq('tenant_id', user.id)
        .eq('category', 'general');

      if (conversations && conversations.length > 0) {
        const ids = conversations.map((c) => c.id);
        const prop = conversations[0].properties as unknown as { name: string } | null;
        setPropertyName(prop?.name || '');

        const { data: convMsgs } = await supabase
          .from('conversation_messages')
          .select('*')
          .in('conversation_id', ids)
          .order('created_at', { ascending: true });

        const mapped = ((convMsgs || []) as Array<{
          id: string;
          content: string;
          type: string | null;
          sender_role: string | null;
          created_at: string;
        }>).map((m) => ({
          id: m.id,
          text: m.content,
          isAnnouncement: m.type === 'announcement' || m.sender_role === 'system',
          time: formatTime(m.created_at),
          created_at: m.created_at,
        }));
        setMessages(mapped);
      } else {
        const announcements = await announcementService.getForTenant(user.id);
        const mapped = (announcements || []).map((a: OwnerAnnouncement) => ({
          id: a.id,
          text: `📢 ${a.title}\n\n${a.content}`,
          isAnnouncement: true,
          time: formatTime(a.created_at),
          created_at: a.created_at,
        }));
        setMessages(mapped);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <div className='flex flex-col h-full w-full bg-background'>
      <header className='flex items-center gap-3 px-4 py-3 bg-card border-b border-border shrink-0 z-20'>
        <button
          onClick={() => navigate('/tenant')}
          className='p-2 -ml-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors'
        >
          <ChevronLeft size={24} />
        </button>
        <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
          <Megaphone size={20} />
        </div>
        <div>
          <h2 className='text-sm font-bold text-card-foreground leading-tight'>Mensagens</h2>
          {propertyName && (
            <p className='text-xs text-muted-foreground font-medium'>{propertyName}</p>
          )}
        </div>
      </header>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center px-8'>
            <div className='w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4'>
              <Megaphone size={24} />
            </div>
            <p className='text-sm font-bold text-card-foreground'>Nenhuma mensagem</p>
            <p className='text-xs text-muted-foreground mt-1'>
              Você ainda não recebeu comunicados do proprietário.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className='flex justify-start'>
              <div className='max-w-[88%] md:max-w-[70%] flex flex-col items-start'>
                {msg.isAnnouncement && (
                  <div className='flex items-center gap-1.5 mb-2 px-1 text-[10px] font-bold text-primary uppercase tracking-tight'>
                    <Megaphone size={12} className='shrink-0' />
                    <span>Comunicado do proprietário</span>
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-[20px] rounded-tl-none shadow-md ${
                    msg.isAnnouncement
                      ? 'bg-primary/5 dark:bg-primary/10 text-foreground border border-primary/10'
                      : 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-100 dark:border-white/5'
                  }`}
                >
                  <p className='text-xs leading-relaxed font-medium whitespace-pre-wrap'>
                    {msg.text}
                  </p>
                </div>
                <span className='text-[10px] text-muted-foreground mt-1.5 px-1'>
                  {msg.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TenantMessages;
