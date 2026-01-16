import React, { useState, useRef } from 'react';
import { Camera, Video, Plus, Trash2, ChevronRight, CheckCircle, AlertTriangle, ArrowRightLeft, Calendar, User, Save, X, FileText, LayoutList, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Property } from '../../types';

interface Room {
  id: string;
  name: string;
  condition: 'good' | 'damaged' | 'repair_needed';
  description: string;
  images: string[];
  videos: string[];
}

interface Inspection {
  id: number;
  type: 'Entrada' | 'Saída';
  date: string;
  inspector: string;
  rooms: Room[];
}

interface PropertyInspectionProps {
  property: Property;
  onClose: () => void;
}

const mockEntryInspection: Inspection = {
  id: 1,
  type: 'Entrada',
  date: '10/01/2024',
  inspector: 'Imobiliária Igloo',
  rooms: [
    {
      id: 'r1',
      name: 'Sala de Estar',
      condition: 'good',
      description: 'Paredes recém pintadas (Branco Gelo). Piso laminado sem riscos. Janela com fecho funcionando.',
      images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400'],
      videos: []
    },
    {
      id: 'r2',
      name: 'Cozinha',
      condition: 'good',
      description: 'Armários em bom estado. Pia sem vazamentos.',
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400'],
      videos: []
    }
  ]
};

export const PropertyInspection: React.FC<PropertyInspectionProps> = ({ property, onClose }) => {
  const [view, setView] = useState<'list' | 'create' | 'compare'>('list');
  const [inspections, setInspections] = useState<Inspection[]>([mockEntryInspection]);
  
  const [newInspectionType, setNewInspectionType] = useState<'Entrada' | 'Saída'>('Saída');
  const [newRooms, setNewRooms] = useState<Room[]>([]);
  
  // Form States
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [currentRoomDesc, setCurrentRoomDesc] = useState('');
  const [currentRoomCondition, setCurrentRoomCondition] = useState<'good' | 'damaged'>('good');
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentVideos, setCurrentVideos] = useState<string[]>([]);

  // Refs for hidden inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string>('r1');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          if (type === 'image') {
            setCurrentImages([...currentImages, result]);
          } else {
            setCurrentVideos([...currentVideos, result]);
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoom = () => {
    if (!currentRoomName) return;
    const newRoom: Room = {
      id: Date.now().toString(),
      name: currentRoomName,
      condition: currentRoomCondition as any,
      description: currentRoomDesc,
      images: currentImages,
      videos: currentVideos
    };
    setNewRooms([...newRooms, newRoom]);
    
    // Reset Form
    setCurrentRoomName('');
    setCurrentRoomDesc('');
    setCurrentRoomCondition('good');
    setCurrentImages([]);
    setCurrentVideos([]);
  };

  const handleSaveInspection = () => {
    const newInsp: Inspection = {
      id: Date.now(),
      type: newInspectionType,
      date: new Date().toLocaleDateString('pt-BR'),
      inspector: 'Proprietário',
      rooms: newRooms
    };
    setInspections([newInsp, ...inspections]);
    setView('list');
    setNewRooms([]);
  };

  return (
    <ModalWrapper onClose={onClose} className="md:max-w-4xl" showCloseButton={true}>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark flex flex-col h-full">
        
        {view === 'list' && (
          <div className="p-6 space-y-6">
            
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gestão de Vistorias</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Imóvel: {property.name}</p>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setView('create')}
                className="group relative overflow-hidden h-28 rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-1 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
               >
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="h-full w-full rounded-xl bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center gap-2 border border-white/20">
                    <div className="bg-white/20 p-2.5 rounded-full">
                        <Plus size={24} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">Nova Vistoria</span>
                 </div>
               </button>

               <button 
                onClick={() => setView('compare')}
                disabled={inspections.length < 1}
                className="group relative overflow-hidden h-28 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 p-1 shadow-sm transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <div className="h-full w-full rounded-xl flex flex-col items-center justify-center gap-2">
                    <div className="bg-slate-100 dark:bg-white/10 p-2.5 rounded-full text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                        <ArrowRightLeft size={24} />
                    </div>
                    <span className="text-slate-700 dark:text-slate-200 font-bold text-sm tracking-wide">Comparar</span>
                 </div>
               </button>
            </div>

            {/* Timeline / History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutList size={18} className="text-primary" />
                    Histórico
                  </h3>
                  <span className="text-xs font-medium text-slate-400">{inspections.length} registros</span>
              </div>

              {inspections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                      <FileText size={48} className="text-slate-300 mb-3" />
                      <p className="text-slate-900 dark:text-white font-bold">Nenhuma vistoria registrada</p>
                      <p className="text-sm text-slate-500 max-w-xs mt-1">Crie uma vistoria de entrada para documentar o estado do imóvel.</p>
                  </div>
              ) : (
                <div className="relative space-y-4">
                  <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>
                  {inspections.map(insp => (
                    <div key={insp.id} className="relative pl-14 group cursor-pointer transition-transform hover:translate-x-1">
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-4 border-background-light dark:border-background-dark flex items-center justify-center text-xl font-bold z-10 shadow-sm ${
                          insp.type === 'Entrada' 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' 
                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                            {insp.type.charAt(0)}
                        </div>
                        
                        <div className="bg-white dark:bg-surface-dark p-4 pr-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Vistoria de {insp.type}</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 uppercase">Concluída</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {insp.date}</span>
                                    <span className="flex items-center gap-1.5"><User size={14} /> {insp.inspector}</span>
                                </div>
                            </div>
                            
                            <div className="hidden sm:flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    {insp.rooms.filter(r => r.condition === 'good').length} OK
                                </div>
                                {insp.rooms.some(r => r.condition !== 'good') && (
                                    <div className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                                        <AlertTriangle size={12} />
                                        {insp.rooms.filter(r => r.condition !== 'good').length} Avarias
                                    </div>
                                )}
                            </div>
                            
                            <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" size={20} />
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-black/10">
            {/* Header Steps */}
            <div className="bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
               <div className="flex items-center gap-3">
                 <button onClick={() => setView('list')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <X size={20} className="text-slate-500" />
                 </button>
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Nova Vistoria</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{newInspectionType} • {new Date().toLocaleDateString()}</p>
                 </div>
               </div>
               
               <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <button 
                        onClick={() => setNewInspectionType('Entrada')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${newInspectionType === 'Entrada' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                        Entrada
                    </button>
                    <button 
                        onClick={() => setNewInspectionType('Saída')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${newInspectionType === 'Saída' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                        Saída
                    </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Add Room Form */}
                <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span> 
                        Detalhes do Cômodo
                    </h4>
                    
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Nome do ambiente (Ex: Cozinha, Quarto Principal)" 
                            value={currentRoomName}
                            onChange={(e) => setCurrentRoomName(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all font-medium"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setCurrentRoomCondition('good')}
                                className={`relative overflow-hidden p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 h-24 ${
                                    currentRoomCondition === 'good' 
                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-700 dark:text-emerald-400' 
                                    : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-700 text-slate-400 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <CheckCircle size={24} className={currentRoomCondition === 'good' ? 'scale-110' : ''} />
                                <span className="text-xs font-bold uppercase tracking-wide">Em Bom Estado</span>
                            </button>

                            <button 
                                onClick={() => setCurrentRoomCondition('damaged')}
                                className={`relative overflow-hidden p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 h-24 ${
                                    currentRoomCondition === 'damaged' 
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-500 text-red-700 dark:text-red-400' 
                                    : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-700 text-slate-400 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <AlertTriangle size={24} className={currentRoomCondition === 'damaged' ? 'scale-110' : ''} />
                                <span className="text-xs font-bold uppercase tracking-wide">Com Avarias</span>
                            </button>
                        </div>

                        <textarea 
                            placeholder="Descreva detalhes, observações ou itens específicos..." 
                            value={currentRoomDesc}
                            onChange={(e) => setCurrentRoomDesc(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24 dark:text-white transition-all"
                        ></textarea>
                        
                        {/* Hidden Inputs for Camera */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            className="hidden" 
                            ref={photoInputRef}
                            onChange={(e) => handleFileSelect(e, 'image')}
                        />
                        <input 
                            type="file" 
                            accept="video/*" 
                            capture="environment" 
                            className="hidden" 
                            ref={videoInputRef}
                            onChange={(e) => handleFileSelect(e, 'video')}
                        />

                        {/* Media Preview Section */}
                        {(currentImages.length > 0 || currentVideos.length > 0) && (
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {currentImages.map((img, idx) => (
                                    <div key={`img-${idx}`} className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <img src={img} alt="Preview" className="h-full w-full object-cover" />
                                        <button 
                                            onClick={() => setCurrentImages(currentImages.filter((_, i) => i !== idx))}
                                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {currentVideos.map((vid, idx) => (
                                    <div key={`vid-${idx}`} className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black flex items-center justify-center">
                                        <PlayCircle size={20} className="text-white/80" />
                                        <button 
                                            onClick={() => setCurrentVideos(currentVideos.filter((_, i) => i !== idx))}
                                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button 
                                onClick={() => photoInputRef.current?.click()}
                                className="flex-1 h-11 bg-slate-100 dark:bg-white/5 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded-xl flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all active:scale-95"
                            >
                                <Camera size={18} /> Adicionar Fotos
                            </button>
                            <button 
                                onClick={() => videoInputRef.current?.click()}
                                className="flex-1 h-11 bg-slate-100 dark:bg-white/5 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded-xl flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all active:scale-95"
                            >
                                <Video size={18} /> Gravar Vídeo
                            </button>
                        </div>

                        <button 
                            onClick={handleAddRoom}
                            disabled={!currentRoomName}
                            className="w-full h-12 mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            Adicionar à Lista
                        </button>
                    </div>
                </div>

                {/* Added Rooms List */}
                <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white px-1 flex items-center justify-between">
                        <span>Itens Adicionados</span>
                        <span className="text-xs bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{newRooms.length}</span>
                    </h4>
                    
                    {newRooms.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                            <p className="text-xs text-slate-400 italic">Nenhum cômodo adicionado ainda.</p>
                        </div>
                    ) : (
                        newRooms.map((room, idx) => (
                            <div key={idx} className="group bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex gap-4 animate-scaleUp">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                                    room.condition === 'good' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    {room.condition === 'good' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{room.name}</h4>
                                        <button 
                                            onClick={() => setNewRooms(newRooms.filter((_, i) => i !== idx))}
                                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{room.description || 'Sem observações.'}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                            <ImageIcon size={10} /> {room.images.length} Fotos
                                        </span>
                                        {room.videos.length > 0 && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                                <Video size={10} /> {room.videos.length} Vídeos
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5 z-20">
                <button 
                    onClick={handleSaveInspection}
                    disabled={newRooms.length === 0}
                    className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                >
                    <Save size={20} /> Salvar Vistoria
                </button>
            </div>
          </div>
        )}

        {view === 'compare' && (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-black/10">
             <div className="px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5 flex items-center gap-3">
                 <button onClick={() => setView('list')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                     <ArrowRightLeft size={20} className="text-slate-600 dark:text-slate-300" />
                 </button>
                 <div>
                     <h3 className="font-bold text-slate-900 dark:text-white">Comparativo</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400">Entrada vs Saída</p>
                 </div>
             </div>

             <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                 {/* Sidebar Rooms */}
                 <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/5 overflow-x-auto md:overflow-y-auto flex md:flex-col bg-white dark:bg-surface-dark p-2 gap-2">
                    {mockEntryInspection.rooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`flex-shrink-0 md:flex-shrink w-40 md:w-full text-left p-3 rounded-xl transition-all border ${
                                selectedRoomId === room.id 
                                ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                            <p className="font-bold text-sm truncate">{room.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <div className={`w-2 h-2 rounded-full ${room.condition === 'good' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                <span className="text-[10px] opacity-70">Entrada</span>
                            </div>
                        </button>
                    ))}
                 </div>

                 {/* Main Comparison Area */}
                 <div className="flex-1 overflow-y-auto p-4 md:p-6">
                     {mockEntryInspection.rooms.filter(r => r.id === selectedRoomId).map(room => (
                         <div key={room.id} className="grid md:grid-cols-2 gap-6 h-full">
                             {/* Before Card */}
                             <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col overflow-hidden">
                                 <div className="p-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                     <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Vistoria Entrada</span>
                                     <span className="text-[10px] bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-md text-slate-500">10/01/24</span>
                                 </div>
                                 
                                 <div className="aspect-video w-full bg-slate-100 dark:bg-black/20 relative group cursor-pointer overflow-hidden">
                                     <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${room.images[0]})` }}></div>
                                     <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">Foto 1 de 5</div>
                                 </div>

                                 <div className="p-4 flex-1">
                                    <div className="flex items-start gap-2 mb-2">
                                        <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Estado Bom</p>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{room.description}</p>
                                 </div>
                             </div>

                             {/* After Card (Empty State or Data) */}
                             <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden relative">
                                 <div className="p-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-orange-50/50 dark:bg-orange-900/10">
                                     <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Vistoria Saída (Atual)</span>
                                     <span className="text-[10px] bg-white dark:bg-black/20 border border-orange-200 dark:border-orange-800/30 px-2 py-0.5 rounded-md text-orange-600 dark:text-orange-400 font-bold">Pendente</span>
                                 </div>
                                 
                                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-white/5">
                                     <div className="w-16 h-16 bg-white dark:bg-surface-dark rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
                                         <Camera size={28} />
                                     </div>
                                     <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Nenhum registro de saída</p>
                                     <p className="text-xs text-slate-500 max-w-[200px] mb-6">Adicione uma foto atual deste cômodo para comparar as condições.</p>
                                     <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
                                         Registrar Agora
                                     </button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
        )}

      </div>
    </ModalWrapper>
  );
};