import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  X,
  LayoutList,
  Check,
  Clock,
  MessageCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  UploadCloud,
  Loader2,
  ArrowRightLeft,
  FileSearch,
  ArrowRight,
  ArrowDown,
  Image as ImageIcon,
  ZoomIn,
  ChevronDown,
  CheckCheck,
  Shield,
  Gavel,
  History,
  FileCheck,
  FileWarning,
  Info,
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Property } from '../../types';
import { inspectionService, Inspection, Room } from '../../services/inspectionService';
import { supabase } from '../../lib/supabase';

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
  exitPhoto?: string; // URL for comparison
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
  isTenant?: boolean;
}

const ROOM_TEMPLATES = [
  {
    id: 'kitchen',
    label: 'Cozinha',
    items: ['Pintura/Paredes', 'Piso', 'Torneira/Cuba', 'Armários', 'Tomadas/Elétrica'],
  },
  {
    id: 'bathroom',
    label: 'Banheiro',
    items: ['Pintura/Paredes', 'Vaso Sanitário', 'Chuveiro/Box', 'Torneira/Cuba', 'Espelho'],
  },
  {
    id: 'bedroom',
    label: 'Quarto',
    items: ['Pintura/Paredes', 'Piso', 'Porta/Fechadura', 'Janela', 'Iluminação'],
  },
  {
    id: 'living',
    label: 'Sala',
    items: ['Pintura/Paredes', 'Piso', 'Porta Entrada', 'Interfone', 'Tomadas'],
  },
];

export const PropertyInspection: React.FC<PropertyInspectionProps> = ({
  property,
  onClose,
  initialView = 'list',
  isTenant = false,
}) => {
  const [view, setView] = useState<'list' | 'detail' | 'create'>(
    initialView === 'detail' ? 'detail' : 'list'
  );
  const [isOwnerMode, setIsOwnerMode] = useState(!isTenant);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionData, setInspectionData] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Inspections List
  const fetchInspections = async () => {
    setIsLoading(true);
    const data = await inspectionService.getByProperty(property.id.toString());
    setInspections(data);
    setIsLoading(false);
  };

  // Fetch Inspection Details
  const fetchDetails = async (inspection: Inspection) => {
    setIsLoading(true);
    setSelectedInspection(inspection);
    const data = await inspectionService.getDetails(inspection.id);
    setInspectionData(data);
    setView('detail');
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchInspections();
  }, [property.id]);

  // --- Handlers ---

  const handleTenantAction = async (
    roomId: string,
    itemId: string,
    action: 'agreed' | 'contested',
    comment?: string
  ) => {
    const success = await inspectionService.updateItemFeedback(itemId, { status: action, comment });
    if (success) {
      // Refresh local state or just update the item
      setInspectionData((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          return {
            ...room,
            items: room.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    tenantFeedback: {
                      status: action,
                      comment,
                      timestamp: new Date().toLocaleString(),
                    },
                  }
                : item
            ),
          };
        })
      );
    }
  };

  const handleOwnerResolution = async (
    roomId: string,
    itemId: string,
    action: 'accepted' | 'rejected'
  ) => {
    const success = await inspectionService.updateItemResolution(itemId, action);
    if (success) {
      setInspectionData((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          return {
            ...room,
            items: room.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    ownerResolution: { status: action },
                  }
                : item
            ),
          };
        })
      );
    }
  };

  const getProgress = () => {
    let total = 0;
    let reviewed = 0;
    inspectionData.forEach((r) =>
      r.items.forEach((i) => {
        total++;
        if (i.tenantFeedback?.status !== 'pending') reviewed++;
      })
    );
    return Math.round((reviewed / total) * 100);
  };

  const hasContestations = inspectionData.some((r) =>
    r.items.some((i) => i.tenantFeedback?.status === 'contested')
  );

  return (
    <ModalWrapper onClose={onClose} className='md:max-w-5xl' showCloseButton={true}>
      <div className='flex-1 overflow-hidden flex flex-col h-full bg-background-light dark:bg-background-dark relative'>
        {/* DEMO TOGGLE: OWNER vs TENANT - Refined style */}
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-gray-200/50 dark:border-white/10 flex gap-1'>
          <button
            onClick={() => setIsOwnerMode(true)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isOwnerMode ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            Modo Administrador
          </button>
          <button
            onClick={() => setIsOwnerMode(false)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isOwnerMode ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            Modo Inquilino
          </button>
        </div>

        {/* VIEW: DETAIL / ACTION */}
        {view === 'detail' && (
          <div className='flex-1 flex flex-col overflow-hidden animate-fadeIn'>
            <header className='px-8 py-6 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 shrink-0'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                   <button
                    onClick={() => {
                      setView('list');
                      setSelectedInspection(null);
                      setInspectionData([]);
                    }}
                    className='h-10 w-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                  >
                    <ArrowRightLeft size={20} className='text-slate-400' />
                  </button>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <div className='flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter'>
                        <Shield size={10} /> Laudo Oficial
                      </div>
                      <span className='text-slate-400 dark:text-slate-500 text-[10px] font-bold font-mono tracking-tight'>
                        REF: INS-2024-03-SAIDA
                      </span>
                    </div>
                    <h2 className='text-2xl font-black text-slate-900 dark:text-white tracking-tight'>
                      {isOwnerMode ? 'Resolução de Divergências' : 'Validação de Laudo Técnico'}
                    </h2>
                  </div>
                </div>
                <div className='text-right hidden md:block min-w-[200px]'>
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Progresso da Revisão</span>
                    <span className='text-xs font-mono font-black text-primary'>{getProgress()}%</span>
                  </div>
                  <div className='w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary transition-all duration-700 ease-out'
                      style={{ width: `${getProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-slate-50 dark:bg-black/10'>
              <div
                className={`${isOwnerMode ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800' : 'bg-slate-900 border-slate-800 text-white'} border p-5 rounded-2xl flex gap-4 shadow-sm`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isOwnerMode ? 'bg-indigo-100 text-indigo-600' : 'bg-white/10 text-primary'}`}>
                  {isOwnerMode ? <Gavel size={24} /> : <FileSearch size={24} />}
                </div>
                <div>
                  <h4 className={`font-black text-[10px] uppercase tracking-widest mb-1 ${isOwnerMode ? 'text-indigo-900 dark:text-indigo-200' : 'text-white'}`}>
                    {isOwnerMode ? 'Painel de Conciliação' : 'Orientações de Revisão'}
                  </h4>
                  <p className={`text-xs leading-relaxed font-medium ${isOwnerMode ? 'text-indigo-800/80 dark:text-indigo-400' : 'text-slate-400'}`}>
                    {isOwnerMode
                      ? 'Analise os itens onde o inquilino apontou divergências. Você pode acatar a justificativa ou manter o laudo original.'
                      : "Verifique cuidadosamente cada apontamento comparando as fotos. Sua confirmação encerra o processo de vistoria."}
                  </p>
                </div>
              </div>

              {inspectionData.map((room) => (
                <div key={room.id} className='space-y-4'>
                  <h3 className='font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 px-1'>
                    <div className='w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600'></div>
                    {room.name}
                  </h3>

                  {room.items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white dark:bg-surface-dark rounded-2xl border shadow-sm overflow-hidden transition-all group ${
                        item.tenantFeedback?.status === 'contested'
                          ? 'border-red-200 dark:border-red-900/30'
                          : item.status === 'damaged'
                            ? 'border-orange-100 dark:border-orange-900/30'
                            : 'border-gray-100 dark:border-white/5'
                      }`}
                    >
                      {/* Item Header */}
                      <div className='p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`p-2 rounded-lg ${item.status === 'damaged' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}
                          >
                            {item.status === 'damaged' ? (
                              <AlertTriangle size={20} />
                            ) : (
                              <CheckCircle size={20} />
                            )}
                          </div>
                          <div>
                            <h4 className='font-bold text-slate-900 dark:text-white text-sm'>
                              {item.name}
                            </h4>
                            <p className='text-xs text-slate-500 dark:text-slate-400'>
                              Vistoria Técnica:{' '}
                              <span className='font-bold uppercase'>
                                {item.status === 'damaged' ? 'Avaria / Dano' : 'Em ordem'}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {item.tenantFeedback?.status === 'agreed' && (
                          <div className='flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded'>
                            <CheckCheck size={14} /> Aceite
                          </div>
                        )}
                        {item.tenantFeedback?.status === 'contested' && (
                          <div className='flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded animate-pulse'>
                            <X size={14} /> Contestação
                          </div>
                        )}
                        {item.tenantFeedback?.status === 'pending' && !isOwnerMode && (
                          <div className='text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded'>
                            Pendente
                          </div>
                        )}
                      </div>

                      <div className='p-4 md:p-6 grid md:grid-cols-2 gap-6'>
                        {/* Visuals */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs font-bold text-slate-500 uppercase flex items-center gap-1'>
                              <Camera size={12} /> Comparativo Visual
                            </span>
                          </div>
                          <div className='flex gap-2 h-32 md:h-40'>
                            <div className='flex-1 relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/10'>
                              {item.entryPhoto ? (
                                <img
                                  src={item.entryPhoto}
                                  alt='Entrada'
                                  className='w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity'
                                />
                              ) : (
                                <div className='w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600'>
                                  <ImageIcon size={24} />
                                  <span className='text-[8px] font-black uppercase mt-1'>Sem Foto</span>
                                </div>
                              )}
                              <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded'>
                                ENTRADA
                              </div>
                            </div>
                            <div className='flex-1 relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/10'>
                              {item.exitPhoto ? (
                                <img
                                  src={item.exitPhoto}
                                  alt='Saída'
                                  className='w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity'
                                />
                              ) : (
                                <div className='w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600'>
                                  <ImageIcon size={24} />
                                  <span className='text-[8px] font-black uppercase mt-1'>Sem Foto</span>
                                </div>
                              )}
                              <div className='absolute top-2 left-2 bg-orange-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded'>
                                SAÍDA
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions / Details Area */}
                        <div className='flex flex-col justify-between h-full'>
                          {/* Inspector Note */}
                          <div className='bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5 mb-3'>
                            <p className='text-[10px] font-bold text-slate-400 uppercase mb-1'>
                              Apontamento do Vistoriador
                            </p>
                            <p className='text-xs md:text-sm text-slate-700 dark:text-slate-300 italic'>
                              "{item.notes}"
                            </p>
                          </div>

                          {/* OWNER VIEW LOGIC */}
                          {isOwnerMode ? (
                            <div className='mt-auto'>
                              {item.tenantFeedback?.status === 'contested' ? (
                                <div className='space-y-3'>
                                  <div className='bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-xl'>
                                    <p className='text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 mb-1'>
                                      <MessageCircle size={10} /> Justificativa do Inquilino
                                    </p>
                                    <p className='text-xs text-red-800 dark:text-red-200'>
                                      {item.tenantFeedback.comment}
                                    </p>
                                  </div>

                                  {item.ownerResolution?.status === 'pending' ? (
                                    <div className='flex gap-2'>
                                      <button
                                        onClick={() =>
                                          handleOwnerResolution(room.id, item.id, 'accepted')
                                        }
                                        className='flex-1 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-slate-600 shadow-sm transition-colors'
                                      >
                                        Acatar Justificativa
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleOwnerResolution(room.id, item.id, 'rejected')
                                        }
                                        className='flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg transition-colors'
                                      >
                                        Manter Cobrança
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      className={`p-2 rounded-lg text-center text-xs font-bold ${
                                        item.ownerResolution?.status === 'accepted'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-slate-800 text-white'
                                      }`}
                                    >
                                      {item.ownerResolution?.status === 'accepted'
                                        ? 'Você acatou a justificativa.'
                                        : 'Você manteve a cobrança.'}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className='text-xs text-slate-400 text-center py-2 bg-slate-50 dark:bg-white/5 rounded-lg'>
                                  {item.tenantFeedback?.status === 'agreed'
                                    ? 'Inquilino concordou com o apontamento.'
                                    : 'Aguardando resposta do inquilino.'}
                                </p>
                              )}
                            </div>
                          ) : (
                            /* TENANT VIEW LOGIC */
                            <div className='mt-auto'>
                              {item.tenantFeedback?.status === 'pending' ? (
                                <div className='flex gap-3'>
                                  <button
                                    onClick={() => handleTenantAction(room.id, item.id, 'agreed')}
                                    className='flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all'
                                  >
                                    <ThumbsUp size={16} /> Concordo
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Qual o motivo da contestação?');
                                      if (reason)
                                        handleTenantAction(room.id, item.id, 'contested', reason);
                                    }}
                                    className='flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all'
                                  >
                                    <ThumbsDown size={16} /> Contestar
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className={`p-3 rounded-xl border text-xs font-medium ${
                                    item.tenantFeedback?.status === 'agreed'
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                      : 'bg-red-50 border-red-100 text-red-700'
                                  }`}
                                >
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
            <div className='p-4 md:p-6 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 z-20 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'>
              <div className='text-xs text-slate-500 hidden md:block'>
                {isOwnerMode
                  ? 'Ações irreversíveis após finalização.'
                  : 'Ao finalizar, o laudo será enviado para análise.'}
              </div>
              <button className='w-full md:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2'>
                {isOwnerMode ? 'Finalizar Resoluções' : 'Enviar Revisão'} <CheckCircle size={18} />
              </button>
            </div>
          </div>
        )}

        {/* VIEW: LIST (HISTORICO) */}
        {view === 'list' && (
          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-bold text-slate-900 dark:text-white'>Vistorias</h2>
                <p className='text-sm text-slate-500 dark:text-slate-400'>{property.name}</p>
              </div>
              <div className='flex gap-2'>
                <button className='flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 transition-all'>
                  <ArrowRightLeft size={18} /> Comparar
                </button>
                {!isTenant && (
                  <button
                    onClick={() => setView('create')}
                    className='flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all'
                  >
                    <Plus size={18} /> Nova
                  </button>
                )}
              </div>
            </div>

            {/* List Items with Real Data */}
            <div className='grid gap-6'>
              {isLoading && inspections.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 gap-4'>
                  <Loader2 className='text-primary animate-spin' size={32} />
                  <p className='text-xs font-black text-slate-400 uppercase tracking-widest'>Sincronizando Laudos...</p>
                </div>
              ) : inspections.length > 0 ? (
                inspections.map((ins) => (
                  <div
                    key={ins.id}
                    onClick={() => fetchDetails(ins)}
                    className={`bg-white dark:bg-surface-dark py-8 px-8 rounded-[2rem] border-2 shadow-sm flex items-center justify-between group transition-all cursor-pointer relative overflow-hidden ${
                      ins.status === 'Divergência' 
                        ? 'border-red-100 dark:border-red-900/20 hover:border-red-400' 
                        : 'border-gray-100 dark:border-white/5 hover:border-primary/30'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${ins.status === 'Divergência' ? 'bg-red-500' : 'bg-primary'}`}></div>
                    <div className='flex items-center gap-6 pl-2'>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl ${
                        ins.type === 'OUT' 
                          ? 'bg-red-50 text-red-600 dark:bg-red-900/20' 
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                      }`}>
                        {ins.type}
                      </div>
                      <div>
                        <div className='flex items-center gap-2 mb-1.5'>
                          <h4 className='font-black text-slate-900 dark:text-white text-xl tracking-tighter'>
                            Vistoria de {ins.type === 'IN' ? 'Entrada' : 'Saída'}
                          </h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                            ins.status === 'Divergência' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {ins.status}
                          </span>
                        </div>
                        <div className='flex items-center gap-5 text-[10px] text-slate-400 font-black uppercase tracking-widest'>
                          <span className='flex items-center gap-1.5'>
                            <Calendar size={14} className='text-primary' /> {new Date(ins.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className='flex items-center gap-1.5'>
                            <Clock size={14} /> Atualizado recentemente
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all ${
                      ins.status === 'Divergência'
                        ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-300 group-hover:text-primary group-hover:bg-primary/5'
                    }`}>
                      <ChevronRight size={28} />
                    </div>
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center py-24 text-center opacity-40'>
                  <div className='w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6'>
                    <FileSearch size={40} />
                  </div>
                  <h4 className='font-black text-slate-900 dark:text-white text-lg uppercase tracking-tighter'>
                    Nenhuma Vistoria
                  </h4>
                  <p className='text-sm text-slate-500 mt-2 max-w-xs mx-auto font-medium'>
                    Este imóvel ainda não possui laudos de vistoria técnicos registrados.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create View */}
        {view === 'create' && (
          <div className='flex-1 flex flex-col overflow-hidden animate-fadeIn'>
            <header className='px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-surface-dark shrink-0'>
              <div>
                <h3 className='font-bold text-slate-900 dark:text-white'>Montar Vistoria</h3>
                <p className='text-[10px] text-primary font-black uppercase tracking-widest mt-0.5'>
                  Laudo de Saída
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  className='bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2'
                  onClick={() => setView('list')}
                >
                  Salvar e Sair
                </button>
              </div>
            </header>
            <div className='flex-1 flex items-center justify-center text-slate-400'>
              <p>Interface de criação simplificada para demonstração.</p>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
