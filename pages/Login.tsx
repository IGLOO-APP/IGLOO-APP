import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
  return (
    <div className='min-h-screen relative overflow-hidden bg-background-dark flex items-center justify-center p-6'>
      {/* Background Mesh Gradient */}
      <div className='absolute inset-0 z-0'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse'></div>
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-dark/20 blur-[120px] animate-pulse' style={{ animationDelay: '1s' }}></div>
      </div>

      <div className='w-full max-w-md relative z-10 animate-fadeIn'>
        <div className='text-center mb-10'>
          <div className='mx-auto h-20 w-20 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center text-white text-4xl font-extrabold shadow-[0_0_40px_rgba(19,200,236,0.3)] mb-6 ring-4 ring-white/5 animate-scaleUp'>
            I
          </div>
          <h2 className='text-3xl font-black text-white tracking-tight mb-2 uppercase italic'>
            Igloo <span className="text-primary">Platform</span>
          </h2>
          <p className='text-slate-400 font-medium tracking-wide'>Portal de Gestão Premium</p>
        </div>
        
        <SignIn 
          routing="path" 
          path="/login" 
          signUpUrl="/signup"
          appearance={{
            variables: {
              colorPrimary: '#13c8ec',
              colorTextOnPrimaryBackground: '#ffffff',
              colorBackground: '#141b1d',
              colorText: '#ffffff',
              colorTextSecondary: '#94a3b8',
              colorInputBackground: '#1c2528',
              colorInputText: '#ffffff',
              colorBorder: 'rgba(255,255,255,0.05)',
              borderRadius: '1rem',
              fontFamily: 'Manrope, sans-serif',
            },
            elements: {
              card: 'bg-surface-dark border border-white/5 shadow-2xl rounded-3xl backdrop-blur-xl mx-auto ring-1 ring-white/10',
              headerTitle: 'text-2xl font-black text-white tracking-tight',
              headerSubtitle: 'text-slate-400 font-medium',
              socialButtonsBlockButton: 'dark:bg-white/5 dark:text-white border-white/5 hover:bg-white/10 transition-all duration-300 ring-1 ring-white/5',
              socialButtonsBlockButtonText: 'font-bold uppercase tracking-wider text-[11px]',
              dividerLine: 'bg-white/5',
              dividerText: 'text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]',
              formFieldLabel: 'text-slate-400 font-black uppercase text-[10px] tracking-widest ml-1 mb-2',
              formFieldInput: 'bg-surface-dark-hover border-white/5 text-white h-12 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all rounded-xl font-medium',
              formButtonPrimary: 'bg-gradient-to-r from-primary to-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_20px_rgba(19,200,236,0.25)] h-12 font-black uppercase tracking-widest text-sm rounded-xl',
              footerActionText: 'text-slate-400 font-medium',
              footerActionLink: 'text-primary hover:text-primary-dark font-black tracking-wide transition-colors',
              identityPreviewText: 'text-white font-bold',
              identityPreviewEditButtonIcon: 'text-primary',
              otpCodeFieldInput: 'bg-surface-dark-hover border-white/10 text-primary font-bold text-xl',
              // Ocultar branding do Clerk
              badge: 'hidden',
              footer: '!bg-transparent border-0 pt-0',
              footerPages: 'hidden',
            }
          }}
        />
        
        <p className='text-center mt-8 text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]'>
          Padrão de Segurança Enterprise
        </p>
      </div>
    </div>
  );
};

export default Login;
