import React from 'react';
import {
  Camera,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  FileSearch,
  Eye,
  Edit2,
  Download,
  ArrowRightLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { Inspection } from '../../../services/maintenance/inspectionService';

interface InspectionListViewProps {
  inspections: Inspection[];
  isLoading: boolean;
  isTenant?: boolean;
  selectedForComparison: string[];
  propertyName: string;
  onToggleSelect: (id: string) => void;
  onCompare: () => void;
  onViewDetail: (ins: Inspection) => void;
  onCreateNew: () => void;
}

export const InspectionListView: React.FC<InspectionListViewProps> = ({
  inspections,
  isLoading,
  isTenant,
  selectedForComparison,
  propertyName,
  onToggleSelect,
  onCompare,
  onViewDetail,
  onCreateNew,
}) => {
  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-center px-8 py-6 bg-white dark:bg-black/10 border-b border-gray-100 dark:border-white/5 gap-4'>
        <div>
          <div className='flex items-center gap-2 mb-0.5'>
            <h2 className='text-xl font-black text-slate-900 dark:text-white tracking-tight'>
              Vistorias
            </h2>
            <div className='bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-slate-500'>
              Laudos Técnicos
            </div>
          </div>
          <p className='text-xs text-slate-400 font-medium'>{propertyName}</p>
        </div>
        <div className='flex items-center gap-3 w-full md:w-auto justify-end'>
          <button
            onClick={onCompare}
            disabled={selectedForComparison.length !== 2}
            className={`h-12 flex items-center justify-center gap-2 px-6 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
              selectedForComparison.length === 2
                ? 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer shadow-sm'
                : 'border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowRightLeft size={14} /> Comparar Laudos
          </button>
          {!isTenant && (
            <button
              onClick={onCreateNew}
              className='group h-12 flex items-center justify-center gap-2 bg-[#13c8ec] text-[#0a0f1a] px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#13c8ec]/80 transition-all active:scale-95 disabled:opacity-50'
            >
              <Plus size={16} className='group-hover:rotate-90 transition-transform' /> Nova
              Vistoria
            </button>
          )}
        </div>
      </div>

      {/* List Content */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-3'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-20 gap-4'>
            <Loader2 className='text-primary animate-spin' size={32} />
            <p className='text-xs font-black text-slate-400 uppercase tracking-widest'>
              Sincronizando Laudos...
            </p>
          </div>
        ) : inspections.length > 0 ? (
          inspections.map((ins) => {
            const isSelected = selectedForComparison.includes(ins.id);
            return (
              <div
                key={ins.id}
                className='group bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex items-center justify-between gap-3 md:gap-4'
              >
                <div className='flex items-center gap-4'>
                  {/* Checkbox for comparison selection */}
                  <button
                    onClick={() => onToggleSelect(ins.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#13c8ec] border-[#13c8ec] text-[#0a0f1a]'
                        : 'border-slate-300 dark:border-white/20 text-transparent hover:border-[#13c8ec]'
                    }`}
                  >
                    <Check size={12} className='stroke-[3]' />
                  </button>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      ins.type === 'entrada'
                        ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                        : ins.type === 'saída'
                          ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
                    }`}
                  >
                    <Camera size={20} />
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className='font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors capitalize'>
                      Vistoria de {ins.type}
                    </h4>
                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1'>
                      <span className='bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400'>
                        Inspetor: {ins.inspector_name}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Calendar size={12} />{' '}
                        {new Date(ins.inspection_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  {/* Status Badge */}
                  {ins.status === 'concluída' ? (
                    <div className='flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'>
                      <CheckCircle size={10} /> Concluída
                    </div>
                  ) : ins.status === 'pendente_assinatura' ? (
                    <div className='flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 animate-pulse'>
                      <Clock size={10} /> Pendente Assinatura
                    </div>
                  ) : (
                    <div className='flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:border-white/10'>
                      <Clock size={10} /> Rascunho
                    </div>
                  )}

                  {/* Actions */}
                  <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0'>
                    <button
                      onClick={() => onViewDetail(ins)}
                      className='h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm'
                      title='Visualizar Detalhes'
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onViewDetail(ins)}
                      className='h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm'
                      title='Editar'
                    >
                      <Edit2 size={16} />
                    </button>
                    <a
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Laudo em PDF será gerado em instantes.');
                      }}
                      className='h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-[#13c8ec] hover:text-[#0a0f1a] transition-all shadow-sm'
                      title='Baixar PDF'
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className='flex flex-col items-center justify-center min-h-[340px] text-center gap-4 py-8'>
            <div className='w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-white/10'>
              <FileSearch size={36} />
            </div>
            <div>
              <h4 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                Nenhuma Vistoria
              </h4>
              <p className='text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 font-medium leading-relaxed'>
                Este imóvel ainda não possui laudos de vistoria técnicos registrados.
              </p>
            </div>
            {!isTenant && (
              <button
                onClick={onCreateNew}
                className='group h-12 flex items-center justify-center gap-2 bg-[#13c8ec] text-[#0a0f1a] px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#13c8ec]/80 transition-all active:scale-95 mt-2'
              >
                <Plus size={16} className='group-hover:rotate-90 transition-transform' /> Criar
                Primeira Vistoria
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
