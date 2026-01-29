
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Wrench, Clock, CheckCircle, ChevronRight, Camera, Send, User, MessageSquare, LifeBuoy, DollarSign, HelpCircle, FileText, ChevronDown, ChevronUp, CheckCheck, Paperclip } from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';

interface MaintenanceMessage {
  id: number;
  text: string;
  sender: 'me' | 'owner' | 'system';
  time: string;
}

interface TimelineEvent {
    id: number;
    title: string;
    date: string;
    icon?: any;
    color?: string;
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
  timeline: TimelineEvent[];
}

const TenantMaintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Request Form State (Wizard)
  const [step, setStep] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');

  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: 1,
      title: 'Torneira Pingando',
      category: 'Hidráulica',
      type: 'repair',
      date: '10 Mar 2024',
      status: 'pending',
      description: 'A torneira da cozinha não fecha completamente, está pingando muito durante a noite. O registro geral não fecha.',
      timeline: [
          { id: 1, title: 'Você abriu a solicitação', date: '10 Mar 09:00' },
          { id: 2, title: 'Visto pelo proprietário', date: '10 Mar 09:30' },
      ],
      messages: [
        { id: 1, text: 'Solicitação aberta automaticamente.', sender: 'system', time: '09:00' },
        { id: 2, text: 'Olá João, vi seu chamado sobre a torneira. É na cozinha ou banheiro?', sender: 'owner', time: '09:30' },
        { id: 3, text: 'Na cozinha. Está pingando bastante.', sender: 'me', time: '09:32' },
        { id: 4, text: 'Vou agendar um encanador para avaliar.', sender: 'owner', time: '09:35' },
        { id: 5, text: 'Aguardando o técnico.', sender: 'me', time: '10:30' }
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
          timeline: [{ id: 1, title: 'Solicitação criada', date: 'Agora' }],
          messages: [{ id: 1, text: 'Solicitação criada com sucesso.', sender: 'system', time: 'Agora' }]
      };

      setRequests([newReq, ...requests]);
      setShowNewRequest(false);
      resetForm();
  };

  const resetForm = () => {
      setStep(1);
      setNewTitle('');
      setNewCategory('');
      setNewDescription('');
      setUrgency('Normal');
  };

  const getIconByCategory = (cat: string) => {
      if (cat === 'Hidráulica' || cat === 'Elétrica' || cat === 'Estrutural') return <Wrench size={18} />;
      if (cat === 'Financeiro') return <DollarSign size={18} />;
      return <MessageSquare size={18} />;
  };

  const FAQSection = () => {
      const [openIndex, setOpenIndex] = useState<number | null>(null);
      const faqs = [
          { 
              q: "Posso furar as paredes (prateleiras/TV)?", 
              a: "Geralmente é permitido, mas tenha cuidado com canos e fiação. Lembre-se: ao devolver o imóvel, é obrigatório tapar todos os furos e pintar a parede." 
          },
          { 
              q: "A internet/Wi-Fi está lenta", 
              a: "Se a internet for compartilhada do condomínio, evite downloads pesados em horários de pico. Reinicie seu dispositivo. Se persistir, abra um chamado." 
          },
          { 
              q: "Regras de Silêncio e Barulho", 
              a: "Em kitnets, o som propaga facilmente. Respeite rigorosamente o silêncio entre 22h e 08h. Use fones de ouvido para música alta ou TV." 
          },
          { 
              q: "Uso da Lavanderia Compartilhada", 
              a: "Respeite a fila ou agendamento. Limpe o filtro da secadora após o uso e não deixe roupas esquecidas na máquina após o término do ciclo." 
          },
          { 
              q: "Vazamento pequeno, o que fazer?", 
              a: "Feche o registro local (geralmente embaixo da pia ou no banheiro) imediatamente para evitar desperdício e danos, e abra um chamado de Hidráulica." 
          },
          { 
              q: "Posso receber visitas?", 
              a: "Visitas são permitidas, mas verifique no seu contrato as regras sobre pernoite frequente e ocupação máxima da unidade." 
          }
      ];

      return (
          <div className="mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 px-1">Dúvidas Frequentes (Kitnet/Studio)</h3>
              <div className="space-y-2">
                  {faqs.map((faq, i) => (
                      <div key={i} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                          <button 
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full flex justify-between items-center p-3 text-left font-medium text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                              {faq.q}
                              {openIndex === i ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </button>
                          {openIndex === i && (
                              <div className="px-3 pb-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 pt-2 border-t border-gray-100 dark:border-white/5 leading-relaxed">
                                  {faq.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto md:max-w-4xl relative bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors">
         <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Central de Ajuda</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Solicitações e Suporte</p>
         </div>
         <button 
            onClick={() => setShowNewRequest(true)}
            className="flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95"
         >
            <Plus size={20} />
            <span className="text-sm font-bold hidden md:inline">Abrir Chamado</span>
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

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {activeTab === 'open' && !showNewRequest && <FAQSection />}

        <div className="space-y-4">
            {filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
                    <div 
                        key={req.id} 
                        onClick={() => setSelectedRequest(req)}
                        className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-primary/50 cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                                    {getIconByCategory(req.category)}
                                </span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{req.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{req.category}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                req.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                                req.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                                {req.status === 'pending' ? 'Pendente' : req.status === 'in_progress' ? 'Em Andamento' : 'Resolvido'}
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
                </div>
            )}
        </div>
      </div>

      {/* New Request Modal (Wizard) */}
      {showNewRequest && (
        <ModalWrapper onClose={() => { setShowNewRequest(false); resetForm(); }} title="Nova Solicitação" showCloseButton={true}>
            <div className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark">
                {/* Progress Steps */}
                <div className="flex justify-between mb-8 px-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`flex flex-col items-center gap-1 ${step >= i ? 'text-primary' : 'text-slate-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5'}`}>
                                {i}
                            </div>
                            <span className="text-[10px] font-bold uppercase">{i === 1 ? 'Tipo' : i === 2 ? 'Detalhes' : 'Confirmar'}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Qual o tipo de problema?</label>
                            <div className="grid grid-cols-2 gap-3">
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
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                            newCategory === cat.id 
                                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm' 
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        <cat.icon size={24} />
                                        <span className="text-sm">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Título do Problema</label>
                                <input 
                                    type="text" 
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 dark:text-white" 
                                    placeholder="Ex: Torneira pingando" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descrição Detalhada</label>
                                <textarea 
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 dark:text-white resize-none h-32" 
                                    placeholder="Descreva o que está acontecendo..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nível de Urgência</label>
                                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                    {['Normal', 'Alta', 'Emergência'].map(level => (
                                        <button 
                                            key={level}
                                            onClick={() => setUrgency(level)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                urgency === level 
                                                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' 
                                                : 'text-slate-500'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fadeIn space-y-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Resumo da Solicitação</h4>
                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                    <p><span className="font-bold">Categoria:</span> {newCategory}</p>
                                    <p><span className="font-bold">Assunto:</span> {newTitle}</p>
                                    <p><span className="font-bold">Urgência:</span> {urgency}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                Ao confirmar, o proprietário será notificado imediatamente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-6 bg-background-light dark:bg-background-dark border-t border-gray-100 dark:border-white/5 flex gap-3">
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="h-12 px-6 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold"
                    >
                        Voltar
                    </button>
                )}
                <button 
                    onClick={() => step < 3 ? setStep(step + 1) : handleCreateRequest()}
                    disabled={step === 1 && !newCategory || step === 2 && (!newTitle || !newDescription)}
                    className="flex-1 h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    {step === 3 ? 'Confirmar Envio' : 'Próximo'}
                </button>
            </div>
        </ModalWrapper>
      )}

      {/* Details & Chat Modal */}
      {selectedRequest && (
        <ModalWrapper onClose={() => setSelectedRequest(null)} title="Detalhes do Chamado" showCloseButton={true} className="md:max-w-2xl">
            <div className="flex flex-col h-[85vh] md:h-[600px] bg-background-light dark:bg-background-dark">
                
                {/* Timeline Header */}
                <div className="bg-white dark:bg-surface-dark p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{selectedRequest.title}</h3>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                selectedRequest.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                                selectedRequest.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                                {selectedRequest.status === 'pending' ? 'Pendente' : selectedRequest.status === 'in_progress' ? 'Em Andamento' : 'Resolvido'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 relative pl-4 border-l-2 border-slate-200 dark:border-gray-700 space-y-4">
                        {selectedRequest.timeline?.map((event, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-surface-dark"></div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{event.title}</p>
                                <p className="text-xs text-slate-500">{event.date}</p>
                            </div>
                        ))}
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
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                            {msg.sender === 'system' ? (
                                <div className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide my-2 shadow-sm">
                                    {msg.text}
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
                                            : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-700'
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
                        <button type="button" className="p-3 text-slate-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                            <Paperclip size={20} />
                        </button>
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
