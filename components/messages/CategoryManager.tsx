import React, { useState } from 'react';
import {
  X,
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
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  { name: 'Blue', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { name: 'Yellow', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  { name: 'Orange', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  { name: 'Cyan', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  { name: 'Red', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  { name: 'Purple', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { name: 'Emerald', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { name: 'Amber', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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
        className='max-h-[90vh] overflow-y-auto p-0 gap-0 max-w-xl'
        showCloseButton={true}
      >
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-lg font-semibold'>Gerenciar Categorias</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='bg-background text-foreground'>
          <div className='px-6 py-3 border-b border-border flex items-center gap-3 lg-card rounded-none border-x-0 border-t-0'>
            <div className='w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground shrink-0'>
              <Info size={16} />
            </div>
            <div className='flex-1'>
              <p className='text-xs font-medium text-muted-foreground'>
                Para que servem as Categorias?
              </p>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                As categorias ajudam a organizar as solicitações dos locatários. Ao classificar um
                chamado, você consegue filtrar demandas e gerar relatórios precisos.
              </p>
            </div>
          </div>

          <div className='p-6 space-y-6'>
            {isAdding ? (
              <div className='p-6 rounded-2xl lg-card space-y-5 border border-primary/20'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Nome da Categoria
                    </label>
                    <input
                      type='text'
                      value={newCat.name}
                      onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                      placeholder='Ex: Pintura, Jardinagem...'
                      className='w-full h-11 rounded-xl px-4 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all lg-card'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Cor Temática
                    </label>
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

                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-muted-foreground'>
                    Selecione um Ícone
                  </label>
                  <div className='grid grid-cols-5 sm:grid-cols-9 gap-3'>
                    {iconOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => setNewCat({ ...newCat, icon_name: opt.name })}
                          className={`p-3 rounded-xl flex items-center justify-center transition-all ${newCat.icon_name === opt.name ? 'bg-primary text-primary-foreground scale-110 shadow-md' : 'text-muted-foreground hover:text-foreground lg-card'}`}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={handleSave}
                    disabled={!newCat.name}
                    className='flex-1 h-11 bg-primary text-primary-foreground rounded-xl font-semibold text-xs transition-all active:scale-95 disabled:opacity-50'
                  >
                    Salvar Categoria
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className='px-6 h-11 bg-muted text-muted-foreground rounded-xl text-xs font-medium hover:bg-accent transition-all'
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className='w-full p-6 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex flex-col items-center justify-center gap-2 group lg-card'
              >
                <Plus size={24} className='group-hover:scale-110 transition-transform' />
                <span className='text-xs font-medium'>
                  Adicionar Nova Categoria
                </span>
              </button>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {categories.map((cat) => {
                const Icon = iconOptions.find((i) => i.name === cat.icon_name)?.icon || Wrench;
                return (
                  <div
                    key={cat.id}
                    className='p-4 rounded-2xl lg-card flex items-center justify-between group transition-all'
                  >
                    <div className='flex items-center gap-3'>
                      <div className={`p-2.5 rounded-xl ${cat.bg_class} ${cat.color_class}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className='text-sm font-medium text-foreground'>
                          {cat.name}
                        </h4>
                        <p className='text-xs text-muted-foreground'>
                          {cat.icon_name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(cat.id)}
                      className='p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
