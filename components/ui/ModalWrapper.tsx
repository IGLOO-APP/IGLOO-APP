import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ 
  children, 
  onClose, 
  title, 
  className = "",
  showCloseButton = true
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
      <div 
        className={`w-full h-[95vh] md:h-auto md:max-h-[90vh] bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp relative ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="flex-none pt-4 pb-2 w-full flex justify-center md:hidden bg-inherit" onClick={onClose}>
            <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600"></div>
        </div>

        {/* Header Logic: Flex (Push Content) vs Absolute (Float Over) */}
        {title ? (
            <div className="flex-none px-6 py-4 flex items-center justify-between bg-background-light dark:bg-background-dark z-20">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight pr-4">{title}</h2>
                 {showCloseButton && (
                    <button 
                        onClick={onClose}
                        className="flex-none bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                 )}
            </div>
        ) : (
            showCloseButton && (
                <div className="absolute top-4 right-4 z-20">
                    <button 
                        onClick={onClose}
                        className="bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-colors shadow-sm border border-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>
            )
        )}

        {children}
      </div>
      
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};