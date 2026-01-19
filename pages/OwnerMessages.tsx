import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, Send, User, Paperclip, MoreVertical, CheckCheck, AlertCircle } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'tenant';
  time: string;
  isRead: boolean;
}

interface Chat {
  id: number;
  tenantName: string;
  tenantAvatar?: string;
  property: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority?: 'high' | 'medium' | 'normal';
  category?: 'maintenance' | 'finance' | 'general';
  messages: Message[];
}

const quickReplies = ["Recebido, obrigado.", "Vou verificar e te retorno.", "Ok, combinado!", "Pode me enviar uma foto?"];

const OwnerMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      tenantName: 'João Silva',
      tenantAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf',
      property: 'Apt 101 - Centro',
      lastMessage: 'Ok, combinado!',
      lastMessageTime: '09:35',
      unreadCount: 0,
      priority: 'normal',
      category: 'general',
      messages: [
        { id: 1, text: 'Olá João, gostaria de agendar a vistoria anual do imóvel para a próxima semana. Por favor, me informe qual o melhor horário.', sender: 'me', time: '09:30', isRead: true },
        { id: 2, text: 'Bom dia! Pode ser na quinta-feira às 14h?', sender: 'tenant', time: '09:32', isRead: true },
        { id: 3, text: 'Perfeito. Quinta às 14h. Te aviso quando estiver chegando.', sender: 'me', time: '09:34', isRead: true },
        { id: 4, text: 'Ok, combinado!', sender: 'tenant', time: '09:35', isRead: true }
      ]
    },
    {
      id: 2,
      tenantName: 'Maria Oliveira',
      tenantAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD78MRhEj5vokBi3Zr5ORCa84xM4Q0aoHqRqMtmFY5rqqioFglngu_CVvuUlAwFFXylrVwhOX-6rB0xO0RM04aD6spoISdNI-pJR9jsw0SwQsb3-TQPyS3OBbENLbte3Z-Zqv9lEOgt3WuKjxTIrLaStD2Bove6Q5jDIX7PpiUDn1x-gcN2lMoAOEi9fV_nI4dv-32WMg0se3QVylj1o0-E7hPHafz8wUKADMIvPRoIn91W1pDK1-L-SQnqBavDYiPc4Udc_4ypGJ2q',
      property: 'Kitnet 05 - Jardins',
      lastMessage: 'Vou verificar isso hoje.',
      lastMessageTime: 'Ontem',
      unreadCount: 1,
      priority: 'high',
      category: 'maintenance',
      messages: [
        { id: 1, text: 'Boa tarde! A torneira da cozinha está pingando.', sender: 'tenant', time: 'Ontem, 15:00', isRead: true },
        { id: 2, text: 'Vou verificar isso hoje e chamar o encanador se necessário.', sender: 'me', time: 'Ontem, 15:10', isRead: true },
        { id: 3, text: 'Obrigada!', sender: 'tenant', time: 'Ontem, 15:15', isRead: false }
      ]
    },
    {
      id: 3,
      tenantName: 'Carlos Pereira',
      property: 'Loft Industrial Sul',
      lastMessage: 'Feliz Natal para você e sua família!',
      lastMessageTime: '25 Dez',
      unreadCount: 0,
      priority: 'normal',
      category: 'general',
      messages: [
        { id: 1, text: 'Passando para desejar um Feliz Natal e um próspero Ano Novo!', sender: 'me', time: '25 Dez, 10:00', isRead: true },
        { id: 2, text: 'Muito obrigado! Feliz Natal para você e sua família também!', sender: 'tenant', time: '25 Dez, 11:30', isRead: true }
      ]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

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

  const activeChat = chats.find(c => c.id === activeChatId);

  const filteredChats = chats.filter(chat => 
    chat.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-white/5 bg-surface-light dark:bg-surface-dark transition-transform duration-300 absolute md:relative z-10 h-full ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
         
         <div className="p-4 border-b border-gray-200 dark:border-white/5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Mensagens</h1>
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Buscar inquilino..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-black/20 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredChats.map(chat => (
               <div 
                 key={chat.id}
                 onClick={() => setActiveChatId(chat.id)}
                 className={`group p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border border-transparent ${
                    activeChatId === chat.id 
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
                 }`}
               >
                  <div className="relative shrink-0">
                     {chat.tenantAvatar ? (
                        <div className="w-12 h-12 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `url(${chat.tenantAvatar})` }}></div>
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                           <User size={24} />
                        </div>
                     )}
                     {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-surface-dark">
                           {chat.unreadCount}
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
                     <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 truncate">{chat.property}</p>
                     
                     <div className="flex items-center gap-2">
                         {chat.priority === 'high' && (
                             <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10">
                                 Urgente
                             </span>
                         )}
                         <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                            {chat.messages[chat.messages.length-1].sender === 'me' && <span className="mr-1">Você:</span>}
                            {chat.lastMessage}
                         </p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-black/20 absolute md:relative w-full h-full transition-transform duration-300 ${activeChatId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
         {activeChat ? (
            <>
               <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shrink-0 z-20">
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => setActiveChatId(null)}
                       className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                     >
                        <ChevronLeft size={24} />
                     </button>
                     <div className="relative">
                        {activeChat.tenantAvatar ? (
                           <div className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `url(${activeChat.tenantAvatar})` }}></div>
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                              <User size={20} />
                           </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{activeChat.tenantName}</h2>
                            {activeChat.category === 'maintenance' && <Wrench size={12} className="text-orange-500" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{activeChat.property}</p>
                     </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                     <MoreVertical size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  <div className="flex justify-center mb-6">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">Hoje</span>
                  </div>
                  
                  {activeChat.messages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
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
                     </div>
                  ))}
                  <div ref={messagesEndRef} />
               </div>

               <div className="p-4 md:p-6 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 shrink-0">
                  {/* Quick Replies */}
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

                  <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-3 items-end max-w-4xl mx-auto w-full">
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
            </>
         ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-6 text-slate-400">
               <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Send size={32} className="opacity-50" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Suas Mensagens</h3>
               <p className="max-w-xs text-sm">Selecione um inquilino ao lado para enviar avisos, cobranças ou saudações.</p>
            </div>
         )}
      </div>
    </div>
  );
};

// Helper for icon since we didn't import it at top
const Wrench = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);

export default OwnerMessages;