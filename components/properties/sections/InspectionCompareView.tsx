import React from 'react';
import { AlertCircle, Film } from 'lucide-react';
import { Inspection, Room } from '../../../services/inspectionService';
import { getConditionLabelAndStyle } from '../hooks/usePropertyInspection';

interface InspectionCompareViewProps {
  ins1: Inspection;
  ins2: Inspection;
  rooms1: Room[];
  rooms2: Room[];
  roomTemplates: readonly string[];
  onBack: () => void;
}

export const InspectionCompareView: React.FC<InspectionCompareViewProps> = ({
  ins1,
  ins2,
  rooms1,
  rooms2,
  roomTemplates,
  onBack,
}) => {
  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex justify-between items-center px-8 py-5 bg-white dark:bg-black/10 border-b border-gray-100 dark:border-white/5'>
        <div>
          <h2 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-wider'>
            Comparador de Laudos
          </h2>
          <p className='text-[10px] text-slate-400 font-semibold mt-0.5'>
            Vistoria 1 ({new Date(ins1.inspection_date).toLocaleDateString('pt-BR')}) vs Vistoria 2
            ({new Date(ins2.inspection_date).toLocaleDateString('pt-BR')})
          </p>
        </div>
        <button
          onClick={onBack}
          className='px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all'
        >
          Voltar à Lista
        </button>
      </div>

      {/* Comparison Content */}
      <div className='flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar'>
        {roomTemplates.map((roomName) => {
          const r1 = rooms1.find((r) => r.room_name === roomName);
          const r2 = rooms2.find((r) => r.room_name === roomName);

          const hasDiff = r1 && r2 && r1.condition !== r2.condition;

          return (
            <div
              key={roomName}
              className={`border p-6 rounded-2xl transition-all shadow-sm ${
                hasDiff
                  ? 'bg-amber-500/[0.03] border-amber-500/30'
                  : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5'
              }`}
            >
              <div className='flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3 mb-4'>
                <span className='text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider'>
                  {roomName}
                </span>
                {hasDiff && (
                  <span className='flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse'>
                    <AlertCircle size={10} /> Diferença de Estado Detectada
                  </span>
                )}
              </div>

              <div className='grid md:grid-cols-2 gap-8'>
                {/* Left side: Vistoria 1 */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[9px] text-slate-400 font-bold uppercase tracking-wider'>
                      Laudo 1 ({ins1.type})
                    </span>
                    {r1 && (
                      <span
                        className={`px-2 py-0.5 border text-[8px] font-black rounded ${getConditionLabelAndStyle(r1.condition).style}`}
                      >
                        {r1.condition}
                      </span>
                    )}
                  </div>
                  {r1?.notes && (
                    <p className='text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold italic bg-slate-50 dark:bg-black/20 p-3 border border-slate-100 dark:border-white/5 rounded-xl'>
                      "{r1.notes}"
                    </p>
                  )}
                  {r1?.photos && r1.photos.length > 0 && (
                    <div className='flex gap-2 overflow-x-auto pb-1 max-w-full'>
                      {r1.photos.map((p, idx) => (
                        <img
                          key={idx}
                          src={p}
                          alt='Vistoria 1'
                          className='w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-white/10 shrink-0'
                        />
                      ))}
                    </div>
                  )}
                  {r1?.videos && r1.videos.length > 0 && (
                    <div className='flex gap-2 overflow-x-auto pb-1 max-w-full'>
                      {r1.videos.map((v, idx) => (
                        <div
                          key={idx}
                          className='w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 relative group'
                        >
                          <video
                            src={v}
                            muted
                            preload='metadata'
                            className='w-full h-full object-cover'
                          />
                          <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Film size={12} className='text-white' />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side: Vistoria 2 */}
                <div className='space-y-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/5 pt-4 md:pt-0 md:pl-8'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[9px] text-slate-400 font-bold uppercase tracking-wider'>
                      Laudo 2 ({ins2.type})
                    </span>
                    {r2 && (
                      <span
                        className={`px-2 py-0.5 border text-[8px] font-black rounded ${getConditionLabelAndStyle(r2.condition).style}`}
                      >
                        {r2.condition}
                      </span>
                    )}
                  </div>
                  {r2?.notes && (
                    <p className='text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold italic bg-slate-50 dark:bg-black/20 p-3 border border-slate-100 dark:border-white/5 rounded-xl'>
                      "{r2.notes}"
                    </p>
                  )}
                  {r2?.photos && r2.photos.length > 0 && (
                    <div className='flex gap-2 overflow-x-auto pb-1 max-w-full'>
                      {r2.photos.map((p, idx) => (
                        <img
                          key={idx}
                          src={p}
                          alt='Vistoria 2'
                          className='w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-white/10 shrink-0'
                        />
                      ))}
                    </div>
                  )}
                  {r2?.videos && r2.videos.length > 0 && (
                    <div className='flex gap-2 overflow-x-auto pb-1 max-w-full'>
                      {r2.videos.map((v, idx) => (
                        <div
                          key={idx}
                          className='w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 relative group'
                        >
                          <video
                            src={v}
                            muted
                            preload='metadata'
                            className='w-full h-full object-cover'
                          />
                          <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Film size={12} className='text-white' />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
