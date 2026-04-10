import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';

type Step = 'initial' | 'code';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const SignUpPage: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('initial');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const signUpWithGoogle = async () => {
    if (!isLoaded) return;
    setGoogleLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      setError('Erro ao criar conta com Google.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification();
      setStep('code');
    } catch (err: any) {
      console.error('Sign up error:', err);
      const clerkError = err.errors?.[0];
      const message = clerkError?.longMessage || clerkError?.message || err.message || 'Ocorreu um erro no cadastro.';
      setError(String(message));
    } finally {

      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      const clerkError = err.errors?.[0];
      const message = clerkError?.longMessage || clerkError?.message || err.message || 'Código inválido.';
      setError(String(message));
    } finally {

      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Cadastro" subtitle="Crie sua conta na Igloo">
      <div className="animate-auth-entry">
        {/* Step Header */}
        <div className="mb-8">
          {step === 'initial' ? (
            <>
              <h2 className="text-xl font-black text-white mb-2">Cadastrar</h2>
              <p className="text-slate-400 text-sm font-medium">Junte-se à nova era da gestão imobiliária</p>
            </>
          ) : (
            <>
              <button 
                onClick={() => setStep('initial')}
                className="flex items-center gap-2 text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Editar Dados
              </button>
              <h2 className="text-xl font-black text-white mb-2">Verificar E-mail</h2>
              <p className="text-slate-400 text-sm font-medium">Insira o código enviado para <span className="text-white">{typeof emailAddress === 'string' ? emailAddress : ''}</span></p>
            </>
          )}

        </div>

        {/* Google — only on initial step */}
        {step === 'initial' && (
          <>
            <button onClick={signUpWithGoogle} disabled={googleLoading || !isLoaded}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-lg font-black text-[11px] text-white uppercase tracking-widest transition-all duration-300 auth-button-shimmer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
              {googleLoading ? <Spinner /> : <GoogleIcon />}
              <span>Cadastrar com Google</span>
            </button>
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">Ou formulário</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
          </>

        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-scaleUp"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            <div className="p-1.5 bg-red-500/20 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            {typeof error === 'string' ? error : 'Ocorreu um erro.'}
          </div>

        )}

        {/* Step Forms */}
        <div className="space-y-6">
          {step === 'initial' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nome</label>
                  <input
                    type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Nome" required
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.02] border border-white/5 text-white text-[13px] font-bold outline-none auth-input-focus placeholder-slate-800"
                  />
                </div>
                <div className="group">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Sobrenome</label>
                  <input
                    type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Sobrenome" required
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.02] border border-white/5 text-white text-[13px] font-bold outline-none auth-input-focus placeholder-slate-800"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">E-mail</label>

                <input
                  type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)}
                  placeholder="seu@contato.com" required
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.02] border border-white/5 text-white text-[13px] font-bold outline-none auth-input-focus placeholder-slate-800"
                />
              </div>

              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Senha (mín. 8 caracteres)</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={8}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.02] border border-white/5 text-white text-[13px] font-bold outline-none auth-input-focus placeholder-slate-800"
                />
              </div>



              <button type="submit" disabled={loading || !isLoaded}
                className="w-full h-10 rounded-lg font-black text-[11px] text-white uppercase tracking-widest transition-all duration-300 auth-button-shimmer shadow-lg shadow-primary/5 mt-2"
                style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)' }}>
                {loading ? <Spinner /> : 'Criar Conta'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="group text-center">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Código de 6 dígitos</label>
                <input
                  type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" required autoFocus maxLength={6}
                  className="w-full h-12 px-4 rounded-lg bg-white/[0.02] border border-white/5 text-white text-2xl font-black text-center outline-none tracking-[0.4em] auth-input-focus placeholder-slate-900"
                />
              </div>
              <button type="submit" disabled={loading || !isLoaded || code.length < 6}
                className="w-full h-10 rounded-lg font-black text-[11px] text-white uppercase tracking-widest transition-all duration-300 auth-button-shimmer shadow-lg shadow-primary/5"
                style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)' }}>
                {loading ? <Spinner /> : 'Finalizar Cadastro'}
              </button>


            </form>
          )}
        </div>

        {/* Footer Link */}
        {step === 'initial' && (
          <div className="mt-7 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:text-white transition-colors border-b border-primary/20 hover:border-white">
                Fazer Login →
              </Link>
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;
