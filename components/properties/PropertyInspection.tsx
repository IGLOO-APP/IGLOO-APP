import React, { useState } from 'react';
import { 
    Camera, Plus, Trash2, ChevronRight, CheckCircle, 
    AlertTriangle, Calendar, User, X, LayoutList, 
    Check, Clock, MessageCircle, AlertCircle, 
    ThumbsUp, ThumbsDown, UploadCloud, Loader2, 
    ArrowRightLeft, FileSearch, ArrowRight, ArrowDown,
    Image as ImageIcon, ZoomIn, ChevronDown, CheckCheck,
    Shield, Gavel
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Property } from '../../types';

// --- Types ---

interface TenantFeedback {
    status: 'agreed' | 'contested' | 'pending';
    comment?: string;
    photos?: string[];
    timestamp?: string;
}

interface OwnerResolution {
    status: 'accepted' | 'rejected' | 'pending';
    note?: string;
}

interface InspectionItem {
  id: string;
  name: string;
  status: 'good' | 'damaged' | 'na';
  notes: string;
  photos: string[];
  entryPhoto?: string; // URL for comparison
  exitPhoto?: string;  // URL for comparison
  tenantFeedback?: TenantFeedback;
  ownerResolution?: OwnerResolution;
}

interface Room {
  id: string;
  name: string;
  items: InspectionItem[];
}

interface PropertyInspectionProps {
  property: Property;
  onClose: () => void;
  initialView?: 'list' | 'detail';
}

const ROOM_TEMPLATES = [
    { id: 'kitchen', label: 'Cozinha', items: ['Pintura/Paredes', 'Piso', 'Torneira/Cuba', 'Armários', 'Tomadas/Elétrica'] },
    { id: 'bathroom', label: 'Banheiro', items: ['Pintura/Paredes', 'Vaso Sanitário', 'Chuveiro/Box', 'Torneira/Cuba', 'Espelho'] },
    { id: 'bedroom', label: 'Quarto', items: ['Pintura/Paredes', 'Piso', 'Porta/Fechadura', 'Janela', 'Iluminação'] },
    { id: 'living', label: 'Sala', items: ['Pintura/Paredes', 'Piso', 'Porta Entrada', 'Interfone', 'Tomadas'] }
];

export const PropertyInspection: React.FC<PropertyInspectionProps> = ({ property, onClose, initialView = 'list' }) => {
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [isOwnerMode, setIsOwnerMode] = useState(true); // Toggle for Demo purposes
  
  // Mock Data: Scenario where Tenant has partially responded
  const [inspectionData, setInspectionData] = useState<Room[]>([
      {
          id: 'r1',
          name: 'Sala de Estar',
          items: [
              { 
                  id: 'i1', 
                  name: 'Pintura das Paredes', 
                  status: 'damaged', 
                  notes: 'Manchas escuras e furos de quadros não tapados.', 
                  entryPhoto: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=300', 
                  exitPhoto: 'https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?auto=format&fit=crop&q=80&w=300', 
                  photos: [],
                  tenantFeedback: { 
                      status: 'contested', 
                      comment: 'Essas manchas já existiam na entrada, conforme foto do laudo anterior que tenho aqui. Não fiz furos novos.',
                      timestamp: '10/03/2024 14:30'
                  },
                  ownerResolution: { status: 'pending' }
              },
              { 
                  id: 'i2', 
                  name: 'Piso Laminado', 
                  status: 'good', 
                  notes: 'Em bom estado, desgaste natural.', 
                  entryPhoto: 'https://images.unsplash.com/photo-1581858726768-75e0524d940d?auto=format&fit=crop&q=80&w=300',
                  exitPhoto: 'https://images.unsplash.com/photo-1581858726768-75e0524d940d?auto=format&fit=crop&q=80&w=300',
                  photos: [],
                  tenantFeedback: { status: 'agreed', timestamp: '10/03/2024 14:32' }
              }
          ]
      },
      {
          id: 'r2',
          name: 'Cozinha',
          items: [
              { 
                  id: 'i3', 
                  name: 'Torneira / Cuba', 
                  status: 'damaged', 
                  notes: 'Torneira com vazamento na base.', 
                  entryPhoto: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300',
                  exitPhoto: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=300',
                  photos: [],
                  tenantFeedback: { status: 'pending' }
              }
          ]
      }
  ]);

  // --- Handlers ---

  const handleTenantAction = (roomId: string, itemId: string, action: 'agreed' | 'contested', comment?: string) => {
      setInspectionData(prev => prev.map(room => {
          if (room.id !== roomId) return room;
          return {
              ...room,
              items: room.items.map(item => item.id === itemId ? { 
                  ...item, 
                  tenantFeedback: { status: action, comment, timestamp: new Date().toLocaleString() } 
              } : item)
          };
      }));
  };

  const handleOwnerResolution = (roomId: string, itemId: string, action: 'accepted' | 'rejected') => {
      setInspectionData(prev => prev.map(room => {
          if (room.id !== roomId) return room;
          return {
              ...room,
              items: room.items.map(item => item.id === itemId ? { 
                  ...item, 
                  ownerResolution: { status: action } 
              } : item)
          };
      }));
  };

  const getProgress = () => {
      let total = 0;
      let reviewed = 0;
      inspectionData.forEach(r => r.items.forEach(i => {
          total++;
          if (i.tenantFeedback?.status !== 'pending') reviewed++;
      }));
      return Math.round((reviewed / total) * 100);
  };

  const hasContestations = inspectionData.some(r => r.items.some(i => i.tenantFeedback?.status === 'contested'));

  return (
    <ModalWrapper onClose={onClose} className="md:max-w-5xl" showCloseButton={true}>
      <div className="flex-1 overflow-hidden flex flex-col h-full bg-background-light dark:bg-background-dark relative">
        
        {/* DEMO TOGGLE: OWNER vs TENANT */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-surface-dark p-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex">
            <button 
                onClick={() => setIsOwnerMode(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isOwnerMode ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}
            >
                Visão Proprietário
            </button>
            <button 
                onClick={() => setIsOwnerMode(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isOwnerMode ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}
            >
                Visão Inquilino
            </button>
        </div>

        {/* VIEW: DETAIL / ACTION */}
        {view === 'detail' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                {/* Header */}
                <header className="px-6 py-5 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView('list')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <ArrowRightLeft size={20} className="text-slate-500" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isOwnerMode ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                        {isOwnerMode ? 'Análise de Divergências' : 'Ação Necessária'}
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">Vistoria de Saída #2024-03</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isOwnerMode ? 'Resolução de Conflitos' : 'Confirmação de Laudo'}
                                </h2>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status Geral</p>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${getProgress()}%` }}></div>
                                </div>
                                <span className="text-xs font-bold">{getProgress()}%</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-slate-50 dark:bg-black/10">
                    
                    {/* Context Banner */}
                    <div className={`${isOwnerMode ? 'bg-purple-50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800' : 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800'} border p-4 rounded-xl flex gap-3`}>
                        {isOwnerMode ? (
                            <Gavel className="text-purple-600 dark:text-purple-400 shrink-0" size={24} />
                        ) : (
                            <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
                        )}
                        <div>
                            <h4 className={`font-bold text-sm ${isOwnerMode ? 'text-purple-800 dark:text-purple-300' : 'text-blue-800 dark:text-blue-300'}`}>
                                {isOwnerMode ? 'Ação do Proprietário' : 'Instruções ao Inquilino'}
                            </h4>
                            <p className={`text-xs mt-1 leading-relaxed ${isOwnerMode ? 'text-purple-700 dark:text-purple-400' : 'text-blue-700 dark:text-blue-400'}`}>
                                {isOwnerMode 
                                    ? "O inquilino finalizou a revisão. Itens contestados precisam da sua análise final para liberação do caução ou cobrança." 
                                    : "Compare as fotos de Entrada e Saída. Itens marcados como 'AVARIA' indicam danos que podem gerar custos."}
                            </p>
                        </div>
                    </div>

                    {inspectionData.map((room) => (
                        <div key={room.id} className="space-y-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                {room.name}
                            </h3>

                            {room.items.map((item) => (
                                <div key={item.id} className={`bg-white dark:bg-surface-dark rounded-2xl border shadow-sm overflow-hidden transition-all ${
                                    item.tenantFeedback?.status === 'contested' 
                                    ? 'border-red-200 dark:border-red-900/30 ring-1 ring-red-500/10' 
                                    : item.status === 'damaged' 
                                        ? 'border-orange-200 dark:border-orange-900/30' 
                                        : 'border-gray-100 dark:border-white/5'
                                }`}>
                                    
                                    {/* Item Header */}
                                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${item.status === 'damaged' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                                {item.status === 'damaged' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Vistoria Técnica: <span className="font-bold uppercase">{item.status === 'damaged' ? 'Avaria / Dano' : 'Em ordem'}</span></p>
                                            </div>
                                        </div>
                                        
                                        {/* Status Badge */}
                                        {item.tenantFeedback?.status === 'agreed' && (
                                            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                                <CheckCheck size={14} /> Aceite
                                            </div>
                                        )}
                                        {item.tenantFeedback?.status === 'contested' && (
                                            <div className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded animate-pulse">
                                                <X size={14} /> Contestação
                                            </div>
                                        )}
                                        {item.tenantFeedback?.status === 'pending' && !isOwnerMode && (
                                            <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">Pendente</div>
                                        )}
                                    </div>

                                    <div className="p-4 md:p-6 grid md:grid-cols-2 gap-6">
                                        
                                        {/* Visuals */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Camera size={12}/> Comparativo Visual</span>
                                            </div>
                                            <div className="flex gap-2 h-32 md:h-40">
                                                <div className="flex-1 relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                                                    <img src={item.entryPhoto} alt="Entrada" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">ENTRADA</div>
                                                </div>
                                                <div className="flex-1 relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                                                    <img src={item.exitPhoto} alt="Saída" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute top-2 left-2 bg-orange-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">SAÍDA</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions / Details Area */}
                                        <div className="flex flex-col justify-between h-full">
                                            {/* Inspector Note */}
                                            <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5 mb-3">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Apontamento do Vistoriador</p>
                                                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 italic">"{item.notes}"</p>
                                            </div>

                                            {/* OWNER VIEW LOGIC */}
                                            {isOwnerMode ? (
                                                <div className="mt-auto">
                                                    {item.tenantFeedback?.status === 'contested' ? (
                                                        <div className="space-y-3">
                                                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-xl">
                                                                <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 mb-1">
                                                                    <MessageCircle size={10} /> Justificativa do Inquilino
                                                                </p>
                                                                <p className="text-xs text-red-800 dark:text-red-200">{item.tenantFeedback.comment}</p>
                                                            </div>
                                                            
                                                            {item.ownerResolution?.status === 'pending' ? (
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleOwnerResolution(room.id, item.id, 'accepted')}
                                                                        className="flex-1 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-slate-600 shadow-sm transition-colors"
                                                                    >
                                                                        Acatar Justificativa
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleOwnerResolution(room.id, item.id, 'rejected')}
                                                                        className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg transition-colors"
                                                                    >
                                                                        Manter Cobrança
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className={`p-2 rounded-lg text-center text-xs font-bold ${
                                                                    item.ownerResolution?.status === 'accepted' 
                                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                                    : 'bg-slate-800 text-white'
                                                                }`}>
                                                                    {item.ownerResolution?.status === 'accepted' ? 'Você acatou a justificativa.' : 'Você manteve a cobrança.'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 text-center py-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                                            {item.tenantFeedback?.status === 'agreed' ? 'Inquilino concordou com o apontamento.' : 'Aguardando resposta do inquilino.'}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                            /* TENANT VIEW LOGIC */
                                                <div className="mt-auto">
                                                    {item.tenantFeedback?.status === 'pending' ? (
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => handleTenantAction(room.id, item.id, 'agreed')}
                                                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                                                            >
                                                                <ThumbsUp size={16} /> Concordo
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const reason = prompt("Qual o motivo da contestação?");
                                                                    if(reason) handleTenantAction(room.id, item.id, 'contested', reason);
                                                                }}
                                                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                                            >
                                                                <ThumbsDown size={16} /> Contestar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className={`p-3 rounded-xl border text-xs font-medium ${
                                                            item.tenantFeedback?.status === 'agreed' 
                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                                            : 'bg-red-50 border-red-100 text-red-700'
                                                        }`}>
                                                            {item.tenantFeedback?.status === 'agreed' 
                                                                ? 'Você concordou com este item.' 
                                                                : `Contestação enviada: "${item.tenantFeedback?.comment}"`}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer Action */}
                <div className="p-4 md:p-6 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 z-20 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <div className="text-xs text-slate-500 hidden md:block">
                        {isOwnerMode ? 'Ações irreversíveis após finalização.' : 'Ao finalizar, o laudo será enviado para análise.'}
                    </div>
                    <button 
                        className="w-full md:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                    >
                        {isOwnerMode ? 'Finalizar Resoluções' : 'Enviar Revisão'} <CheckCircle size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* VIEW: LIST (HISTORICO) */}
        {view === 'list' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vistorias</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{property.name}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 transition-all"
                    >
                        <ArrowRightLeft size={18} /> Comparar
                    </button>
                    <button 
                        onClick={() => setView('create')}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all"
                    >
                        <Plus size={18} /> Nova
                    </button>
                </div>
            </div>

            {/* List Items with Owner Logic */}
            <div className="grid gap-4">
                
                {/* Item 1: Output Inspection with Contestations */}
                <div 
                    onClick={() => { setView('detail'); setIsOwnerMode(true); }} // Default to Owner view for this item
                    className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm flex items-center justify-between group hover:border-red-400 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                    <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-red-50 text-red-600 dark:bg-red-900/20">
                            S
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Vistoria de Saída <span className="text-red-500 text-[10px] uppercase bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded ml-2">Divergência</span></h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1"><Calendar size={12}/> 10 Mar 2024</span>
                                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300"><MessageCircle size={12}/> Inquilino contestou 1 item</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                            Resolver
                        </button>
                    </div>
                </div>

                {/* Item 2: Completed Entry Inspection */}
                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                            E
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Vistoria de Entrada</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1"><Calendar size={12}/> 10 Jan 2024</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600">Concluída</span>
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                </div>
            </div>
          </div>
        )}

        {/* Create View */}
        {view === 'create' && (
             <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                <header className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-surface-dark shrink-0">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Montar Vistoria</h3>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Laudo de Saída</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2" onClick={() => setView('list')}>
                            Salvar e Sair
                        </button>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    <p>Interface de criação simplificada para demonstração.</p>
                </div>
             </div>
        )}

      </div>
    </ModalWrapper>
  );
};