import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';

const PWAPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className='fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-8 md:bottom-8 md:w-96 animate-slideUp'>
      <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl dark:shadow-none p-6 relative overflow-hidden backdrop-blur-xl'>
        {/* Progress bar background for "new version" */}
        {needRefresh && (
          <div className='absolute top-0 left-0 h-1 bg-primary w-full shadow-sm' />
        )}

        <button
          onClick={close}
          className='absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors'
        >
          <X size={18} />
        </button>

        <div className='flex gap-5 items-start'>
          <div className='w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner'>
            {needRefresh ? <RefreshCw size={28} className='animate-spin' /> : <Download size={28} />}
          </div>
          
          <div className='flex-1 pr-6'>
            <h3 className='font-bold text-slate-900 dark:text-white text-base mb-1 tracking-tight'>
              {needRefresh ? 'Nova Versão Disponível' : 'Pronto para Uso Offline'}
            </h3>
            <p className='text-sm text-slate-500 dark:text-slate-400 leading-snug font-medium'>
              {needRefresh 
                ? 'Atualizamos o sistema com melhorias de velocidade e correções importantes.' 
                : 'O Igloo agora está carregado e pronto para você acessar sem internet.'}
            </p>
            
            {needRefresh && (
              <button
                onClick={() => updateServiceWorker(true)}
                className='mt-5 w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10'
              >
                Atualizar agora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAPrompt;
