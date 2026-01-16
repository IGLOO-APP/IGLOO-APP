import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, onEdit, onDelete }) => {
  return (
    <article 
        onClick={() => onClick(property)}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 transition-all hover:shadow-md cursor-pointer active:scale-[0.99]"
    >
        <div className="flex items-stretch p-3 gap-3">
            <div className="h-24 w-24 shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${property.image})` }}></div>
            <div className="flex flex-1 flex-col justify-between py-1">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset uppercase tracking-wide ${property.status_color || 'bg-gray-100 text-gray-600'}`}>
                        {property.status}
                        </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">{property.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{property.address}</p>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit?.(property.id); }}
                        aria-label="Editar" 
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(property.id); }}
                        aria-label="Excluir" 
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    </article>
  );
};