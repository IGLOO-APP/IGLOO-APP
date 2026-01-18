import React, { useState, useMemo } from 'react';
import { 
    Camera, Plus, Trash2, ChevronRight, CheckCircle, 
    AlertTriangle, Calendar, User, X, LayoutList, 
    Check, Clock, MessageCircle, AlertCircle, 
    ThumbsUp, ThumbsDown, UploadCloud, Loader2, 
    ArrowRightLeft, FileSearch, ArrowRight, ArrowDown,
    Image as ImageIcon
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Property } from '../../types';

// --- Types ---

interface InspectionItem {
  id: string;
  name: string;
  status: 'good' | 'damaged' | 'na';
  notes: string;
  photos: string[];
  tenantFeedback?: {
      status: 'agreed' | 'contested';
      comment?: string;
  };
}

interface Room {
  id: string;
  name: string;
  items: InspectionItem[];
}

interface Inspection {
  id: number;
  type: 'Entrada' | 'Saída';
  date: string;
  inspector: string;
  status: 'completed' | 'pending_tenant' | 'contested';
  rooms: Room[];
}

interface PropertyInspectionProps {
  property: Property;
  onClose: () => void;
  initialView?: 'list' | 'create' | 'compare' | 'share' | 'tenant_view';
}

const ROOM_TEMPLATES = [
    { id: 'kitchen', label: 'Cozinha', items: ['Pintura/Paredes', 'Piso', 'Torneira/Cuba', 'Armários', 'Tomadas/Elétrica'] },
    { id: 'bathroom', label: 'Banheiro', items: ['Pintura/Paredes', 'Vaso Sanitário', 'Chuveiro/Box', 'Torneira/Cuba', 'Espelho'] },
    { id: 'bedroom', label: 'Quarto', items: ['Pintura/Paredes', 'Piso', 'Porta/Fechadura', 'Janela', 'Iluminação'] },
    { id: 'living', label: 'Sala', items: ['Pintura/Paredes', 'Piso', 'Porta Entrada', 'Interfone', 'Tomadas'] }
];

export const PropertyInspection: React.FC<PropertyInspectionProps> = ({ property, onClose, initialView = 'list' }) => {
  const [view, setView] = useState<'list' | 'create' | 'compare' | 'share' | 'tenant_view'>(initialView);
  
  // Mock Data for Comparison
  const [inspections] = useState<Inspection[]>([
      {
          id: 1,
          type: 'Entrada',
          date: '10/01/2024',
          inspector: 'Igloo Oficial',
          status: 'completed',
          rooms: [
              {
                  id: 'r1',
                  name: 'Cozinha',
                  items: [
                      { id: 'i1', name: 'Pintura', status: 'good', notes: 'Nova', photos: [] },
                      { id: 'i2', name: 'Piso', status: 'good', notes: 'Sem riscos', photos: [] }
                  ]
              }
          ]
      },
      {
          id: 2,
          type: 'Saída',
          date: '17/01/2026',
          inspector: 'Igloo Oficial',
          status: 'pending_tenant',
          rooms: [
              {
                  id: 'r1',
                  name: 'Cozinha',
                  items: [
                      { id: 'i1', name: 'Pintura', status: 'damaged', notes: 'Manchas de gordura e furos', photos: [] },
                      { id: 'i2', name: 'Piso', status: 'good', notes: 'Mantido', photos: [] }
                  ]
              }
          ]
      }
  ]);

  // Create Flow State
  const [newInspectionType, setNewInspectionType] = useState<'Entrada' | 'Saída'>('Saída');
  const [addedRooms, setAddedRooms] = useState<Room[]>([]);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');

  // --- Handlers ---

  const addRoomByTemplate = (template: typeof ROOM_TEMPLATES[0]) => {
      const newRoom: Room = {
          id: `room-${Date.now()}`,
          name: template.label,
          items: template.items.map((name, idx) => ({
              id: `item-${Date.now()}-${idx}`,
              name,
              status: 'good',
              notes: '',
              photos: []
          }))
      };
      setAddedRooms([...addedRooms, newRoom]);
      setIsAddingRoom(false);
  };

  const addItemToRoom = (roomId: string) => {
      const itemName = prompt("Nome do item (ex: Ar Condicionado, Cortina):");
      if (!itemName) return;
      
      setAddedRooms(prev => prev.map(room => {
          if (room.id !== roomId) return room;
          return {
              ...room,
              items: [...room.items, {
                  id: `item-${Date.now()}`,
                  name: itemName,
                  status: 'good',
                  notes: '',
                  photos: []
              }]
          };
      }));
  };

  const removeItemFromRoom = (roomId: string, itemId: string) => {
      setAddedRooms(prev => prev.map(room => {
          if (room.id !== roomId) return room;
          return { ...room, items: room.items.filter(i => i.id !== itemId) };
      }));
  };

  const updateItemStatus = (roomId: string, itemId: string, status: 'good' | 'damaged' | 'na') => {
      setAddedRooms(prev => prev.map(room => {
          if (room.id !== roomId) return room;
          return {
              ...room,
              items: room.items.map(item => item.id === itemId ? { ...item, status } : item)
          };
      }));
  };

  // --- Comparison Logic ---
  const compEntry = inspections[0];
  const compExit = inspections[1];

  const getStatusIcon = (status: string) => {
      if (status === 'good') return <CheckCircle size={14} className="text-emerald-500" />;
      if (status === 'damaged') return <AlertTriangle size={14} className="text-red-500" />;
      return <X size={14} className="text-slate-400" />;
  };

  return (
    <ModalWrapper onClose={onClose} className="md:max-w-5xl" showCloseButton={view !== 'tenant_view'}>
      <div className="flex-1 overflow-hidden flex flex-col h-full bg-background-light dark:bg-background-dark">
        
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
                        onClick={() => setView('compare')}
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

            <div className="grid gap-4">
              {inspections.map(insp => (
                <div key={insp.id} onClick={() => setView('compare')} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${insp.type === 'Entrada' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'}`}>
                            {insp.type.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Vistoria de {insp.type}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {insp.date}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${insp.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {insp.status === 'completed' ? 'Concluída' : 'Pendente'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: COMPARE (LADO A LADO) */}
        {view === 'compare' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
                <header className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-surface-dark shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView('list')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"><ChevronRight size={20} className="rotate-180" /></button>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ArrowRightLeft size={18} className="text-primary" />
                            Comparativo de Vistorias
                        </h3>
                    </div>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                        <FileSearch size={14} /> Gerar Laudo PDF
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black/20">
                    {/* Sticky Table Header */}
                    <div className="sticky top-0 z-20 grid grid-cols-2 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shadow-sm">
                        <div className="p-4 border-r border-gray-100 dark:border-white/5 text-center">
                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Vistoria Base</p>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Entrada - {compEntry.date}</h4>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-1">Vistoria Atual</p>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Saída - {compExit.date}</h4>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 space-y-8">
                        {compEntry.rooms.map((roomEntry) => {
                            const roomExit = compExit.rooms.find(r => r.name === roomEntry.name);
                            return (
                                <div key={roomEntry.id} className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-4 w-1 bg-primary rounded-full"></div>
                                        <h5 className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-tighter">{roomEntry.name}</h5>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
                                        {roomEntry.items.map((itemEntry) => {
                                            const itemExit = roomExit?.items.find(i => i.name === itemEntry.name);
                                            const hasRegression = itemEntry.status === 'good' && itemExit?.status === 'damaged';

                                            return (
                                                <div key={itemEntry.id} className="grid grid-cols-2 relative group">
                                                    {/* Regression Alert Badge */}
                                                    {hasRegression && (
                                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                                                            <AlertCircle size={10} /> DANO NOVO
                                                        </div>
                                                    )}

                                                    {/* Left Column: Entry */}
                                                    <div className="p-5 border-r border-gray-50 dark:border-white/5 flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-white">{itemEntry.name}</p>
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">{getStatusIcon(itemEntry.status)} BOM</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 line-clamp-2">"{itemEntry.notes}"</p>
                                                        <div className="flex gap-1 mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <ImageIcon size={14} className="text-slate-300" />
                                                            <span className="text-[10px] text-slate-400">2 fotos</span>
                                                        </div>
                                                    </div>

                                                    {/* Right Column: Exit */}
                                                    <div className={`p-5 flex flex-col gap-2 transition-colors ${hasRegression ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-white">{itemEntry.name}</p>
                                                            <span className={`flex items-center gap-1 text-[10px] font-bold ${itemExit?.status === 'damaged' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                {getStatusIcon(itemExit?.status || 'na')} 
                                                                {itemExit?.status === 'damaged' ? 'AVARIA' : 'BOM'}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs ${itemExit?.status === 'damaged' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-400'} line-clamp-2`}>
                                                            "{itemExit?.notes || 'Nenhuma observação.'}"
                                                        </p>
                                                        <div className="flex gap-2 mt-1">
                                                            <button className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
                                                                <ImageIcon size={14} /> Ver Foto Atual
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <footer className="p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 flex gap-3">
                    <button onClick={() => setView('list')} className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-sm">Voltar</button>
                    <button className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20">Aprovar Comparativo</button>
                </footer>
            </div>
        )}

        {/* VIEW: CREATE (WIZARD COM CÔMODOS E ITENS DINÂMICOS) */}
        {view === 'create' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
             <header className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-surface-dark shrink-0">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Montar Vistoria</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Laudo de Saída</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsAddingRoom(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all hover:bg-slate-200">
                        <Plus size={16} /> Cômodo
                    </button>
                    <button onClick={() => setView('share')} className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2">
                        Finalizar <ArrowRight size={16} />
                    </button>
                </div>
             </header>

             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-black/10">
                {addedRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-surface-dark border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-slate-300">
                            <LayoutList size={32} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Nenhum cômodo no laudo ainda.</p>
                        <button onClick={() => setIsAddingRoom(true)} className="text-primary font-bold text-sm underline">Clique para começar</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {addedRooms.map(room => (
                            <div key={room.id} className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden animate-slideUp">
                                <div className="px-5 py-4 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center border-b border-gray-50 dark:border-white/5">
                                    <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        {room.name}
                                    </h4>
                                    <button onClick={() => setAddedRooms(addedRooms.filter(r => r.id !== room.id))} className="text-slate-400 hover:text-red-500 p-1 transition-colors"><Trash2 size={16} /></button>
                                </div>
                                <div className="p-5 space-y-6">
                                    {room.items.map(item => (
                                        <div key={item.id} className="space-y-3 pb-5 border-b last:border-0 border-gray-50 dark:border-white/5 last:pb-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => removeItemFromRoom(room.id, item.id)} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{item.name}</p>
                                                </div>
                                                <div className="flex bg-slate-100 dark:bg-black/30 p-1 rounded-xl gap-1">
                                                    {[
                                                        { id: 'good', label: 'BOM', color: 'bg-emerald-500' },
                                                        { id: 'damaged', label: 'AVARIA', color: 'bg-red-500' }
                                                    ].map(st => (
                                                        <button 
                                                            key={st.id}
                                                            onClick={() => updateItemStatus(room.id, item.id, st.id as any)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${item.status === st.id ? `${st.color} text-white shadow-md` : 'text-slate-400'}`}
                                                        >
                                                            {st.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {item.status === 'damaged' && (
                                                <textarea 
                                                    className="w-full text-xs p-3 rounded-xl bg-red-50/30 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 text-slate-800 dark:text-slate-200 outline-none placeholder:text-red-300"
                                                    placeholder="Descreva a avaria..."
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addItemToRoom(room.id)}
                                        className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all"
                                    >
                                        <Plus size={14} /> Adicionar Item ao Cômodo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>

             {isAddingRoom && (
                 <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
                     <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl animate-scaleUp">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Cômodo</h3>
                            <button onClick={() => setIsAddingRoom(false)} className="text-slate-400 p-2"><X size={24}/></button>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            {ROOM_TEMPLATES.map(template => (
                                <button key={template.id} onClick={() => addRoomByTemplate(template)} className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-primary hover:text-primary transition-all text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {template.label}
                                </button>
                            ))}
                         </div>
                         <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                            <div className="flex gap-2">
                                <input 
                                    value={customRoomName} onChange={e => setCustomRoomName(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 dark:text-white text-sm" placeholder="Nome personalizado..." 
                                />
                                <button onClick={() => {
                                    const newRoom: Room = { id: `r-${Date.now()}`, name: customRoomName || 'Outro', items: [] };
                                    setAddedRooms([...addedRooms, newRoom]);
                                    setCustomRoomName('');
                                    setIsAddingRoom(false);
                                }} className="bg-primary text-white px-4 rounded-xl font-bold text-sm">Ok</button>
                            </div>
                         </div>
                     </div>
                 </div>
             )}
          </div>
        )}

        {/* VIEW: SHARE / FINAL */}
        {view === 'share' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                    <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Laudo Pronto!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm text-sm">
                    A vistoria foi gerada com sucesso e está pronta para o comparativo final com a vistoria de entrada.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs mt-10">
                    <button onClick={() => setView('compare')} className="h-14 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                        <ArrowRightLeft size={20} /> Ver Comparativo Final
                    </button>
                    <button className="h-14 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all">
                        <MessageCircle size={20} /> Enviar para Inquilino
                    </button>
                </div>
            </div>
        )}

      </div>
    </ModalWrapper>
  );
};