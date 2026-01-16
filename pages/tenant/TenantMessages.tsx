import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MoreVertical, ChevronLeft, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'owner';
  time: string;
}

const TenantMessages: React.FC = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Olá João, gostaria de agendar a vistoria anual do imóvel para a próxima semana.', sender: 'owner', time: '09:30' },
    { id: 2, text: 'Bom dia! Pode ser na quinta-feira às 14h?', sender: 'me', time: '09:32' },
    { id: 3, text: 'Perfeito. Quinta às 14h. Te aviso quando estiver chegando.', sender: 'owner', time: '09:34' },
    { id: 4, text: 'Ok, combinado!', sender: 'me', time: '09:35' }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto md:max-w-4xl bg-background-light dark:bg-background-dark relative">
      <header className="flex items-center justify-between px-4 py-3 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden">
                    <User size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface-light dark:border-surface-dark rounded-full"></span>
            </div>
            <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Proprietário</h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online agora</p>
            </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <MoreVertical size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/20">
        <div className="flex justify-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">Hoje</span>
        </div>

        {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                    <div 
                        className={`px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                        msg.sender === 'me' 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-700'
                        }`}
                    >
                        {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 px-1">{msg.time}</span>
                </div>
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <button type="button" className="p-3 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                <Paperclip size={20} />
            </button>
            <div className="flex-1 bg-slate-100 dark:bg-black/20 rounded-2xl border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden flex items-center">
                <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Digite sua mensagem..."
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
  );
};

export default TenantMessages;