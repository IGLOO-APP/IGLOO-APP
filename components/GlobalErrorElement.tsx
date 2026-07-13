import React from 'react';
import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home, ChevronLeft } from 'lucide-react';

const GlobalErrorElement: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'Não conseguimos carregar as informações desta página agora.';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark font-sans'>
      <div className='max-w-md w-full relative z-10'>
        <div className='bg-white/70 dark:bg-surface-dark/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 text-center'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-8'>
            <AlertCircle size={40} />
          </div>

          <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight'>
            Ocorreu um imprevisto
          </h1>

          <p className='text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium'>
            {typeof errorMessage === 'string' || typeof errorMessage === 'number'
              ? errorMessage
              : 'Ocorreu um erro inesperado no processamento dos dados.'}
            <br />
            <span className='text-[10px] opacity-50 uppercase mt-2 block tracking-widest'>
              Código do erro: {errorStatus}
            </span>
          </p>

          {error instanceof Error && (
            <details className='mb-6 text-left'>
              <summary className='cursor-pointer text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'>
                Detalhes do erro
              </summary>
              <pre className='mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 overflow-auto max-h-32'>
                {error.message}
                {error.stack?.split('\n').slice(0, 6).join('\n')}
              </pre>
            </details>
          )}

          <div className='space-y-3'>
            <button
              onClick={() => window.location.reload()}
              className='w-full h-14 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20'
            >
              <RefreshCw size={18} /> Tentar novamente
            </button>

            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={() => navigate(-1)}
                className='h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all'
              >
                <ChevronLeft size={18} /> Voltar
              </button>
              <button
                onClick={() => navigate('/')}
                className='h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all'
              >
                <Home size={18} /> Início
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorElement;
