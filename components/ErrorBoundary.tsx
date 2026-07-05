import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
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
          <div className='absolute inset-0 pointer-events-none overflow-hidden'>
            <div className='absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse' />
            <div
              className='absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] animate-pulse'
              style={{ animationDelay: '1s' }}
            />
          </div>

          <div className='max-w-md w-full relative z-10'>
            <div className='bg-white/70 dark:bg-surface-dark/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 text-center'>
              <div className='inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-8'>
                <AlertCircle size={40} />
              </div>

              <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight'>
                Algo deu errado
              </h1>

              <p className='text-slate-500 dark:text-slate-400 mb-10 text-sm leading-relaxed font-medium'>
                Um erro inesperado aconteceu ao carregar esta página. Tente recarregar.
              </p>

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
