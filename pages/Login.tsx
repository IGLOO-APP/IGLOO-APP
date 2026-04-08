import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';

type Step = 'email' | 'password' | 'code';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'E-mail não encontrado.');
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
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Senha incorreta.');
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
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 20% 50%, #0d1f24 0%, #0b1011 60%, #060d0e 100%)' }}>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[140px] animate-pulse"
          style={{ background: 'radial-gradient(circle, #13c8ec, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full opacity-15 blur-[140px] animate-pulse"
          style={{ background: 'radial-gradient(circle, #0891b2, transparent 70%)', animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] rounded-full opacity-10 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm relative z-10" style={{ animation: 'fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold mb-5 ring-2 ring-white/10"
            style={{
              background: 'linear-gradient(135deg, #13c8ec, #0891b2)',
              boxShadow: '0 0 40px rgba(19,200,236,0.35), 0 8px 32px rgba(0,0,0,0.4)',
            }}>
            I
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase italic mb-1">
            Igloo <span style={{ color: '#13c8ec' }}>Platform</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Portal de Gestão Premium</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl p-8"
          style={{
            background: 'rgba(20, 27, 29, 0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}>

          {/* Step header */}
          <div className="mb-6">
            {step === 'email' && (
              <>
                <h2 className="text-xl font-black text-white mb-1">Bem-vindo de volta</h2>
                <p className="text-slate-500 text-sm">Entre com seu e-mail para continuar</p>
              </>
            )}
            {step === 'password' && (
              <>
                <button onClick={() => { setStep('email'); setError(''); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider mb-4 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Voltar
                </button>
                <h2 className="text-xl font-black text-white mb-1">Sua senha</h2>
                <p className="text-slate-500 text-sm truncate">Entrando como <span className="text-slate-300">{email}</span></p>
              </>
            )}
            {step === 'code' && (
              <>
                <button onClick={() => { setStep('email'); setError(''); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider mb-4 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Voltar
                </button>
                <h2 className="text-xl font-black text-white mb-1">Código enviado</h2>
                <p className="text-slate-500 text-sm">Verifique seu e-mail <span className="text-slate-300">{email}</span></p>
              </>
            )}
          </div>

          {/* Google button — only on email step */}
          {step === 'email' && (
            <>
              <button onClick={signInWithGoogle} disabled={googleLoading || !isLoaded}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                {googleLoading ? <Spinner /> : <GoogleIcon />}
                <span className="text-slate-200 text-sm font-semibold">Continuar com Google</span>
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">ou</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {error}
            </div>
          )}

          {/* Email step form */}
          {step === 'email' && (
            <form onSubmit={handleEmailStep} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">E-mail</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required autoFocus
                  className="w-full h-12 px-4 rounded-xl text-white text-sm font-medium outline-none transition-all duration-200 placeholder-slate-600"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.border = '1px solid rgba(19,200,236,0.5)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <button type="submit" disabled={loading || !isLoaded || !email.trim()}
                className="w-full h-12 rounded-xl font-black text-sm text-white uppercase tracking-widest transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)', boxShadow: '0 4px 20px rgba(19,200,236,0.3)' }}>
                {loading ? <Spinner /> : 'Continuar →'}
              </button>
            </form>
          )}

          {/* Password step form */}
          {step === 'password' && (
            <form onSubmit={handlePasswordStep} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoFocus
                    className="w-full h-12 px-4 pr-12 rounded-xl text-white text-sm font-medium outline-none transition-all duration-200 placeholder-slate-600"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => e.target.style.border = '1px solid rgba(19,200,236,0.5)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || !isLoaded || !password.trim()}
                className="w-full h-12 rounded-xl font-black text-sm text-white uppercase tracking-widest transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)', boxShadow: '0 4px 20px rgba(19,200,236,0.3)' }}>
                {loading ? <Spinner /> : 'Entrar →'}
              </button>
            </form>
          )}

          {/* Code step form */}
          {step === 'code' && (
            <form onSubmit={handleCodeStep} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Código de verificação</label>
                <input
                  type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" required autoFocus maxLength={6}
                  className="w-full h-14 px-4 rounded-xl text-white text-xl font-black text-center outline-none tracking-[0.5em] transition-all duration-200 placeholder-slate-700"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.border = '1px solid rgba(19,200,236,0.5)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <button type="submit" disabled={loading || !isLoaded || code.length < 6}
                className="w-full h-12 rounded-xl font-black text-sm text-white uppercase tracking-widest transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #13c8ec, #0891b2)', boxShadow: '0 4px 20px rgba(19,200,236,0.3)' }}>
                {loading ? <Spinner /> : 'Verificar →'}
              </button>
            </form>
          )}

          {/* Sign up link */}
          {step === 'email' && (
            <p className="text-center mt-5 text-sm text-slate-600">
              Não tem conta?{' '}
              <Link to="/signup" className="font-bold transition-colors" style={{ color: '#13c8ec' }}>
                Cadastre-se
              </Link>
            </p>
          )}
        </div>

        {/* Bottom label */}
        <p className="text-center mt-6 text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
          Padrão de Segurança Enterprise
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
