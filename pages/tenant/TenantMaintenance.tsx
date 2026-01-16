import React, { useState, useRef, useEffect } from 'react';
import { Plus, Wrench, Clock, CheckCircle, ChevronRight, Camera, Send, User, MessageSquare, LifeBuoy, DollarSign, HelpCircle, FileText } from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';

interface MaintenanceMessage {
  id: number;
  text: string;
  sender: 'me' | 'owner' | 'system';
  time: string;
}

interface MaintenanceRequest {
  id: number;
  title: string;
  category: string;
  type: 'repair' | 'general' | 'financial';
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
  messages: MaintenanceMessage[];
}

const TenantMaintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Request Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: 1,
      title: 'Torneira Pingando',
      category: 'Hidráulica',
      type: 'repair',
      date: '10 Mar 2024',
      status: 'pending',
      description: 'A torneira da cozinha não fecha completamente, está pingando muito durante a noite.',
      messages: [
        { id: 1, text: 'Solicitação aberta. Aguardando análise.', sender: 'system', time: '10 Mar, 09:00' },
        { id: 2, text: 'Olá, poderia enviar uma foto da torneira para eu comprar o reparo correto?', sender: 'owner', time: '10 Mar, 10:30' }
      ]
    },
    {
      id: 2,
      title: 'Dúvida sobre Boleto',
      category: 'Financeiro',
      type: 'financial',
      date: '08 Mar 2024',
      status: 'completed',
      description: 'O valor do condomínio veio diferente este mês, gostaria de entender.',
      messages: [
         { id: 1, text: 'Ticket aberto.', sender: 'system', time: '08 Mar, 10:00' },
         { id: 2, text: 'Olá João, houve um ajuste na taxa de lixo anual.', sender: 'owner', time: '08 Mar, 11:00' },
         { id: 3, text: 'Entendi, obrigado.', sender: 'me', time: '08 Mar, 11:05' },
         { id: 4, text: 'Ticket finalizado.', sender: 'system', time: '08 Mar, 11:10' }
      ]
    }
  ]);

  const filteredRequests = requests.filter(r => 
    activeTab === 'open' ? r.status === 'pending' || r.status === 'in_progress' : r.status === 'completed'
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedRequest) {
      scrollToBottom();
    }
  }, [selectedRequest?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRequest) return;

    const msg: MaintenanceMessage = {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedRequest = {
        ...selectedRequest,
        messages: [...selectedRequest.messages, msg]
    };

    setSelectedRequest(updatedRequest);
    setRequests(requests.map(r => r.id === updatedRequest.id ? updatedRequest : r));
    setNewMessage('');
  };

  const handleCreateRequest = () => {
      const isRepair = ['Hidráulica', 'Elétrica', 'Estrutural', 'Eletrodomésticos'].includes(newCategory);
      
      const newReq: MaintenanceRequest = {
          id: Date.now(),
          title: newTitle || 'Nova Solicitação',
          category: newCategory,
          type: isRepair ? 'repair' : newCategory === 'Financeiro' ? 'financial' : 'general',
          date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'pending',
          description: newDescription,
          messages: [{ id: 1, text: 'Solicitação criada com sucesso.', sender: 'system', time: 'Agora' }]
      };

      setRequests([newReq, ...requests]);
      setShowNewRequest(false);
      setNewTitle('');
      setNewCategory('');
      setNewDescription('');
  };

  const getIconByCategory = (cat: string) => {
      if (cat === 'Hidráulica' || cat === 'Elétrica' || cat === 'Estrutural') return <Wrench size={18} />;
      if (cat === 'Financeiro') return <DollarSign size={18} />;
      return <MessageSquare size={18} />;
  };

  const getColorByCategory = (cat: string) => {
      if (cat === 'Hidráulica' || cat === 'Elétrica') return 'bg-amber-50 text-amber-500 dark:bg-amber-900/20';
      if (cat === 'Financeiro') return 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20';
      return 'bg-blue-50 text-blue-500 dark:bg-blue-900/20';
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto md:max-w-4xl relative bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors">
         <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Central de Ajuda</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Solicitações e Contato</p>
         </div>
         <button 
            onClick={() => setShowNewRequest(true)}
            className="flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
         >
            <Plus size={20} />
            <span className="text-sm font-bold hidden md:inline">Nova Solicitação</span>
         </button>
      </header>

      <div className="px-6 py-4">
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
            <button 
                onClick={() => setActiveTab('open')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'open' ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Em Aberto
            </button>
            <button 
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Concluídos
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
        {filteredRequests.length > 0 ? (
            filteredRequests.map(req => (
                <div 
                    key={req.id} 
                    onClick={() => setSelectedRequest(req)}
                    className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-primary/50 cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <span className={`p-2.5 rounded-xl ${getColorByCategory(req.category)}`}>
                                {getIconByCategory(req.category)}
                            </span>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{req.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{req.category}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                            req.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                            {req.status === 'pending' ? 'Pendente' : 'Resolvido'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2 pl-[52px]">{req.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-gray-50 dark:border-gray-800 pl-[52px]">
                        <span className="flex items-center gap-1"><Clock size={14} /> {req.date}</span>
                        <span className="flex items-center gap-1 text-primary font-bold group-hover:underline">
                            Ver conversa <ChevronRight size={14} />
                        </span>
                    </div>
                </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <LifeBuoy size={32} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">Nenhuma solicitação encontrada.</p>
                <p className="text-xs mt-1">Toque em "+" para abrir um novo chamado.</p>
            </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <ModalWrapper onClose={() => setShowNewRequest(false)} title="Nova Solicitação" showCloseButton={true}>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background-light dark:bg-background-dark">
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
                         <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                             <span className="font-bold">Importante:</span> Para manter a organização e agilidade, todas as mensagens devem ser categorizadas. Selecione abaixo o tipo de ajuda que você precisa.
                         </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Qual o motivo do contato?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'Hidráulica', label: 'Hidráulica', icon: Wrench },
                                { id: 'Elétrica', label: 'Elétrica', icon: Wrench },
                                { id: 'Estrutural', label: 'Estrutural', icon: Wrench },
                                { id: 'Financeiro', label: 'Financeiro', icon: DollarSign },
                                { id: 'Dúvidas Gerais', label: 'Dúvida Geral', icon: HelpCircle },
                                { id: 'Outros', label: 'Outros', icon: MessageSquare }
                            ].map(cat => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => setNewCategory(cat.id)}
                                    className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all text-left ${
                                        newCategory === cat.id 
                                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm' 
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    <cat.icon size={16} />
                                    <span className="text-sm">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {newCategory && (
                        <div className="animate-fadeIn space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assunto</label>
                                <input 
                                    type="text" 
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 dark:text-white" 
                                    placeholder={newCategory === 'Financeiro' ? "Ex: Boleto vencido" : "Ex: Chuveiro queimou"} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mensagem Detalhada</label>
                                <textarea 
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 dark:text-white resize-none h-32" 
                                    placeholder="Descreva o que você precisa..."
                                ></textarea>
                            </div>

                            {['Hidráulica', 'Elétrica', 'Estrutural'].includes(newCategory) && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Fotos (Opcional)</label>
                                    <button className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all gap-2">
                                        <Camera size={24} />
                                        <span className="text-xs font-bold">Adicionar Foto</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-6 bg-background-light dark:bg-background-dark border-t border-transparent">
                <button 
                    disabled={!newCategory || !newTitle || !newDescription}
                    onClick={handleCreateRequest}
                    className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                >
                    Enviar Solicitação
                </button>
            </div>
        </ModalWrapper>
      )}

      {/* Details & Chat Modal */}
      {selectedRequest && (
        <ModalWrapper onClose={() => setSelectedRequest(null)} title="Conversa" showCloseButton={true} className="md:max-w-2xl">
            <div className="flex flex-col h-[85vh] md:h-[600px] bg-background-light dark:bg-background-dark">
                
                {/* Request Info */}
                <div className="px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${getColorByCategory(selectedRequest.category)}`}>
                            {getIconByCategory(selectedRequest.category)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedRequest.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400">{selectedRequest.category}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{selectedRequest.date}</span>
                            </div>
                        </div>
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                            selectedRequest.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                            {selectedRequest.status === 'pending' ? 'Pendente' : 'Resolvido'}
                        </span>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedRequest.description}
                        </p>
                    </div>
                </div>

                {/* Chat Section */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/10">
                     <div className="flex items-center gap-2 justify-center py-2 opacity-60">
                         <div className="h-px bg-slate-300 dark:bg-slate-700 w-12"></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                             <MessageSquare size={12} /> Mensagens
                         </span>
                         <div className="h-px bg-slate-300 dark:bg-slate-700 w-12"></div>
                     </div>
                     
                     {selectedRequest.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'system' ? (
                                <div className="w-full flex justify-center my-2">
                                    <span className="text-[10px] bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                        {msg.text}
                                    </span>
                                </div>
                            ) : (
                                <div className={`max-w-[85%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-end gap-2">
                                        {msg.sender === 'owner' && (
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-[10px] overflow-hidden shrink-0">
                                                <User size={12} />
                                            </div>
                                        )}
                                        <div 
                                            className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                            msg.sender === 'me' 
                                            ? 'bg-primary text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-sm border border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium mt-1 px-1 mx-8">{msg.time}</span>
                                </div>
                            )}
                        </div>
                     ))}
                     <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 shrink-0 z-20">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 h-11 px-4 rounded-xl bg-slate-100 dark:bg-black/20 border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm text-slate-900 dark:text-white transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:shadow-none"
                        >
                            <Send size={18} className={newMessage.trim() ? 'ml-0.5' : ''} />
                        </button>
                    </form>
                </div>
            </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default TenantMaintenance;