import React, { useState } from 'react';
import { Download, Calculator, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { taxService } from '../../../services/finance/taxService';
import { CarneLeaoReport } from '../../../types/tax';

interface TaxExportModalProps {
  ownerId: string;
  onClose: () => void;
}

export const TaxExportModal: React.FC<TaxExportModalProps> = ({ ownerId, onClose }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [dependents, setDependents] = useState(0);
  const [report, setReport] = useState<CarneLeaoReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownerCpf, setOwnerCpf] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await taxService.generateCarneLeaoReport(ownerId, year, dependents);
      setReport(result);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDimob = () => {
    if (!report) return;
    const csv = taxService.generateDimobCsv(report, ownerCpf, ownerName);
    taxService.downloadCsv(csv, `DIMOB_CarneLeao_${year}.csv`);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 border border-white/10 rounded-[22px]' style={{ background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none' style={{ borderRadius: 'inherit' }}>
          <div className='absolute w-[50vw] h-[50vw] top-[-20%] left-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-1), transparent 70%)', filter: 'blur(90px)' }} />
          <div className='absolute w-[42vw] h-[42vw] bottom-[-20%] right-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-2), transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className='relative z-10'>
        <DialogHeader className='px-6 py-4 border-b border-white/10 flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Exportar DIMOB / Carnê-Leão</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='space-y-5 p-6'>
          <div className='flex items-start gap-3 p-4 bg-blue-950/20 rounded-2xl border border-blue-900/50'>
            <Info size={18} strokeWidth={1.8} className='text-blue-400 shrink-0 mt-0.5' />
            <div>
              <p className='text-[10px] font-black text-blue-300 uppercase tracking-widest'>
                Dados para Imposto de Renda
              </p>
              <p className='text-[9px] text-blue-400/70 mt-1 leading-relaxed'>
                Gere um relatório completo de Carnê-Leão com os recebimentos de aluguel do ano
                selecionado. Os dados são extraídos automaticamente dos pagamentos registrados no
                sistema.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-3'>
            <div>
              <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                Ano
              </label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setReport(null);
                }}
                className='w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((y) => (
                  <option key={y} value={y} className='bg-[#0c0e1a]'>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                Dependentes
              </label>
              <input
                type='number'
                min={0}
                max={10}
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className='w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary/30'
              />
            </div>
            <div className='flex items-end'>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className='w-full px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest'
              >
                <Calculator size={14} strokeWidth={1.8} />
                {loading ? 'Calculando...' : 'Calcular'}
              </button>
            </div>
          </div>

          {report && (
            <>
              <div className='grid grid-cols-2 gap-3'>
                <div className='p-4 bg-white/5 rounded-2xl border border-white/10'>
                  <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                    Total Bruto
                  </p>
                  <p className='text-xl font-black text-white mt-1'>
                    {formatCurrency(report.totalBruto)}
                  </p>
                </div>
                <div className='p-4 bg-white/5 rounded-2xl border border-white/10'>
                  <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                    Deduções
                  </p>
                  <p className='text-xl font-black text-white mt-1'>
                    {formatCurrency(report.totalDeducoes)}
                  </p>
                </div>
                <div className='p-4 bg-primary/10 rounded-2xl border border-primary/20'>
                  <p className='text-[9px] font-black text-primary uppercase tracking-widest'>
                    Base de Cálculo
                  </p>
                  <p className='text-xl font-black text-white mt-1'>
                    {formatCurrency(report.totalTributavel)}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-2xl border ${report.impostoDevido > 0 ? 'bg-red-950/20 border-red-900/50' : 'bg-emerald-950/20 border-emerald-900/50'}`}
                >
                  <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                    Imposto Devido
                  </p>
                  <p
                    className={`text-xl font-black mt-1 ${report.impostoDevido > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                  >
                    {formatCurrency(report.impostoDevido)}
                  </p>
                </div>
              </div>

              <div className='p-3 bg-white/5 rounded-xl border border-white/10'>
                <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest text-center'>
                  Alíquota Efetiva: {report.aliquota.toFixed(1)}% &middot; Faixa: {report.faixa}
                </p>
              </div>

              {/* Monthly Breakdown */}
              <div>
                <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                  Detalhamento Mensal
                </p>
                <div className='space-y-1 max-h-48 overflow-y-auto'>
                  {report.monthlyBreakdown.map((m) => (
                    <div
                      key={m.monthNumber}
                      className='flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/10'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-xs font-black text-slate-500 w-20'>
                          {m.month.slice(0, 3)}
                        </span>
                        <span className='text-[10px] font-medium text-slate-400'>
                          {formatCurrency(m.valorBruto)}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black ${m.imposto > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                      >
                        {m.imposto > 0 ? formatCurrency(m.imposto) : 'Isento'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export */}
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                      Seu CPF
                    </label>
                    <input
                      type='text'
                      value={ownerCpf}
                      onChange={(e) => setOwnerCpf(e.target.value)}
                      placeholder='000.000.000-00'
                      className='w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30'
                    />
                  </div>
                  <div>
                    <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                      Nome Completo
                    </label>
                    <input
                      type='text'
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder='Seu nome'
                      className='w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30'
                    />
                  </div>
                </div>
                <button
                  onClick={handleExportDimob}
                  disabled={!ownerCpf || !ownerName}
                  className='w-full py-3 rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 transition-all disabled:opacity-30 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest'
                >
                  <Download size={16} strokeWidth={1.8} /> Exportar CSV (DIMOB / Carnê-Leão)
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
