import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col md:flex-row bg-[#060d0e]">
      {/* Left Section: Message */}
      <div className="hidden md:flex flex-1 flex-col items-start justify-center p-11 relative z-20 bg-[#0a1618]">
        {/* Background Elements (Static & Subtler) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-[-5%] left-[-5%] w-[70%] h-[70%] rounded-full opacity-5 blur-[120px]"
            style={{ background: 'radial-gradient(circle, #13c8ec, transparent 70%)' }} 
          />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.012] pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
             <div className="w-1 h-1 rounded-full bg-primary" />
             <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">SISTEMA ATUALIZADO</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tighter">
            Esse é meu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">Igloo</span>
          </h1>
          <p className="max-w-[320px] text-slate-500 text-sm font-medium leading-relaxed">
            A plataforma definitiva para gestão de kitnets e imóveis com padrão enterprise e design intuitivo.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-10 left-10">
           <div className="flex items-center gap-6 opacity-30">
              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-tight">2.4k</span>
                <span className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Usuários</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-tight">150+</span>
                <span className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Cidades</span>
              </div>
           </div>
        </div>
      </div>

      {/* Right Section: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 bg-[#060d0e] border-l border-white/[0.03]">
        <div className="w-full max-w-[400px]">
          {/* Universal Brand Header (Smaller) */}
          <div className="text-center mb-6 group">
            <div className="mx-auto h-10 w-10 rounded-xl flex items-center justify-center text-white text-xl font-black mb-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: 'linear-gradient(135deg, #13c8ec 0%, #0891b2 100%)',
                boxShadow: '0 0 25px rgba(19,200,236,0.15)',
                border: '1.5px solid rgba(255,255,255,0.08)'
              }}>
              I
            </div>
            <h2 className="text-lg font-black text-white tracking-tighter uppercase italic mb-0.5">
              Igloo <span className="text-primary">Platform</span>
            </h2>
            <p className="text-slate-600 text-[8px] font-bold tracking-[0.3em] uppercase">{subtitle}</p>
          </div>

          {/* Auth Container */}
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-surface-dark/30 backdrop-blur-2xl">
            <div className="p-6 md:p-7">
              {children}
            </div>
            
            {/* Bottom Security Banner */}
            <div className="px-6 py-2 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary/40">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Protocolo de Segurança Ativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




export default AuthLayout;
