import React, { useState } from 'react';
import { X, Plus, Trash2, Droplets, Zap, Home, CloudRain, Shield, Smartphone, Sparkles, DollarSign, Wrench, Search } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon_name: string;
  color_class: string;
  bg_class: string;
}

interface CategoryManagerProps {
  show: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (cat: Partial<Category>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  show,
  onClose,
  categories,
  onSave,
  onDelete,
}) => {
  const [newCat, setNewCat] = useState({ name: '', icon_name: 'Wrench' });
  const [isAdding, setIsAdding] = useState(false);

  const iconOptions = [
    { name: 'Droplets', icon: Droplets },
    { name: 'Zap', icon: Zap },
    { name: 'Home', icon: Home },
    { name: 'CloudRain', icon: CloudRain },
    { name: 'Shield', icon: Shield },
    { name: 'Smartphone', icon: Smartphone },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'DollarSign', icon: DollarSign },
    { name: 'Wrench', icon: Wrench },
  ];

  const colorOptions = [
    { name: 'Blue', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { name: 'Yellow', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
    { name: 'Orange', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { name: 'Cyan', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
    { name: 'Red', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { name: 'Purple', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { name: 'Emerald', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { name: 'Amber', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-md' onClick={onClose} />
      
      <div className='relative w-full max-w-2xl bg-white dark:bg-[#0A0B0D] rounded-[40px] shadow-2xl border border-white/5 overflow-hidden flex flex-col max-h-[90vh] animate-fadeInUp'>
        {/* Header */}
        <div className='p-8 border-b border-white/5 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase'>Gerenciar Categorias</h2>
            <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mt-1'>Personalize os tipos de chamados de manutenção</p>
          </div>
          <button onClick={onClose} className='p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-white transition-all'>
            <X size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8'>
          {/* Add Form */}
          {isAdding ? (
            <div className='p-6 rounded-[32px] bg-primary/5 border border-primary/20 space-y-6 animate-fadeIn'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest px-1'>Nome da Categoria</label>
                  <input 
                    type='text'
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    placeholder='Ex: Pintura, Jardinagem...'
                    className='w-full h-12 bg-white dark:bg-black/40 border-none rounded-xl px-4 text-sm font-bold text-white focus:ring-2 focus:ring-primary/30 transition-all'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest px-1'>Cor Temática</label>
                  <div className='flex flex-wrap gap-2'>
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.name}
                        onClick={() => setSelectedColor(opt)}
                        className={`w-8 h-8 rounded-full ${opt.bg} border-2 ${selectedColor.name === opt.name ? 'border-primary' : 'border-transparent'} transition-all`}
                        title={opt.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest px-1'>Selecione um Ícone</label>
                <div className='grid grid-cols-5 sm:grid-cols-9 gap-3'>
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setNewCat({ ...newCat, icon_name: opt.name })}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all ${newCat.icon_name === opt.name ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                    >
                      <opt.icon size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex gap-3 pt-2'>
                <button 
                  onClick={() => {
                    onSave({
                      name: newCat.name,
                      icon_name: newCat.icon_name,
                      color_class: selectedColor.color,
                      bg_class: selectedColor.bg
                    });
                    setNewCat({ name: '', icon_name: 'Wrench' });
                    setIsAdding(false);
                  }}
                  disabled={!newCat.name}
                  className='flex-1 h-12 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50'
                >
                  Salvar Categoria
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className='px-6 h-12 bg-white/5 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all'
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className='w-full p-6 rounded-[32px] border-2 border-dashed border-white/10 text-slate-500 hover:border-primary/50 hover:text-primary transition-all flex flex-col items-center justify-center gap-2 group'
            >
              <Plus size={24} className='group-hover:scale-110 transition-transform' />
              <span className='text-xs font-black uppercase tracking-widest'>Adicionar Nova Categoria</span>
            </button>
          )}

          {/* List */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {categories.map((cat) => {
              const Icon = iconOptions.find(i => i.name === cat.icon_name)?.icon || Wrench;
              return (
                <div key={cat.id} className='p-5 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all'>
                  <div className='flex items-center gap-4'>
                    <div className={`p-3 rounded-2xl ${cat.bg_class} ${cat.color_class}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className='text-sm font-black text-white uppercase tracking-tight'>{cat.name}</h4>
                      <p className='text-[8px] font-bold text-slate-500 uppercase tracking-widest'>{cat.icon_name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(cat.id)}
                    className='p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
