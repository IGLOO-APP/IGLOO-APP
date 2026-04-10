import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';

type Step = 'email' | 'password' | 'code';

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

const Login: React.FC = () => {
  const { signIn, isLoaded, setActive } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const signInWithGoogle = async () => {
    if (!isLoaded) return;
    setGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      setError('Erro ao conectar com Google.');
      setGoogleLoading(false);
    }
  };

  const handleEmailStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await signIn.create({ identifier: email });
      const factors = res.supportedFirstFactors || [];
      const hasPassword = factors.find((f: any) => f.strategy === 'password');
      const hasEmailCode = factors.find((f: any) => f.strategy === 'email_code');

      if (hasPassword) {
        setStep('password');
      } else if (hasEmailCode) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: (hasEmailCode as any).emailAddressId,
        });
        setStep('code');
      } else {
        setError('Método de login não suportado para este e-mail.');
      }
    } catch (err: any) {
      console.error('Login email error:', err);
      const clerkError = err.errors?.[0];
      const message = clerkError?.longMessage || clerkError?.message || err.message || 'E-mail não encontrado.';
      setError(String(message));
    } finally {

      setLoading(false);
    }
  };

  const handlePasswordStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'password', password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login password error:', err);
      const clerkError = err.errors?.[0];
      const message = clerkError?.longMessage || clerkError?.message || err.message || 'Senha incorreta.';
      setError(String(message));
    } finally {

      setLoading(false);
    }
  };

  const handleCodeStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login code error:', err);
      const clerkError = err.errors?.[0];
      const message = clerkError?.longMessage || clerkError?.message || err.message || 'Código inválido.';
      setError(String(message));
    } finally {

      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Bem-vindo à Igloo Platform">
      <div className="animate-auth-entry">
        {/* Step Header */}
        <div className="mb-8">
          {step === 'email' && (
            <>
              <h2 className="text-xl font-black text-white mb-2">Entrar</h2>
              <p className="text-slate-400 text-sm font-medium">Use seu e-mail corporativo ou social</p>
            </>
          )}
          {step === 'password' && (
            <>
              <button onClick={() => { setStep('email'); setError(''); }}
                className="flex items-center gap-2 text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Voltar
              </button>
              <h2 className="text-xl font-black text-white mb-2">Sua Senha</h2>
              <p className="text-slate-400 text-sm font-medium truncate">Acessando como <span className="text-white border-b border-primary/30">{typeof email === 'string' ? email : ''}</span></p>
            </>
          )}
          {step === 'code' && (
            <>
              <button onClick={() => { setStep('email'); setError(''); }}
                className="flex items-center gap-2 text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Voltar
              </button>
              <h2 className="text-xl font-black text-white mb-2">Verificação</h2>
              <p className="text-slate-400 text-sm font-medium">Enviamos um código para <span className="text-white">{typeof email === 'string' ? email : ''}</span></p>
            </>
          )}

        </div>

        {/* Google — only on email step */}
        {step === 'email' && (
          <>
            <button onClick={signInWithGoogle} disabled={googleLoading || !isLoaded}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-lg font-black text-[11px] text-white uppercase tracking-widest transition-all duration-300 auth-button-shimmer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
              {googleLoading ? <Spinner /> : <GoogleIcon />}
              <span>Entrar com Google</span>
            </button>



            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">Ou e-mail</span>
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
          {step === 'email' && (
            <form onSubmit={handleEmailStep} className="space-y-4">
              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">E-mail Corporativo</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ex: voce@igloo.com" required autoFocus
                  className="w-full h-9 px-4 rounded-lg bg-white/[0.02] border border-white/5 text-white text-[13px] font-bold outline-none auth-input-focus placeholder-slate-800"
                />
              </div>
              <button type="submit" disabled={loading || !isLoaded || !email.trim()}
                className="w-full h-10 rounded-lg font-black text-[11px] text-white uppercase tracking-widest transition-all duration-300 auth-button-shimmer shadow-lg shadow-primary/5"
                style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)' }}>
                {loading ? <Spinner /> : 'Continuar'}
              </button>
            </form>

          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordStep} className="space-y-4">
              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">Senha de Acesso</label>
                <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required autoFocus
                      className="w-full h-9 px-4 pr-10 rounded-lg bg-white/[0.02] border border-white/5 text-white text-[13px] font-bold outline-none auth-input-focus placeholder-slate-800"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors">
                      {showPassword ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading || !isLoaded || !password.trim()}
                  className="w-full h-10 rounded-lg font-black text-[11px] text-white uppercase tracking-widest transition-all duration-300 auth-button-shimmer shadow-lg shadow-primary/5"
                  style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)' }}>
                  {loading ? <Spinner /> : 'Entrar'}
                </button>
            </form>
          )}


          {step === 'code' && (
            <form onSubmit={handleCodeStep} className="space-y-4">
              <div className="group">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 text-center">Código de 6 dígitos</label>
                <input
                  type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" required autoFocus maxLength={6}
                  className="w-full h-12 px-4 rounded-lg bg-white/[0.02] border border-white/5 text-white text-2xl font-black text-center outline-none tracking-[0.4em] auth-input-focus placeholder-slate-900"
                />
              </div>
              <button type="submit" disabled={loading || !isLoaded || code.length < 6}
                className="w-full h-10 rounded-lg font-black text-[11px] text-white uppercase tracking-widest transition-all duration-300 auth-button-shimmer shadow-lg shadow-primary/5"
                style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)' }}>
                {loading ? <Spinner /> : 'Validar Acesso'}
              </button>
            </form>

          )}
        </div>

        {/* Footer Link */}
        {step === 'email' && (
          <div className="mt-7 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Não tem conta?{' '}
              <Link to="/signup" className="text-primary hover:text-white transition-colors border-b border-primary/20 hover:border-white">
                Cadastre-se →
              </Link>
            </p>
          </div>
        )}

      </div>
    </AuthLayout>
  );
};

export default Login;

