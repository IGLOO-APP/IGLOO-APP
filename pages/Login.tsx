import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader, UserSearch, X, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Forgot Account States
  const [showRecoverAccountModal, setShowRecoverAccountModal] = useState(false);
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoveredEmail, setRecoveredEmail] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'tenant') {
        navigate('/tenant');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirect is handled by useEffect when user state updates
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.resetPassword(forgotEmail);
      setSuccess('Link de recuperação enviado! Verifique seu e-mail.');
      setShowForgotModal(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleRecoverAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverLoading(true);
    setError('');
    setRecoveredEmail('');

    try {
      const { email } = await authService.recoverAccount(recoverIdentifier);
      setRecoveredEmail(email);
    } catch (err: any) {
      setError(err.message || 'Não encontramos nenhuma conta com esses dados.');
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 transition-colors duration-300'>
      <div className='w-full max-w-md space-y-8 animate-fadeIn'>
        <div className='text-center'>
          <div className='mx-auto h-20 w-20 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center text-white text-4xl font-extrabold shadow-2xl shadow-primary/30 mb-8 transform rotate-3'>
            I
          </div>
          <h2 className='text-3xl font-bold text-slate-900 dark:text-white tracking-tight'>
            Bem-vindo ao Igloo
          </h2>
          <p className='mt-3 text-slate-500 dark:text-slate-400 text-lg'>
            Faça login para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5'
        >
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-scaleUp'>
              <AlertCircle className='text-red-500 shrink-0 mt-0.5' size={20} />
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            </div>
          )}

          {success && (
            <div className='bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3 animate-scaleUp'>
              <CheckCircle className='text-emerald-500 shrink-0 mt-0.5' size={20} />
              <p className='text-sm text-emerald-600 dark:text-emerald-400'>{success}</p>
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
              Email
            </label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white'
                placeholder='seu@email.com'
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
              Senha
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white'
                placeholder='••••••••'
                required
                disabled={loading}
              />
            </div>
            <div className='flex justify-between mt-2'>
              <button
                type='button'
                onClick={() => {
                  setShowRecoverAccountModal(true);
                  setError('');
                }}
                className='text-xs font-semibold text-slate-500 hover:text-primary transition-colors'
              >
                Esqueceu sua conta?
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotEmail(email);
                  setError('');
                }}
                className='text-xs font-semibold text-primary hover:text-primary-dark transition-colors'
              >
                Esqueceu sua senha?
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
          >
            {loading ? (
              <>
                <Loader className='animate-spin' size={20} />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>

          <div className='text-center pt-4 border-t border-gray-200 dark:border-white/10'>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Não tem uma conta?{' '}
              <button
                type='button'
                onClick={() => navigate('/signup')}
                className='text-primary hover:text-primary-dark font-bold transition-colors'
                disabled={loading}
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </form>

        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm'>
          <p className='font-semibold text-blue-900 dark:text-blue-300 mb-2'>
            🧪 Modo de Desenvolvimento
          </p>
          <p className='text-blue-700 dark:text-blue-400 mb-3'>
            Use as credenciais abaixo para testar os perfis:
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div
              className='bg-white dark:bg-surface-dark rounded-lg p-3 font-mono text-xs space-y-1 border border-blue-100 dark:border-white/5 cursor-pointer hover:border-primary/50 transition-colors'
              onClick={() => {
                setEmail('proprietario@teste.com');
                setPassword('teste123');
              }}
            >
              <div className='font-bold text-slate-500 uppercase mb-1'>Proprietário</div>
              <div className='truncate'>
                <span className='text-slate-400'>E:</span>{' '}
                <span className='text-slate-900 dark:text-white'>proprietario@teste.com</span>
              </div>
              <div>
                <span className='text-slate-400'>S:</span>{' '}
                <span className='text-slate-900 dark:text-white'>teste123</span>
              </div>
            </div>
            <div
              className='bg-white dark:bg-surface-dark rounded-lg p-3 font-mono text-xs space-y-1 border border-blue-100 dark:border-white/5 cursor-pointer hover:border-primary/50 transition-colors'
              onClick={() => {
                setEmail('inquilino@teste.com');
                setPassword('teste123');
              }}
            >
              <div className='font-bold text-slate-500 uppercase mb-1'>Inquilino</div>
              <div className='truncate'>
                <span className='text-slate-400'>E:</span>{' '}
                <span className='text-slate-900 dark:text-white'>inquilino@teste.com</span>
              </div>
              <div>
                <span className='text-slate-400'>S:</span>{' '}
                <span className='text-slate-900 dark:text-white'>teste123</span>
              </div>
            </div>
            <div
              className='bg-white dark:bg-surface-dark rounded-lg p-3 font-mono text-xs space-y-1 border border-blue-100 dark:border-white/5 cursor-pointer hover:border-primary/50 transition-colors col-span-1 md:col-span-2'
              onClick={() => {
                setEmail('admin@teste.com');
                setPassword('admin123');
              }}
            >
              <div className='font-bold text-amber-500 uppercase mb-1'>Admin (Dono)</div>
              <div className='truncate'>
                <span className='text-slate-400'>E:</span>{' '}
                <span className='text-slate-900 dark:text-white'>admin@teste.com</span>
              </div>
              <div>
                <span className='text-slate-400'>S:</span>{' '}
                <span className='text-slate-900 dark:text-white'>admin123</span>
              </div>
            </div>
          </div>
        </div>

        <p className='text-center text-xs text-slate-400 dark:text-slate-600'>
          Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn'>
          <div className='bg-white dark:bg-surface-dark w-full max-w-sm p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 animate-scaleUp'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold text-slate-900 dark:text-white'>Recuperar Senha</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <p className='text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed'>
              Digite seu e-mail abaixo. Enviaremos um link para você redefinir sua senha com
              segurança.
            </p>

            <form onSubmit={handleForgotPassword} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                  E-mail de cadastro
                </label>
                <div className='relative'>
                  <Mail
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                    size={20}
                  />
                  <input
                    type='email'
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className='w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white'
                    placeholder='seu@email.com'
                    required
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={forgotLoading}
                className='w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20'
              >
                {forgotLoading ? (
                  <>
                    <Loader className='animate-spin' size={20} />
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </button>

              <button
                type='button'
                onClick={() => setShowForgotModal(false)}
                className='w-full text-slate-500 dark:text-slate-400 text-sm font-medium py-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors'
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recover Account Modal */}
      {showRecoverAccountModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn'>
          <div className='bg-white dark:bg-surface-dark w-full max-w-sm p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 animate-scaleUp'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold text-slate-900 dark:text-white'>Recuperar Conta</h3>
              <button
                onClick={() => {
                  setShowRecoverAccountModal(false);
                  setRecoveredEmail('');
                }}
                className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <p className='text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed'>
              Não lembra qual e-mail usou? Digite seu CPF ou Telefone para localizarmos sua conta.
            </p>

            {recoveredEmail ? (
              <div className='bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center animate-scaleUp'>
                <CheckCircle className='text-emerald-500 mx-auto mb-3' size={32} />
                <p className='text-sm text-slate-600 dark:text-slate-300 mb-4'>
                  Encontramos uma conta vinculada ao e-mail:
                </p>
                <p className='text-lg font-bold text-slate-900 dark:text-white mb-6'>
                  {recoveredEmail}
                </p>
                <button
                  onClick={() => {
                    setEmail(recoveredEmail.includes('*') ? '' : recoveredEmail);
                    setShowRecoverAccountModal(false);
                    setRecoveredEmail('');
                  }}
                  className='w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all'
                >
                  Ir para Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecoverAccount} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    CPF ou Telefone
                  </label>
                  <div className='relative'>
                    <UserSearch
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      size={20}
                    />
                    <input
                      type='text'
                      value={recoverIdentifier}
                      onChange={(e) => setRecoverIdentifier(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white'
                      placeholder='000.000.000-00'
                      required
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={recoverLoading}
                  className='w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20'
                >
                  {recoverLoading ? (
                    <>
                      <Loader className='animate-spin' size={20} />
                      Buscando...
                    </>
                  ) : (
                    'Localizar Conta'
                  )}
                </button>

                <button
                  type='button'
                  onClick={() => setShowRecoverAccountModal(false)}
                  className='w-full text-slate-500 dark:text-slate-400 text-sm font-medium py-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors'
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
