import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Building2,
  Calendar,
  FileText,
  MessageCircle,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  User,
  Hash,
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Tenant } from '../../types';

interface BillingModalProps {
  tenant: Tenant;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({ tenant, onClose, onConfirm }) => {
  // Mock current date info
  const today = new Date();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const currentMonthName = monthNames[today.getMonth()];
  const currentYear = today.getFullYear();

  // Calculation Logic
  const rentValue = parseFloat(tenant.rent?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
  
  // Check for delay
  const dueDay = tenant.due || 10;
  const dueDate = new Date(currentYear, today.getMonth(), dueDay);
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isLate = diffDays > 0;

  // Contract Defaults or Pattern
  const penaltyRate = 0.02; // 2%
  const dailyInterestRate = 0.00033; // 0.033% per day
  
  const [editableRent, setEditableRent] = useState(rentValue);
  const [penalty, setPenalty] = useState(isLate ? rentValue * penaltyRate : 0);
  const [interest, setInterest] = useState(isLate ? rentValue * dailyInterestRate * diffDays : 0);
  const [message, setMessage] = useState('');
  const [sendChannel, setSendChannel] = useState<'whatsapp' | 'copy' | 'pix'>('whatsapp');

  const total = editableRent + penalty + interest;

  // Generate Message automatically
  useEffect(() => {
    const score = tenant.score || 0;
    const isFriendly = !isLate || score > 80;
    const formattedTotal = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedRent = editableRent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedPenalty = penalty.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedInterest = interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let msg = '';
    if (isFriendly && !isLate) {
      msg = `Olá ${tenant.name.split(' ')[0]}, segue a cobrança do aluguel de ${tenant.property} referente a ${currentMonthName}. Valor: ${formattedTotal}. Vencimento: dia ${dueDay}. Qualquer dúvida estou à disposição.`;
    } else if (isLate && score > 80) {
      msg = `Olá ${tenant.name.split(' ')[0]}, identificamos que o aluguel de ${tenant.property} referente a ${currentMonthName} está em aberto há ${diffDays} dias. Valor atualizado: ${formattedTotal} (aluguel ${formattedRent} + multa ${formattedPenalty} + juros ${formattedInterest}). Pedimos a regularização o quanto antes.`;
    } else {
      msg = `Prezado(a) ${tenant.name}, informamos que o aluguel do imóvel ${tenant.property} referente a ${currentMonthName} encontra-se em aberto há ${diffDays} dias. O valor total com encargos contratuais é de ${formattedTotal}. Solicitamos a regularização imediata para evitar medidas adicionais.`;
    }
    setMessage(msg);
  }, [tenant, editableRent, penalty, interest, total, isLate, diffDays, currentMonthName, dueDay]);

  const handleConfirm = () => {
    if (sendChannel === 'whatsapp') {
      const encodedMsg = encodeURIComponent(message);
      const phone = tenant.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}?text=${encodedMsg}`, '_blank');
    } else if (sendChannel === 'copy') {
      navigator.clipboard.writeText(message);
    }

    onConfirm({
      tenantId: tenant.id,
      channel: sendChannel,
      amount: total,
      date: new Date().toISOString()
    });
  };

  return (
    <ModalWrapper
      onClose={onClose}
      title="Cobrança Inteligente"
      className="md:max-w-xl"
    >
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: INQUILINO & REFERÊNCIA */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={14} /> Inquilino & Referência
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Nome do Inquilino</label>
                <div className="px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed">
                  {tenant.name}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Imóvel</label>
                <div className="px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed truncate">
                  {tenant.property}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Mês de Referência</label>
                <div className="px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed">
                  {currentMonthName} / {currentYear}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Contrato</label>
                <div className="px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed">
                  CTR-{currentYear}-00{tenant.id}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-white/5" />

          {/* Section 2: VALORES */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <DollarSign size={14} /> Valores
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Aluguel</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      value={editableRent}
                      onChange={(e) => setEditableRent(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Multa (2%)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      value={penalty}
                      onChange={(e) => setPenalty(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Juros (0.033%/dia)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      value={interest}
                      onChange={(e) => setInterest(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Correction Info */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                <AlertCircle size={14} className="text-slate-400" />
                <p className="text-[10px] font-medium text-slate-500">
                  Correção monetária (IGP-M/IPCA) — consultar índice do mês
                </p>
              </div>

              {/* Total Display (Hero style from Nova Receita) */}
              <div className="relative flex flex-col items-center py-6 rounded-2xl border-2 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Total a Cobrar</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">R$</span>
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {isLate 
                    ? `Calculado com base no atraso de ${diffDays} dias.` 
                    : 'Contrato não especifica encargos. Aplicando padrão de mercado: multa 2% / juros 0,033% ao dia'}
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-white/5" />

          {/* Section 3: MENSAGEM */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageCircle size={14} /> Mensagem de Cobrança
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed"
              placeholder="Digite a mensagem..."
            />
          </section>

          <hr className="border-slate-100 dark:border-white/5" />

          {/* Section 4: ENVIO */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ExternalLink size={14} /> Canal de Envio
            </h3>
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setSendChannel('whatsapp')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  sendChannel === 'whatsapp'
                    ? 'bg-white dark:bg-surface-dark text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button
                onClick={() => setSendChannel('copy')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  sendChannel === 'copy'
                    ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Copy size={16} /> Copiar
              </button>
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-slate-300 dark:text-slate-600 cursor-not-allowed group relative"
                title="Ative nas Configurações"
              >
                <DollarSign size={16} /> Pix/Boleto
                {/* Tooltip implementation */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Ative nas Configurações
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex-none p-6 pt-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-white/5 z-20">
          <button
            onClick={handleConfirm}
            className="w-full h-14 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200"
          >
            Confirmar e Enviar
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
