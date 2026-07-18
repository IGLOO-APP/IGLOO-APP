import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Droplets,
  Zap,
  Home,
  CloudRain,
  Shield,
  Smartphone,
  Sparkles,
  DollarSign,
  Wrench,
  Layers,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  { name: 'Blue',    color: 'text-blue-400',    bg: 'bg-blue-500/20',    dot: 'bg-blue-400' },
  { name: 'Yellow',  color: 'text-yellow-400',  bg: 'bg-yellow-500/20',  dot: 'bg-yellow-400' },
  { name: 'Orange',  color: 'text-orange-400',  bg: 'bg-orange-500/20',  dot: 'bg-orange-400' },
  { name: 'Cyan',    color: 'text-cyan-400',    bg: 'bg-cyan-500/20',    dot: 'bg-cyan-400' },
  { name: 'Red',     color: 'text-red-400',     bg: 'bg-red-500/20',     dot: 'bg-red-400' },
  { name: 'Purple',  color: 'text-purple-400',  bg: 'bg-purple-500/20',  dot: 'bg-purple-400' },
  { name: 'Emerald', color: 'text-emerald-400', bg: 'bg-emerald-500/20', dot: 'bg-emerald-400' },
  { name: 'Amber',   color: 'text-amber-400',   bg: 'bg-amber-500/20',   dot: 'bg-amber-400' },
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  show,
  onClose,
  categories,
  onSave,
  onDelete,
}) => {
  const [newCat, setNewCat] = useState({ name: '', icon_name: 'Wrench' });
  const [isAdding, setIsAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  if (!show) return null;

  const handleSave = () => {
    onSave({
      name: newCat.name,
      icon_name: newCat.icon_name,
      color_class: selectedColor.color,
      bg_class: selectedColor.bg,
    });
    setNewCat({ name: '', icon_name: 'Wrench' });
    setIsAdding(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='max-h-[92vh] overflow-y-auto p-0 gap-0 w-full sm:max-w-xl bg-card border border-border shadow-2xl rounded-2xl'
        showCloseButton={true}
      >
        {/* ── Header ── */}
        <DialogHeader className='px-7 pt-7 pb-5 border-b border-border'>
          <div className='flex items-center gap-4'>
            <div
              className='w-11 h-11 rounded-2xl flex items-center justify-center shrink-0'
              style={{ background: 'linear-gradient(135deg,#2f6bff 0%,#3fa9ff 100%)' }}
            >
              <Layers size={20} className='text-white' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground leading-tight'>
                Gerenciar Categorias
              </DialogTitle>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Organize as solicitações dos seus locatários
              </p>
            </div>
          </div>
          <DialogDescription />
        </DialogHeader>

        <div className='px-7 py-6 space-y-5'>
          {/* ── Add Form / Add Button ── */}
          {isAdding ? (
            <div className='rounded-2xl border border-border bg-muted/30 p-5 space-y-5'>
              {/* Name */}
              <div className='space-y-2'>
                <label className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                  Nome da Categoria
                </label>
                <input
                  type='text'
                  autoFocus
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder='Ex: Pintura, Jardinagem, Elétrica…'
                  className='w-full h-12 rounded-xl px-4 text-sm font-medium bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-[#13c8ec] focus:ring-2 focus:ring-[#13c8ec]/20 outline-none transition-all'
                />
              </div>

              {/* Color */}
              <div className='space-y-2'>
                <label className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                  Cor Temática
                </label>
                <div className='flex gap-3 flex-wrap'>
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setSelectedColor(opt)}
                      title={opt.name}
                      className={`w-7 h-7 rounded-full transition-all duration-200 ${opt.dot} ${
                        selectedColor.name === opt.name
                          ? 'ring-2 ring-offset-2 ring-offset-card ring-[#13c8ec] scale-110'
                          : 'opacity-50 hover:opacity-90 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div className='space-y-2'>
                <label className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                  Ícone
                </label>
                <div className='grid grid-cols-5 sm:grid-cols-9 gap-2'>
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = newCat.icon_name === opt.name;
                    return (
                      <button
                        key={opt.name}
                        onClick={() => setNewCat({ ...newCat, icon_name: opt.name })}
                        className={`h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          active
                            ? 'text-white scale-105'
                            : 'text-muted-foreground hover:text-foreground bg-background border border-border'
                        }`}
                        style={
                          active
                            ? { background: 'linear-gradient(135deg,#2f6bff 0%,#3fa9ff 100%)' }
                            : {}
                        }
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-1'>
                <Button
                  onClick={handleSave}
                  disabled={!newCat.name.trim()}
                  variant='glass'
                  className='flex-1 h-11 text-sm'
                >
                  Salvar Categoria
                </Button>
                <button
                  onClick={() => setIsAdding(false)}
                  className='px-6 h-11 rounded-full bg-muted text-muted-foreground text-sm font-semibold hover:bg-muted/80 transition-all'
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className='w-full py-5 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-[#13c8ec]/50 hover:text-[#13c8ec] transition-all group flex items-center justify-center gap-3 bg-muted/20'
            >
              <div className='w-9 h-9 rounded-full bg-muted flex items-center justify-center group-hover:bg-[#13c8ec]/10 transition-all'>
                <Plus size={18} className='group-hover:scale-110 transition-transform' />
              </div>
              <span className='text-sm font-semibold'>Adicionar Nova Categoria</span>
            </button>
          )}

          {/* ── Categories list ── */}
          {categories.length > 0 && (
            <div className='space-y-3'>
              <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1'>
                Categorias ativas · {categories.length}
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {categories.map((cat) => {
                  const Icon = iconOptions.find((i) => i.name === cat.icon_name)?.icon || Wrench;
                  return (
                    <div
                      key={cat.id}
                      className='rounded-2xl border border-border bg-muted/30 px-4 py-3 flex items-center justify-between group hover:border-border/80 transition-all'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg_class} ${cat.color_class}`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className='text-sm font-semibold text-foreground'>{cat.name}</p>
                          <p className='text-[11px] text-muted-foreground'>{cat.icon_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDelete(cat.id)}
                        className='p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all'
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
