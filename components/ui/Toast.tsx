
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'system';
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="text-emerald-500" size={20} />,
  error: <AlertCircle className="text-red-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
  warning: <AlertCircle className="text-amber-500" size={20} />,
  system: <Bell className="text-primary" size={20} />,
};

const bgColors = {
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30',
  system: 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800',
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-md mb-3 transition-all animate-slideUp w-full max-w-sm pointer-events-auto ${bgColors[toast.type]}`}>
      <div className="shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{toast.title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end pointer-events-none gap-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};
