
import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, ChevronLeft, Send, User, Paperclip, MoreVertical, 
    CheckCheck, AlertCircle, Wrench, DollarSign, MessageSquare, 
    Filter, Clock, CheckCircle, X, Image as ImageIcon, Calendar,
    FileText, Phone
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'tenant' | 'system';
  time: string;
  isRead: boolean;
  type?: 'text' | 'image' | 'status_update';
}

interface TicketDetails {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    images: string[];
    category: string;
}

interface Chat {
  id: number;
  tenantName: string;
  tenantAvatar?: string;
  property: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  category: 'maintenance' | 'finance' | 'general';
  ticket?: TicketDetails; // Linked ticket if maintenance
  messages: Message[];
}

const quickReplies = ["Estou verificando.", "Agendado para amanhã.", "Pode me enviar uma foto?", "Recebido, obrigado."];

const OwnerMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'maintenance' | 'finance' | 'general'>('all');
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock Data Sincronizado com TenantMaintenance
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      tenantName: 'João Silva',
      tenantAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf',
      property: 'Apt 101 - Centro',
      lastMessage: 'Aguardando o técnico.',
      lastMessageTime: '10:30',
      unreadCount: 1,
      category: 'maintenance',
      ticket: {
          id: '#REQ-2024-001',
          title: 'Torneira Pingando',
          category: 'Hidráulica',
          description: 'A torneira da cozinha não fecha completamente, está pingando muito durante a noite. O registro geral não fecha.',
          status: 'pending',
          priority: 'medium',
          images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300']
      },
      messages: [
        { id: 1, text: 'Solicitação aberta automaticamente.', sender: 'system', time: '09:00', isRead: true },
        { id: 2, text: 'Olá João, vi seu chamado sobre a torneira. É na cozinha ou banheiro?', sender: 'me', time: '09:30', isRead: true },
        { id: 3, text: 'Na cozinha. Está pingando bastante.', sender: 'tenant', time: '09:32', isRead: true },
        { id: 4, text: 'Vou agendar um encanador para avaliar.', sender: 'me', time: '09:35', isRead: true },
        { id: 5, text: 'Aguardando o técnico.', sender: 'tenant', time: '10:30', isRead: false }
      ]
    },
    {
      id: 2,
      tenantName: 'Maria Oliveira',
      tenantAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD78MRhEj5vokBi3Zr5ORCa84xM4Q0aoHqRqMtmFY5rqqioFglngu_CVvuUlAwFFXylrVwhOX-6rB0xO0RM04aD6spoISdNI-pJR9jsw0SwQsb3-TQPyS3OBbENLbte3Z-Zqv9lEOgt3WuKjxTIrLaStD2Bove6Q5jDIX7PpiUDn1x-gcN2lMoAOEi9fV_nI4dv-32WMg0se3QVylj1o0-E7hPHafz8wUKADMIvPRoIn91W1pDK1-L-SQnqBavDYiPc4Udc_4ypGJ2q',
      property: 'Kitnet 05 - Jardins',
      lastMessage: 'Comprovante enviado.',
      lastMessageTime: 'Ontem',
      unreadCount: 0,
      category: 'finance',
      messages: [
        { id: 1, text: 'Olá Maria, o boleto deste mês já está disponível.', sender: 'me', time: 'Ontem, 08:00', isRead: true },
        { id: 2, text: 'Já realizei o pagamento. Segue o comprovante.', sender: 'tenant', time: 'Ontem, 14:00', isRead: true },
        { id: 3, text: 'Comprovante enviado.', sender: 'tenant', time: 'Ontem, 14:01', isRead: true }
      ]
    },
    {
      id: 3,
      tenantName: 'Carlos Pereira',
      property: 'Studio 22 - Vila Madalena',
      lastMessage: 'Ok, combinado!',
      lastMessageTime: '25 Dez',
      unreadCount: 0,
      category: 'general',
      messages: [
        { id: 1, text: 'Carlos, preciso agendar a visita anual.', sender: 'me', time: '25 Dez, 10:00', isRead: true },
        { id: 2, text: 'Pode ser semana que vem?', sender: 'tenant', time: '25 Dez, 11:30', isRead: true },
        { id: 3, text: 'Sim, terça às 10h?', sender: 'me', time: '25 Dez, 11:35', isRead: true },
        { id: 4, text: 'Ok, combinado!', sender: 'tenant', time: '25 Dez, 11:40', isRead: true }
      ]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  // Open details panel automatically if maintenance chat
  useEffect(() => {
      const chat = chats.find(c => c.id === activeChatId);
      if (chat?.category === 'maintenance') {
          setShowDetailsPanel(true);
      } else {
          setShowDetailsPanel(false);
      }
  }, [activeChatId]);

  const handleSendMessage = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputText;
    
    if (!textToSend.trim() || activeChatId === null) return;

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        const newMessage: Message = {
          id: Date.now(),
          text: textToSend,
          sender: 'me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        };
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: textToSend,
          lastMessageTime: 'Agora'
        };
      }
      return chat;
    }));

    setInputText('');
  };

  const handleStatusChange = (newStatus: 'pending' | 'in_progress' | 'completed') => {
      if (!activeChatId) return;
      
      setChats(prev => prev.map(chat => {
          if (chat.id === activeChatId && chat.ticket) {
              const statusText = newStatus === 'in_progress' ? 'Em Andamento' : newStatus === 'completed' ? 'Concluído' : 'Pendente';
              const systemMsg: Message = {
                  id: Date.now(),
                  text: `Status do chamado alterado para: ${statusText}`,
                  sender: 'system',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isRead: true
              };
              return {
                  ...chat,
                  ticket: { ...chat.ticket, status: newStatus },
                  messages: [...chat.messages, systemMsg]
              };
          }
          return chat;
      }));
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chat.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || chat.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category: string) => {
      switch(category) {
          case 'maintenance': return <Wrench size={16} className="text-orange-500" />;
          case 'finance': return <DollarSign size={16} className="text-emerald-500" />;
          default: return <MessageSquare size={16} className="text-blue-500" />;
      }
  };

  return (
    <div className="flex h-full w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      
      {/* 1. CHAT LIST SIDEBAR */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-white/5 bg-surface-light dark:bg-surface-dark transition-transform duration-300 absolute md:relative z-20 h-full ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
         
         <div className="p-4 border-b border-gray-200 dark:border-white/5 space-y-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Central de Mensagens</h1>
            
            {/* Search */}
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Buscar..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-black/20 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {[
                    { id: 'all', label: 'Tudo' },
                    { id: 'maintenance', label: 'Chamados' },
                    { id: 'finance', label: 'Financeiro' },
                    { id: 'general', label: 'Geral' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                            activeFilter === f.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                            : 'bg-white dark:bg-surface-dark text-slate-500 border-gray-200 dark:border-white/10 hover:bg-slate-50'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredChats.map(chat => (
               <div 
                 key={chat.id}
                 onClick={() => setActiveChatId(chat.id)}
                 className={`group p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-all border border-transparent ${
                    activeChatId === chat.id 
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
                 }`}
               >
                  <div className="relative shrink-0 mt-1">
                     {chat.tenantAvatar ? (
                        <div className="w-12 h-12 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `url(${chat.tenantAvatar})` }}></div>
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                           <User size={24} />
                        </div>
                     )}
                     {chat.ticket && (
                         <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-surface-dark rounded-full flex items-center justify-center shadow-sm">
                             {getCategoryIcon(chat.category)}
                         </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`text-sm truncate pr-2 ${chat.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                           {chat.tenantName}
                        </h3>
                        <span className="text-[10px] text-slate-400 shrink-0">{chat.lastMessageTime}</span>
                     </div>
                     <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-0.5 truncate flex items-center gap-1">
                         {chat.ticket?.id || chat.property}
                     </p>
                     
                     <div className="flex justify-between items-end">
                         <p className={`text-xs truncate max-w-[140px] ${chat.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                            {chat.messages[chat.messages.length-1].sender === 'me' && <span className="mr-1">Você:</span>}
                            {chat.lastMessage}
                         </p>
                         {chat.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                {chat.unreadCount}
                            </div>
                         )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 2. CHAT AREA */}
      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-black/20 absolute md:relative w-full h-full transition-transform duration-300 ${activeChatId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
         {activeChat ? (
            <>
               <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shrink-0 z-20 shadow-sm">
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => setActiveChatId(null)}
                       className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                     >
                        <ChevronLeft size={24} />
                     </button>
                     
                     <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{activeChat.tenantName}</h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                activeChat.category === 'maintenance' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                activeChat.category === 'finance' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                                {activeChat.category === 'maintenance' ? 'Chamado' : activeChat.category === 'finance' ? 'Financeiro' : 'Geral'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{activeChat.property}</p>
                     </div>
                  </div>
                  
                  <div className="flex gap-2">
                      {activeChat.ticket && (
                          <button 
                            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                            className={`p-2 rounded-lg transition-colors ${showDetailsPanel ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
                            title="Ver detalhes do chamado"
                          >
                              <FileText size={20} />
                          </button>
                      )}
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                         <MoreVertical size={20} />
                      </button>
                  </div>
               </div>

               <div className="flex-1 flex overflow-hidden">
                   {/* Messages Stream */}
                   <div className="flex-1 flex flex-col min-w-0">
                       <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                          <div className="flex justify-center mb-6">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">Hoje</span>
                          </div>
                          
                          {activeChat.messages.map(msg => (
                             <div key={msg.id} className={`flex w-full ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                                {msg.sender === 'system' ? (
                                    <div className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide my-2 shadow-sm">
                                        {msg.text}
                                    </div>
                                ) : (
                                    <div className={`max-w-[80%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                       <div 
                                         className={`px-4 py-3 rounded-2xl text-sm shadow-sm relative group ${
                                            msg.sender === 'me' 
                                            ? 'bg-primary text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-700'
                                         }`}
                                       >
                                          {msg.text}
                                       </div>
                                       <div className="flex items-center gap-1 mt-1 px-1">
                                          <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                                          {msg.sender === 'me' && (
                                             <CheckCheck size={12} className={msg.isRead ? 'text-primary' : 'text-slate-300'} />
                                          )}
                                       </div>
                                    </div>
                                )}
                             </div>
                          ))}
                          <div ref={messagesEndRef} />
                       </div>

                       <div className="p-4 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 shrink-0">
                          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1">
                              {quickReplies.map((reply, i) => (
                                  <button 
                                    key={i}
                                    onClick={() => handleSendMessage(undefined, reply)}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                  >
                                      {reply}
                                  </button>
                              ))}
                          </div>

                          <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-3 items-end">
                             <button type="button" className="p-3 text-slate-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                                <Paperclip size={20} />
                             </button>
                             <div className="flex-1 bg-gray-100 dark:bg-black/20 rounded-2xl border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden flex items-center">
                                <input 
                                   value={inputText}
                                   onChange={(e) => setInputText(e.target.value)}
                                   placeholder="Digite uma mensagem..."
                                   className="w-full h-12 px-4 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                                />
                             </div>
                             <button 
                                type="submit"
                                disabled={!inputText.trim()}
                                className="h-12 w-12 rounded-full bg-primary disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:shadow-none hover:bg-primary-dark transition-all active:scale-95 shrink-0"
                             >
                                <Send size={20} className={inputText.trim() ? 'ml-0.5' : ''} />
                             </button>
                          </form>
                       </div>
                   </div>

                   {/* 3. TICKET DETAILS PANEL (Collapsible) */}
                   {showDetailsPanel && activeChat.ticket && (
                       <div className="w-80 bg-white dark:bg-surface-dark border-l border-gray-200 dark:border-white/5 hidden lg:flex flex-col h-full animate-slideLeft">
                           <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                               <h3 className="font-bold text-slate-900 dark:text-white text-sm">Detalhes do Chamado</h3>
                               <button onClick={() => setShowDetailsPanel(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400">
                                   <X size={16} />
                               </button>
                           </div>
                           
                           <div className="flex-1 overflow-y-auto p-4 space-y-6">
                               <div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Título</span>
                                   <p className="font-bold text-slate-900 dark:text-white">{activeChat.ticket.title}</p>
                                   <span className="text-xs text-slate-500">{activeChat.ticket.id}</span>
                               </div>

                               <div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Status Atual</span>
                                   <div className="flex flex-col gap-2">
                                       <button 
                                            onClick={() => handleStatusChange('pending')}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${activeChat.ticket.status === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200 dark:bg-white/5 dark:text-slate-400'}`}
                                       >
                                           <Clock size={14} /> Pendente
                                       </button>
                                       <button 
                                            onClick={() => handleStatusChange('in_progress')}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${activeChat.ticket.status === 'in_progress' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200 dark:bg-white/5 dark:text-slate-400'}`}
                                       >
                                           <Wrench size={14} /> Em Andamento
                                       </button>
                                       <button 
                                            onClick={() => handleStatusChange('completed')}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${activeChat.ticket.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200 dark:bg-white/5 dark:text-slate-400'}`}
                                       >
                                           <CheckCircle size={14} /> Resolvido
                                       </button>
                                   </div>
                               </div>

                               <div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Descrição</span>
                                   <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                       {activeChat.ticket.description}
                                   </p>
                               </div>

                               {activeChat.ticket.images.length > 0 && (
                                   <div>
                                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Fotos Anexadas</span>
                                       <div className="grid grid-cols-2 gap-2">
                                           {activeChat.ticket.images.map((img, i) => (
                                               <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-white/10 overflow-hidden relative group cursor-pointer">
                                                   <img src={img} alt="Anexo" className="w-full h-full object-cover" />
                                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                       <ImageIcon size={20} />
                                                   </div>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               )}

                               <div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contato</span>
                                   <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                       <Phone size={14} /> (11) 99999-9999
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}
               </div>
            </>
         ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-6 text-slate-400">
               <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Send size={32} className="opacity-50" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Suas Mensagens</h3>
               <p className="max-w-xs text-sm">Selecione uma conversa para gerenciar chamados ou responder inquilinos.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default OwnerMessages;
