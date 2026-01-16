import React from 'react';
import { MapPin, ChevronDown, ArrowRight } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';

interface AddPropertyFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onClose, onSave }) => {
  return (
    <ModalWrapper onClose={onClose} className="md:max-w-lg" title="Adicionar Imóvel" showCloseButton={true}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background-light dark:bg-background-dark">
            <div className="flex flex-col gap-2">
                <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold">Apelido do Imóvel <span className="text-primary">*</span></label>
                <input className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark h-14 px-4 text-base dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Kitnet Centro" type="text"/>
            </div>
            
            <div className="flex flex-col gap-2">
                <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold">Endereço Completo <span className="text-primary">*</span></label>
                <div className="relative flex items-center">
                    <input className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark h-14 pl-4 pr-12 text-base dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Rua, número, bairro..." type="text"/>
                    <MapPin className="absolute right-4 text-primary pointer-events-none" size={24} />
                </div>
                <div className="mt-1 h-24 w-full rounded-lg overflow-hidden relative">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRbhsUgAbdtQQaBJLPxpd07f4ZN42w4pcmh_4lpFATUfNKYtJN208bpChAOfHyF_BUrfM8I7G0AmGkjPMaQ7idkEsscyEzmRKS21b1pRLmACvtwkDbSpSkloWFznz3CpiGqWmTRZ0pBZfiD9aA95N8wavRBdIYsQtlZUgJ3rnxH7LATyGPFz3uupGKkds-IRUOTDa2iKaDskKga_iysBi89zQapI8XUh1wD2AuDndA7nlwX3EllpYV7JntOZDeuPe72lyg6505Fy51" alt="Map" className="w-full h-full object-cover opacity-60 grayscale" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="text-xs font-bold text-slate-800 bg-white/90 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">Toque para ajustar no mapa</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold">Tipo de Imóvel <span className="text-primary">*</span></label>
                <div className="relative">
                    <select className="w-full appearance-none rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark h-14 pl-4 pr-10 text-base dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option value="" disabled selected>Selecione o tipo</option>
                    <option value="kitnet">Kitnet</option>
                    <option value="studio">Studio</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={24} />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-[1.5]">
                    <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold">Valor Base</label>
                    <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                    <input className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark h-14 pl-11 pr-4 text-base font-medium dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="0,00" type="text"/>
                    </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold">Área</label>
                    <div className="relative">
                    <input className="w-full rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-surface-dark h-14 pl-4 pr-10 text-base dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" placeholder="0" type="number"/>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">m²</span>
                    </div>
                    <p className="text-xs text-red-500 font-medium mt-0.5">Obrigatório</p>
                </div>
            </div>
            <div className="h-4"></div>
        </div>

        <div className="flex-none p-6 pt-2 bg-background-light dark:bg-background-dark border-t border-transparent z-20">
            <button className="group w-full h-14 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200">
                Salvar Imóvel
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
        </div>
    </ModalWrapper>
  );
};