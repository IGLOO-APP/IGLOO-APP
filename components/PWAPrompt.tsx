import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';

const PWAPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA Install prompt saved');
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setDeferredPrompt(null);
  };

  if (!offlineReady && !needRefresh && !deferredPrompt) return null;

  return (
    <div className='fixed bottom-8 right-8 z-[9999] animate-slideUp'>
      <div className="relative group">
        {(needRefresh || (!!deferredPrompt && !offlineReady)) && (
          <button
            onClick={needRefresh ? () => updateServiceWorker(true) : handleInstall}
            className="flex items-center gap-0 group-hover:gap-3 h-14 w-14 group-hover:w-auto px-4 rounded-2xl bg-slate-900/40 dark:bg-white/10 text-slate-900 dark:text-white border border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-105 active:scale-95 group-hover:px-6"
            title={needRefresh ? 'Atualizar App' : 'Instalar Igloo'}
          >
            <div className="relative shrink-0 flex items-center justify-center w-6 h-6">
              {needRefresh ? (
                <RefreshCw size={22} className="animate-spin text-primary" />
              ) : (
                <Download size={22} className="text-primary group-hover:animate-bounce" />
              )}
              {needRefresh && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            
            <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[200px] transition-all duration-500 opacity-0 group-hover:opacity-100">
              {needRefresh ? 'Atualizar Igloo' : 'Instalar App'}
            </span>
          </button>
        )}

        {offlineReady && !needRefresh && !deferredPrompt && (
          <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest backdrop-blur-md animate-fadeOut">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Igloo Offline
          </div>
        )}

        {/* Close Button */}
        {(needRefresh || deferredPrompt) && (
          <button
            onClick={close}
            className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800/80 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-red-500"
          >
            <X size={12} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
};


export default PWAPrompt;
