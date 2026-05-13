import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Wrench,
  Clock,
  CheckCircle2,
  Zap,
  Droplets,
  Home,
  CloudRain,
  Shield,
  Smartphone,
  Sparkles,
  Send,
  MessageSquare,
  LifeBuoy,
  DollarSign,
  HelpCircle,
  AlertCircle,
  FileText,
  Paperclip,
  Loader2,
  X,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// ─── Types ───────────────────────────────────────────────
interface UnifiedMessage {
  id: string;
  content: string;
  sender_role: 'tenant' | 'owner' | 'system' | 'admin';
  created_at: string;
  type: 'text' | 'image' | 'system' | 'file' | 'ticket_created';
  url?: string;
  ticketCategory?: string;
  ticketTitle?: string;
  ticketStatus?: string;
  ticketId?: string;
}

const TenantMaintenance: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<'category' | 'details'>('category');
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingTicket, setPendingTicket] = useState<{id: string, title: string, category: string, created_at: string, status?: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Data Queries ────────────────────────────────────────
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['maintenance_categories'],
    queryFn: () => tenantService.getMaintenanceCategories(),
  });

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Droplets, Zap, Home, CloudRain, Shield, Smartphone, Sparkles, DollarSign, Wrench, HelpCircle, AlertCircle
    };
    return icons[iconName] || Wrench;
  };

  const categories = dbCategories.map(cat => ({
    id: cat.name,
    label: cat.name,
    icon: getIconComponent(cat.icon_name),
    color: cat.color_class,
    bg: cat.bg_class
  }));

  const { data: tenantProfile } = useQuery({
    queryKey: ['tenant_profile', currentUser?.id],
    queryFn: () => tenantService.getById(currentUser!.id.toString()),
    enabled: !!currentUser?.id,
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['tenant_maintenance_tickets', currentUser?.id],
    queryFn: () => tenantService.getMaintenanceRequests(currentUser!.id.toString()),
    enabled: !!currentUser?.id,
  });

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['tenant_all_maintenance_messages', currentUser?.id, requests.map(r => r.id).join(',')],
    queryFn: async () => {
      if (requests.length === 0) return [];
      const requestIds = requests.map((r: any) => r.id);
      const { data: rawMsgs, error } = await supabase
        .from('maintenance_messages')
        .select('*')
        .in('request_id', requestIds)
        .order('created_at', { ascending: true });

      if (error) return [];

      const timeline: UnifiedMessage[] = [];
      for (const req of requests) {
        timeline.push({
          id: `ticket_${req.id}`,
          content: req.description || req.title,
          sender_role: 'system',
          created_at: req.created_at,
          type: 'ticket_created',
          ticketCategory: req.category,
          ticketTitle: req.title,
          ticketStatus: req.status,
          ticketId: req.id,
        });
      }

      for (const msg of (rawMsgs || [])) {
        timeline.push({
          id: msg.id,
          content: msg.content,
          sender_role: (msg.sender_role as any) || 'system',
          created_at: msg.created_at || new Date().toISOString(),
          type: (msg.type as any) || 'text',
          url: msg.url || undefined,
        });
      }

      return timeline.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
    enabled: !!currentUser?.id && requests.length > 0,
    refetchInterval: 10000,
  });

  const activeTicket = requests.find((r: any) => ['pending', 'in_progress', 'open'].includes(r.status)) || pendingTicket;
  
  const filteredRequests = requests.filter(r => {
    const isClosed = ['completed', 'resolved'].includes(r.status);
    const matchesTab = activeTab === 'closed' ? isClosed : !isClosed;
    const matchesSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const displayRequests = [
    ...(pendingTicket && !requests.find(r => r.id === pendingTicket.id) && activeTab === 'open' ? [pendingTicket] : []),
    ...filteredRequests
  ];

  useEffect(() => {
    if (pendingTicket && requests.find(r => r.id === pendingTicket.id)) {
      setPendingTicket(null);
    }
  }, [requests, pendingTicket]);

  // ─── Mutations ───────────────────────────────────────────
  const createTicketMutation = useMutation({
    mutationFn: async (newTicket: any) => {
      let propertyId = tenantProfile?.property_id || requests?.[0]?.property_id || '';
      if (!propertyId) {
        const { data: contract } = await supabase.from('contracts').select('property_id').eq('tenant_id', currentUser!.id.toString()).in('status', ['active', 'pending']).limit(1).maybeSingle();
        propertyId = contract?.property_id || '';
      }
      if (!propertyId) throw new Error('Imóvel não encontrado.');
      return tenantService.createMaintenanceRequest({
        tenant_id: currentUser!.id.toString(),
        property_id: propertyId,
        title: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority
      });
    },
    onSuccess: (data: any) => {
      setPendingTicket({
        id: data.id,
        title: data.title,
        category: data.category,
        created_at: data.created_at,
        status: 'open'
      });
      queryClient.invalidateQueries({ queryKey: ['tenant_maintenance_tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tenant_all_maintenance_messages'] });
      setIsCreating(false);
      setNewCategory('');
      setInputText('');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!activeTicket) throw new Error('Nenhum chamado ativo.');
      return tenantService.sendMaintenanceMessage(activeTicket.id, currentUser!.id.toString(), 'tenant', content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant_all_maintenance_messages'] });
      setInputText('');
    }
  });

  const scrollToTicket = (ticketId: string) => {
    const element = document.getElementById(`ticket_${ticketId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-[#050608]');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-[#050608]');
      }, 2000);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (allMessages.length > 0) scrollToBottom(); }, [allMessages]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  return (
    <div className='flex h-full w-full overflow-hidden bg-[#050608]'>
      
      {/* ── Sidebar: Lista de Chamados (FIXA) ── */}
      <div className='flex w-[320px] h-full flex-col border-r border-white/5 bg-[#0A0B0D] shrink-0 overflow-hidden'>
        <div className='p-6 space-y-6 shrink-0'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-black text-white tracking-tighter'>Atendimentos</h1>
            <button onClick={() => setIsCreating(true)} className='p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all'>
              <Plus size={18} />
            </button>
          </div>

          <div className='flex p-1 bg-white/5 rounded-xl'>
            <button onClick={() => setActiveTab('open')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'open' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Em Aberto</button>
            <button onClick={() => setActiveTab('closed')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'closed' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Concluídos</button>
          </div>

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-600' size={14} />
            <input type='text' placeholder='Buscar...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border-none text-xs font-bold text-white placeholder-slate-700 focus:ring-1 focus:ring-primary/30' />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-6'>
          {displayRequests.length === 0 && (
            <div className='flex flex-col items-center justify-center py-8 gap-2'>
              <div className='w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center'>
                <Wrench size={14} className='text-slate-600' />
              </div>
              <p className='text-[10px] font-bold text-slate-600 text-center'>
                {isCreating ? 'Criando chamado...' : activeTab === 'open' ? 'Nenhum chamado em aberto' : 'Nenhum chamado concluído'}
              </p>
            </div>
          )}

          {displayRequests.map(req => (
            <button 
              key={req.id} 
              onClick={() => scrollToTicket(req.id)}
              className='w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] text-left transition-all group'
            >
              <div className='flex justify-between items-start mb-2'>
                <span className='text-[8px] font-black text-slate-500 uppercase tracking-widest'>{req.category}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${['completed', 'resolved'].includes(req.status || '') ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              </div>
              <h3 className='text-xs font-bold text-white/90 line-clamp-1 group-hover:text-primary transition-colors'>{req.title}</h3>
              <div className='flex items-center justify-between mt-3'>
                <span className='text-[9px] font-bold text-slate-600'>{new Date(req.created_at).toLocaleDateString()}</span>
                <ChevronRight size={12} className='text-slate-700 group-hover:translate-x-1 transition-transform' />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className='flex-1 flex flex-col bg-[#050608] relative overflow-hidden h-full min-h-0'>
        
        {/* Chat Header */}
        <div className='h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0B0D]/60 backdrop-blur-xl z-20'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className='text-xs font-black text-white uppercase tracking-widest'>Histórico de Conversa</h2>
              <p className='text-[10px] font-bold text-slate-500'>Central unificada de manutenção</p>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className='flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar'>
          
          {allMessages.map((msg) => {
            // Evento: Ticket Criado
            if (msg.type === 'ticket_created') {
              return (
                <div 
                  key={msg.id} 
                  id={`ticket_${msg.ticketId}`}
                  className='flex justify-center my-4 animate-fadeIn transition-all duration-500 rounded-3xl'
                >
                  <div className='max-w-sm w-full bg-white/[0.03] border border-white/5 rounded-3xl p-5 space-y-3 backdrop-blur-sm shadow-2xl'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center'>
                          <Wrench size={12} className='text-primary' />
                        </div>
                        <span className='text-[9px] font-black text-primary uppercase tracking-widest'>Abertura de Chamado</span>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStatusStyle(msg.ticketStatus || 'open')}`}>
                        {msg.ticketStatus}
                      </span>
                    </div>
                    <div>
                      <p className='text-xs font-black text-white/90'>{msg.ticketTitle}</p>
                      <p className='text-[11px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2 italic'>"{msg.content}"</p>
                    </div>
                    <div className='pt-2 flex items-center gap-1.5 text-[9px] font-bold text-slate-600 border-t border-white/5'>
                      <Clock size={10} />
                      {new Date(msg.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            }

            // Mensagem de Sistema
            if (msg.sender_role === 'system') {
              return (
                <div key={msg.id} className='flex justify-center'>
                  <div className='bg-white/[0.05] rounded-full px-4 py-1.5 border border-white/5'>
                    <p className='text-[10px] font-bold text-slate-500 tracking-tight'>{msg.content}</p>
                  </div>
                </div>
              );
            }

            const isMe = msg.sender_role === 'tenant';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                      : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                  <div className='flex items-center gap-2 mt-1.5 px-1'>
                    {!isMe && <span className='text-[8px] font-black text-primary uppercase tracking-widest'>Proprietário</span>}
                    <span className='text-[8px] font-bold text-slate-600'>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Fluxo de Criação Inline */}
          {isCreating && (
            <div className='flex flex-col gap-6 max-w-lg mx-auto animate-fadeIn py-4'>
              <div className='flex justify-start'>
                <div className='max-w-[90%] p-4 rounded-2xl bg-white/10 text-white/90 text-sm font-medium border border-white/5'>
                  Olá! Selecione a categoria para o novo chamado:
                </div>
              </div>

              {creationStep === 'category' && (
                <div className='grid grid-cols-2 gap-3'>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => { setNewCategory(cat.id); setCreationStep('details'); }} className='p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 hover:border-primary/40 transition-all group'>
                      <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center shrink-0`}>
                        <cat.icon size={18} />
                      </div>
                      <span className='text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white'>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {newCategory && (
                <div className='flex justify-end'>
                  <div className='px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest'>{newCategory}</div>
                </div>
              )}

              <div className='flex justify-center'>
                <button onClick={() => { setIsCreating(false); setNewCategory(''); }} className='text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1.5'>
                  <X size={12} /> Cancelar abertura
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className='p-6 bg-[#0A0B0D] border-t border-white/5'>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputText.trim()) return;
              if (isCreating && newCategory) {
                createTicketMutation.mutate({ subject: inputText.slice(0, 50), description: inputText, category: newCategory, priority: 'medium' });
              } else if (activeTicket) {
                sendMessageMutation.mutate(inputText);
              }
            }}
            className='relative max-w-4xl mx-auto'
          >
            <div className='absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2'>
              <button type='button' className='p-2 text-slate-600 hover:text-primary transition-colors'><Paperclip size={20} /></button>
            </div>
            <input 
              type='text' 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)}
              disabled={(isCreating && !newCategory) || (!isCreating && !activeTicket)}
              placeholder={
                isCreating 
                  ? 'Descreva o problema e aperte Enter...' 
                  : activeTicket 
                    ? 'Escreva uma mensagem...' 
                    : 'Nenhum chamado ativo'
              }
              className='w-full h-14 pl-14 pr-20 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white placeholder-slate-700 focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.07] transition-all' 
            />
            <button 
              type='submit'
              disabled={!inputText.trim() || createTicketMutation.isPending || sendMessageMutation.isPending}
              className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30'
            >
              {createTicketMutation.isPending || sendMessageMutation.isPending ? <Loader2 className='animate-spin' size={18} /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenantMaintenance;
