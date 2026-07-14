import React from 'react';
import { X, UploadCloud, Loader2, Trash2, ChevronDown, Video, Film } from 'lucide-react';
import {
  NewRoom,
  NewRoomType,
  VisibilityType,
  getConditionLabelAndStyle,
} from '../hooks/usePropertyInspection';

interface InspectionCreateFormProps {
  newType: NewRoomType;
  setNewType: (val: NewRoomType) => void;
  newDate: string;
  setNewDate: (val: string) => void;
  newInspector: string;
  setNewInspector: (val: string) => void;
  newVisibility: VisibilityType;
  setNewVisibility: (val: VisibilityType) => void;
  newRooms: NewRoom[];
  setNewRooms: (val: NewRoom[] | ((prev: NewRoom[]) => NewRoom[])) => void;
  expandedRoom: string | null;
  setExpandedRoom: (val: string | null) => void;
  newGeneralNotes: string;
  setNewGeneralNotes: (val: string) => void;
  newPendingItems: string;
  setNewPendingItems: (val: string) => void;
  isSubmitting: boolean;
  uploadingRoom: string | null;
  uploadingVideoRoom: string | null;
  onPhotoUpload: (roomName: string, files: FileList) => void;
  onRemovePhoto: (roomName: string, photoUrl: string) => void;
  onVideoUpload: (roomName: string, files: FileList) => void;
  onRemoveVideo: (roomName: string, videoUrl: string) => void;
  onSave: (finalStatus: 'rascunho' | 'pendente_assinatura') => void;
  onBack: () => void;
}

export const InspectionCreateForm: React.FC<InspectionCreateFormProps> = ({
  newType,
  setNewType,
  newDate,
  setNewDate,
  newInspector,
  setNewInspector,
  newVisibility,
  setNewVisibility,
  newRooms,
  setNewRooms,
  expandedRoom,
  setExpandedRoom,
  newGeneralNotes,
  setNewGeneralNotes,
  newPendingItems,
  setNewPendingItems,
  isSubmitting,
  uploadingRoom,
  uploadingVideoRoom,
  onPhotoUpload,
  onRemovePhoto,
  onVideoUpload,
  onRemoveVideo,
  onSave,
  onBack,
}) => {
  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex justify-between items-center px-8 py-6 bg-white/5 border-b border-white/10'>
        <div>
          <h2 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-wider'>
            Nova Vistoria
          </h2>
          <p className='text-[10px] text-[#13c8ec] font-black uppercase tracking-widest mt-0.5'>
            Laudo de Inspeção do Imóvel
          </p>
        </div>
        <button
          onClick={onBack}
          className='p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all'
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>

      {/* Form Content */}
      <div className='flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar'>
        {/* SEÇÃO 1: Identificação */}
        <div className='space-y-4'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            Seção 1: Identificação
          </span>
          <div className='grid md:grid-cols-2 gap-6 lg-card lg-card-lift p-6'>
            {/* Tipo de Vistoria Segmented Toggle */}
            <div className='space-y-2'>
              <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                Tipo de Vistoria
              </label>
              <div className='flex bg-white/5 p-1.5 rounded-xl border border-white/10 gap-1'>
                {(['entrada', 'periódica', 'saída'] as const).map((type) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => setNewType(type)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      newType === type
                        ? 'bg-primary text-white shadow-none'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Picker */}
            <div className='space-y-2'>
              <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                Data da Inspeção
              </label>
              <input
                type='date'
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className='w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
              />
            </div>

            {/* Inspector Name */}
            <div className='space-y-2'>
              <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                Vistoriador / Responsável
              </label>
              <input
                type='text'
                value={newInspector}
                onChange={(e) => setNewInspector(e.target.value)}
                placeholder='Nome completo do inspetor...'
                className='w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
              />
            </div>

            {/* Visibility Segmented Toggle */}
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                  Visibilidade do Laudo
                </label>
                <span className='text-[8px] font-black text-[#13c8ec] uppercase tracking-widest'>
                  Controle de Acesso
                </span>
              </div>
              <div className='flex bg-white/5 p-1.5 rounded-xl border border-white/10 gap-1'>
                {(['admin', 'tenant'] as const).map((vis) => (
                  <button
                    key={vis}
                    type='button'
                    onClick={() => setNewVisibility(vis)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      newVisibility === vis
                        ? 'bg-primary text-white shadow-none'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {vis === 'admin' ? 'Apenas Admins' : 'Admin & Inquilino'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: Cômodos e Itens (Accordions) */}
        <div className='space-y-4'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            Seção 2: Estado de Cômodos e Fotos
          </span>
          <div className='space-y-3'>
            {newRooms.map((room) => {
              const isExpanded = expandedRoom === room.room_name;
              const condInfo = getConditionLabelAndStyle(room.condition);
              return (
                <div
                  key={room.room_name}
                  className='lg-card lg-card-lift rounded-2xl overflow-hidden'
                >
                  <button
                    type='button'
                    onClick={() => setExpandedRoom(isExpanded ? null : room.room_name)}
                    className='w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider'>
                        {room.room_name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 border text-[8px] font-black rounded ${condInfo.style}`}
                      >
                        {condInfo.label}
                      </span>
                      {room.photos.length > 0 && (
                        <span className='text-[9px] font-black text-slate-400 uppercase'>
                          ({room.photos.length} Fotos)
                        </span>
                      )}
                      {room.videos.length > 0 && (
                        <span className='text-[9px] font-black text-[#13c8ec] uppercase'>
                          ({room.videos.length} Vídeos)
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      size={16}
                      strokeWidth={1.8}
                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className='p-6 bg-white/5 border-t border-white/10 space-y-4'>
                      {/* Item Condition Select */}
                      <div className='space-y-2'>
                        <label className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>
                          Estado do Cômodo
                        </label>
                        <div className='flex gap-2'>
                          {(['bom', 'regular', 'danificado'] as const).map((c) => {
                            const active = room.condition === c;
                            return (
                              <button
                                key={c}
                                type='button'
                                onClick={() =>
                                  setNewRooms((prev) =>
                                    prev.map((r) =>
                                      r.room_name === room.room_name ? { ...r, condition: c } : r
                                    )
                                  )
                                }
                                className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                  active
                                    ? c === 'bom'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : c === 'regular'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'border-white/10 text-slate-400 hover:text-white'
                                }`}
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className='space-y-2'>
                        <label className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>
                          Observações Detalhadas
                        </label>
                        <textarea
                          value={room.notes}
                          onChange={(e) =>
                            setNewRooms((prev) =>
                              prev.map((r) =>
                                r.room_name === room.room_name ? { ...r, notes: e.target.value } : r
                              )
                            )
                          }
                          placeholder='Descreva o estado das paredes, tomadas, portas e acabamentos...'
                          className='w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-20 resize-none'
                        />
                      </div>

                      {/* Photo Upload Area */}
                      <div className='space-y-3'>
                        <label className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>
                          Fotos de Evidência (Máximo 5 fotos de 5MB)
                        </label>
                        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
                          {/* Upload Button */}
                          {room.photos.length < 5 && (
                            <label className='aspect-square border border-dashed border-white/10 hover:border-primary bg-white/5 hover:bg-white/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 p-3'>
                              {uploadingRoom === room.room_name ? (
                                <Loader2
                                  className='w-5 h-5 text-primary animate-spin'
                                  strokeWidth={1.8}
                                />
                              ) : (
                                <>
                                  <UploadCloud
                                    className='w-5 h-5 text-slate-400'
                                    strokeWidth={1.8}
                                  />
                                  <span className='text-[8px] font-black uppercase text-slate-400 tracking-wider'>
                                    Enviar
                                  </span>
                                </>
                              )}
                              <input
                                type='file'
                                multiple
                                accept='image/*'
                                disabled={uploadingRoom === room.room_name}
                                onChange={(e) =>
                                  e.target.files && onPhotoUpload(room.room_name, e.target.files)
                                }
                                className='hidden'
                              />
                            </label>
                          )}

                          {/* Photo Previews */}
                          {room.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              className='aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 relative group'
                            >
                              <img
                                src={photo}
                                alt={`Foto de ${room.room_name}`}
                                className='w-full h-full object-cover'
                              />
                              <button
                                type='button'
                                onClick={() => onRemovePhoto(room.room_name, photo)}
                                className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-500 hover:text-rose-400 transition-opacity animate-fadeIn'
                              >
                                <Trash2 size={16} strokeWidth={1.8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Video Upload Area */}
                      <div className='space-y-3 pt-2'>
                        <label className='text-[9px] font-bold uppercase tracking-wider text-[#13c8ec] flex items-center gap-1.5'>
                          <Video size={12} strokeWidth={1.8} /> Vídeos de Evidência (Máx. 3 vídeos
                          de 50MB, até 2min, 1080p)
                        </label>
                        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
                          {/* Upload Button */}
                          {room.videos.length < 3 && (
                            <label className='aspect-square border border-dashed border-white/10 hover:border-[#13c8ec] bg-white/5 hover:bg-white/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 p-3'>
                              {uploadingVideoRoom === room.room_name ? (
                                <Loader2
                                  className='w-5 h-5 text-[#13c8ec] animate-spin'
                                  strokeWidth={1.8}
                                />
                              ) : (
                                <>
                                  <Film className='w-5 h-5 text-slate-400' strokeWidth={1.8} />
                                  <span className='text-[8px] font-black uppercase text-slate-400 tracking-wider'>
                                    Vídeo
                                  </span>
                                </>
                              )}
                              <input
                                type='file'
                                multiple
                                accept='video/mp4,video/webm,video/quicktime'
                                disabled={uploadingVideoRoom === room.room_name}
                                onChange={(e) =>
                                  e.target.files && onVideoUpload(room.room_name, e.target.files)
                                }
                                className='hidden'
                              />
                            </label>
                          )}

                          {/* Video Previews */}
                          {room.videos.map((video, vIdx) => (
                            <div
                              key={vIdx}
                              className='aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/10 relative group'
                            >
                              <video
                                src={video}
                                className='w-full h-full object-cover'
                                muted
                                preload='metadata'
                              />
                              <div className='absolute bottom-1 left-1 right-1 flex items-center justify-between px-1.5 py-0.5 bg-black/60 rounded text-[7px] text-white font-black uppercase tracking-wider'>
                                <Film size={10} strokeWidth={1.8} />
                              </div>
                              <button
                                type='button'
                                onClick={() => onRemoveVideo(room.room_name, video)}
                                className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-500 hover:text-rose-400 transition-opacity animate-fadeIn'
                              >
                                <Trash2 size={16} strokeWidth={1.8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEÇÃO 3: Conclusão */}
        <div className='space-y-4'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
            Seção 3: Parecer e Conclusão
          </span>
          <div className='space-y-4 lg-card lg-card-lift p-6'>
            <div className='space-y-2'>
              <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                Notas e Conclusão Geral
              </label>
              <textarea
                value={newGeneralNotes}
                onChange={(e) => setNewGeneralNotes(e.target.value)}
                placeholder='Escreva um resumo geral sobre o laudo...'
                className='w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 resize-none'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                Lista de Pendências / Reparos
              </label>
              <textarea
                value={newPendingItems}
                onChange={(e) => setNewPendingItems(e.target.value)}
                placeholder='Caso haja itens a consertar, liste-os aqui...'
                className='w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-20 resize-none'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions Footer Sticky */}
      <div className='sticky bottom-0 bg-white/5 border-t border-white/10 px-8 py-4 flex justify-end gap-3 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'>
        <button
          type='button'
          disabled={isSubmitting}
          onClick={() => onSave('rascunho')}
          className='px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all'
        >
          Salvar Rascunho
        </button>
        <button
          type='button'
          disabled={isSubmitting}
          onClick={() => onSave('pendente_assinatura')}
          className='px-6 py-3 bg-[#13c8ec] text-[#0a0f1a] hover:scale-[1.02] active:scale-[0.98] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#13c8ec]/20'
        >
          {isSubmitting ? 'Salvando...' : 'Finalizar e Assinar'}
        </button>
      </div>
    </div>
  );
};
