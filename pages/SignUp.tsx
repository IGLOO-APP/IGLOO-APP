import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, ArrowRight, Building2, Key, Loader, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

const SignUp: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('owner');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name, role);
      // Optional: Add a success message or auto-login logic if signUp doesn't throw
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Crie sua conta
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Comece a gerenciar seus imóveis ou aluguéis hoje.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
              role === 'owner'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-lg shadow-primary/10'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 hover:border-primary/50'
            }`}
          >
            <div className={`p-3 rounded-full ${role === 'owner' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
              <Building2 size={24} />
            </div>
            <span className="font-bold text-sm">Proprietário</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('tenant')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
              role === 'tenant'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-lg shadow-primary/10'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 hover:border-primary/50'
            }`}
          >
            <div className={`p-3 rounded-full ${role === 'tenant' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
              <Key size={24} />
            </div>
            <span className="font-bold text-sm">Inquilino</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-scaleUp">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                placeholder="Seu nome"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Telefone (Opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                placeholder="(00) 00000-0000"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirmar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark-hover border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 mt-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Criando conta...
              </>
            ) : (
              <>
                Criar Conta <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary-dark font-bold transition-colors"
          >
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;