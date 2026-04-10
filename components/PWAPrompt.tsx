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
    <div className='fixed bottom-6 left-6 z-[9999] animate-slideUp'>
      <div className="relative group">
        {(needRefresh || (!!deferredPrompt && !offlineReady)) && (

          <button
            onClick={needRefresh ? () => updateServiceWorker(true) : handleInstall}
            className="flex items-center gap-3 h-12 px-4 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 border border-white/10 dark:border-black/5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:pr-6 group-hover:shadow-primary/20"
          >
            <div className="relative">
              {needRefresh ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              {needRefresh && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            
            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[200px] transition-all duration-500">
              {needRefresh ? 'Atualizar Igloo' : 'Instalar no Dispositivo'}
            </span>
          </button>
        )}

        {offlineReady && !needRefresh && !deferredPrompt && (
          <div className="flex items-center gap-2 h-10 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest backdrop-blur-md animate-fadeOut">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Pronto Offline
          </div>
        )}

        {/* Close Button (Optional, maybe not needed for a discrete FAB) */}
        {(needRefresh || deferredPrompt) && (
          <button
            onClick={close}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
          >
            <X size={10} strokeWidth={4} />
          </button>
        )}
      </div>
    </div>
  );
};


export default PWAPrompt;
