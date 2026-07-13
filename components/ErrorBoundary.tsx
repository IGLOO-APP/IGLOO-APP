import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark font-sans'>
          <div className='max-w-md w-full relative z-10'>
            <div className='bg-white/70 dark:bg-surface-dark/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 text-center'>
              <div className='inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-8'>
                <AlertCircle size={40} />
              </div>

              <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight'>
                Algo deu errado
              </h1>

              <p className='text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed font-medium'>
                Um erro inesperado aconteceu ao carregar esta página. Tente recarregar.
              </p>

              {this.state.error && (
                <details className='mb-6 text-left'>
                  <summary className='cursor-pointer text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'>
                    Detalhes do erro
                  </summary>
                  <pre className='mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 overflow-auto max-h-32'>
                  {this.state.error.message}
                  {this.state.error.stack?.split('\n').slice(0, 6).join('\n')}
                  </pre>
                </details>
              )}

              <button
                onClick={this.handleReload}
                className='w-full h-14 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20'
              >
                <RefreshCw size={18} /> Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
