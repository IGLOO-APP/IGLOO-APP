import React from 'react';
import { FileText, ExternalLink, X } from 'lucide-react';

interface OnboardingDocumentPreviewProps {
  url: string | null;
  title: string;
  onClose: () => void;
}

export const OnboardingDocumentPreview: React.FC<OnboardingDocumentPreviewProps> = ({
  url,
  title,
  onClose,
}) => {
  if (!url) return null;

  return (
    <div className='fixed inset-0 bg-black/95 flex flex-col z-[100] animate-fadeIn'>
      <div className='flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md'>
        <div className='flex items-center gap-4'>
          <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
            <FileText size={20} />
          </div>
          <div>
            <h3 className='text-white font-black text-sm uppercase tracking-tight'>{title}</h3>
            <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
              Visualizador de Documentos IGLOO
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10'
            title='Abrir Original'
          >
            <ExternalLink size={18} />
          </a>
          <button
            onClick={onClose}
            className='p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20'
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className='flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 bg-black/40'>
        {url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ||
        url.includes('image') ||
        !url.toLowerCase().includes('.pdf') ? (
          <img
            src={url}
            alt={title}
            className='max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn'
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder')) {
                const parent = target.parentElement;
                if (parent) {
                  const iframe = document.createElement('iframe');
                  iframe.src = url.includes('docs.google.com') ? url : `${url}#toolbar=0`;
                  iframe.className =
                    'w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl border-0 animate-slideUp';
                  iframe.title = 'Document Preview';
                  parent.replaceChild(iframe, target);
                }
              } else {
                target.onerror = null;
                target.src = 'https://via.placeholder.com/800x600?text=Erro+ao+carregar+documento';
              }
            }}
          />
        ) : (
          (() => {
            let directPdfUrl = url;
            if (directPdfUrl.includes('docs.google.com/viewer')) {
              const urlParams = new URLSearchParams(new URL(directPdfUrl).search);
              const extractedUrl = urlParams.get('url');
              if (extractedUrl) directPdfUrl = decodeURIComponent(extractedUrl);
            }
            return (
              <iframe
                src={`${directPdfUrl}#toolbar=1`}
                className='w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl border-0 animate-slideUp'
                title={title}
              />
            );
          })()
        )}
      </div>
      <div className='p-4 bg-slate-900/80 border-t border-white/5 text-center'>
        <p className='text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]'>
          Pressione fechar para retornar
        </p>
      </div>
    </div>
  );
};
