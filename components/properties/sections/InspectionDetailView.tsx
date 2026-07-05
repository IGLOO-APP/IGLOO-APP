import React from 'react';
import { CheckCircle, Film } from 'lucide-react';
import { Inspection, Room, InspectionSignature } from '../../../services/inspectionService';
import { getConditionLabelAndStyle } from '../hooks/usePropertyInspection';

interface InspectionDetailViewProps {
  inspection: Inspection;
  rooms: Room[];
  signatures: InspectionSignature[];
  isTenant?: boolean;
  onBack: () => void;
  onOpenSignature: (type: 'owner' | 'tenant') => void;
}

export const InspectionDetailView: React.FC<InspectionDetailViewProps> = ({
  inspection,
  rooms,
  signatures,
  isTenant,
  onBack,
  onOpenSignature,
}) => {
  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex justify-between items-center px-8 py-6 bg-white dark:bg-black/10 border-b border-gray-100 dark:border-white/5'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-widest rounded'>
              Laudo {inspection.type}
            </span>
            <span className='text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider'>
              REF: INS-{inspection.id.substring(0, 8)}
            </span>
          </div>
          <h2 className='text-base font-black text-slate-900 dark:text-white tracking-tight mt-1 capitalize'>
            Detalhes da Vistoria {inspection.type}
          </h2>
        </div>
        <button
          onClick={onBack}
          className='p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all text-xs font-bold'
        >
          Voltar
        </button>
      </div>

      {/* Details Content */}
      <div className='flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar'>
        {/* Overview Card */}
        <div className='grid md:grid-cols-3 gap-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 p-5 rounded-2xl shadow-sm text-xs font-semibold'>
          <div>
            <span className='text-slate-400 dark:text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5'>
              Vistoriador
            </span>
            <span className='text-slate-800 dark:text-white font-bold'>
              {inspection.inspector_name}
            </span>
          </div>
          <div>
            <span className='text-slate-400 dark:text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5'>
              Data de Inspeção
            </span>
            <span className='text-slate-800 dark:text-white font-bold'>
              {new Date(inspection.inspection_date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div>
            <span className='text-slate-400 dark:text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5'>
              Status Geral
            </span>
            <span className='text-slate-800 dark:text-white font-bold capitalize'>
              {inspection.status}
            </span>
          </div>
        </div>

        {/* Rooms list */}
        <div className='space-y-4'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
            Lista de Cômodos
          </span>
          <div className='space-y-4'>
            {rooms.map((room) => {
              const condInfo = getConditionLabelAndStyle(room.condition);
              return (
                <div
                  key={room.id}
                  className='border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark p-5 rounded-2xl space-y-4 shadow-sm'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider'>
                      {room.room_name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 border text-[8px] font-black rounded ${condInfo.style}`}
                    >
                      {condInfo.label}
                    </span>
                  </div>

                  {room.notes && (
                    <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold italic bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5'>
                      "{room.notes}"
                    </p>
                  )}

                  {room.photos.length > 0 && (
                    <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1'>
                      {room.photos.map((photo, pIdx) => (
                        <a
                          key={pIdx}
                          href={photo}
                          target='_blank'
                          rel='noreferrer'
                          className='aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 relative block shadow-sm hover:scale-[1.02] transition-transform'
                        >
                          <img
                            src={photo}
                            alt={`Foto de ${room.room_name}`}
                            className='w-full h-full object-cover'
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  {room.videos.length > 0 && (
                    <div className='pt-2'>
                      <span className='text-[9px] font-bold uppercase tracking-wider text-[#13c8ec] flex items-center gap-1 mb-2'>
                        <Film size={12} /> Vídeos ({room.videos.length})
                      </span>
                      <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
                        {room.videos.map((video, vIdx) => (
                          <a
                            key={vIdx}
                            href={video}
                            target='_blank'
                            rel='noreferrer'
                            className='aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 relative block shadow-sm hover:scale-[1.02] transition-transform group'
                          >
                            <video
                              src={video}
                              className='w-full h-full object-cover'
                              muted
                              preload='metadata'
                            />
                            <div className='absolute bottom-1 left-1 right-1 flex items-center justify-between px-1.5 py-0.5 bg-black/60 rounded text-[7px] text-white font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity'>
                              <Film size={10} /> Reproduzir
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEÇÃO: Assinaturas */}
        <div className='space-y-4 border-t border-gray-100 dark:border-white/5 pt-6'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
            Assinaturas do Laudo
          </span>

          <div className='grid md:grid-cols-2 gap-4'>
            {/* Proprietário Sign block */}
            <div className='p-5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between'>
              <div className='space-y-1'>
                <h4 className='text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider'>
                  Proprietário / Vistoriador
                </h4>
                <p className='text-[10px] text-slate-400 font-medium'>
                  Responsável por emitir e aprovar o estado geral do imóvel.
                </p>
              </div>

              {signatures.some((s) => s.signer_type === 'owner') ? (
                <div className='p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2'>
                  <CheckCircle size={14} /> Assinado Eletronicamente
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='text-amber-600 border border-amber-100 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-[10px] font-bold px-3 py-2 rounded-xl'>
                    Assinatura pendente.
                  </div>
                  {!isTenant && (
                    <button
                      onClick={() => onOpenSignature('owner')}
                      className='w-full py-2.5 bg-[#13c8ec] text-[#0a0f1a] font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all'
                    >
                      Assinar Documento
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Inquilino Sign block */}
            <div className='p-5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between'>
              <div className='space-y-1'>
                <h4 className='text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider'>
                  Locatário / Inquilino
                </h4>
                <p className='text-[10px] text-slate-400 font-medium'>
                  Revisa e assina o laudo concordando com os apontamentos visuais.
                </p>
              </div>

              {signatures.some((s) => s.signer_type === 'tenant') ? (
                <div className='p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2'>
                  <CheckCircle size={14} /> Assinado Eletronicamente
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='text-amber-600 border border-amber-100 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-[10px] font-bold px-3 py-2 rounded-xl'>
                    Assinatura pendente.
                  </div>
                  {isTenant && (
                    <button
                      onClick={() => onOpenSignature('tenant')}
                      className='w-full py-2.5 bg-[#13c8ec] text-[#0a0f1a] font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all'
                    >
                      Assinar Documento
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
