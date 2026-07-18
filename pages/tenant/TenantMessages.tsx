import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar, NavbarBackLink } from 'konsta/react';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
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

  const loadMessages = async () => {
    if (!user?.id) return;
    setLoading(true);

    const data = await messageService.getTenantMessagesCombined(user.id);

    if (data.conversations.length > 0) {
      setPropertyName(data.propertyName);

      const conversationMessages = (data.convMsgs as Array<{
        id: string; content: string; type: string | null;
        sender_role: string | null; created_at: string;
      }>).map((m) => ({
        id: m.id,
        text: m.content,
        isAnnouncement: m.type === 'announcement' || m.sender_role === 'system',
        time: formatTime(m.created_at),
        created_at: m.created_at,
      }));

      const maintenanceMessages = (data.maintMsgs as Array<{
        id: string; content: string; type: string | null;
        sender_role: string | null; created_at: string;
      }>).map((m) => ({
        id: m.id,
        text: m.content,
        isAnnouncement: m.sender_role === 'system',
        time: formatTime(m.created_at),
        created_at: m.created_at,
      }));

      const all = [...conversationMessages, ...maintenanceMessages]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(all);
    } else {
      const announcements = await announcementService.getForTenant(user.id);
      const mapped = (announcements || []).map((a: OwnerAnnouncement) => ({
        id: a.id,
        text: `${a.title}\n\n${a.content}`,
        isAnnouncement: true,
        time: formatTime(a.created_at),
        created_at: a.created_at,
      }));
      setMessages(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const convChannel = supabase
      .channel('tenant_messages_conv')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversation_messages' },
        (payload) => {
          const newMsg = payload.new as {
            id: string; content: string; type: string | null;
            sender_role: string | null; created_at: string;
            conversation_id: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                text: newMsg.content,
                isAnnouncement: newMsg.type === 'announcement' || newMsg.sender_role === 'system',
                time: formatTime(newMsg.created_at),
                created_at: newMsg.created_at,
              },
            ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      )
      .subscribe();

    const maintChannel = supabase
      .channel('tenant_messages_maint')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'maintenance_messages' },
        (payload) => {
          const newMsg = payload.new as {
            id: string; content: string; type: string | null;
            sender_role: string | null; created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                text: newMsg.content,
                isAnnouncement: newMsg.sender_role === 'system',
                time: formatTime(newMsg.created_at),
                created_at: newMsg.created_at,
              },
            ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      )
      .subscribe();

    return () => {
      convChannel.unsubscribe();
      maintChannel.unsubscribe();
    };
  }, [user?.id]);

  return (
    <div className='flex flex-col h-full w-full'>
      <Navbar
        title='Mensagens'
        subtitle={propertyName || undefined}
        left={<NavbarBackLink onClick={() => navigate('/tenant')} />}
        right={
          <div className='w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
            <Megaphone size={18} strokeWidth={1.8} />
          </div>
        }
      />

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center px-8'>
            <div className='w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4'>
              <Megaphone size={24} strokeWidth={1.8} />
            </div>
            <p className='text-sm font-bold text-card-foreground'>Nenhuma mensagem</p>
            <p className='text-xs text-muted-foreground mt-1'>
              Voc� ainda n�o recebeu comunicados do propriet�rio.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className='flex justify-start'>
              <div className='max-w-[88%] md:max-w-[70%] flex flex-col items-start'>
                {msg.isAnnouncement && (
                  <div className='flex items-center gap-1.5 mb-2 px-1 text-[10px] font-bold text-primary uppercase tracking-tight'>
                    <Megaphone size={12} strokeWidth={1.8} className='shrink-0' />
                    <span>Comunicado do propriet�rio</span>
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-[20px] rounded-tl-none shadow-md ${
                    msg.isAnnouncement
                      ? 'bg-primary/5 dark:bg-primary/10 text-foreground border border-primary/10'
                      : 'lg-card lg-card-lift p-4 text-slate-900 dark:text-white'
                  }`}
                >
                  <p className='text-xs leading-relaxed font-medium whitespace-pre-wrap'>
                    {msg.text}
                  </p>
                </div>
                <span className='text-[10px] text-muted-foreground mt-1.5 px-1'>{msg.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TenantMessages;
