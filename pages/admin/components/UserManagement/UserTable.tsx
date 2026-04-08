import React, { useState } from 'react';
import {
  MoreHorizontal,
  Ban,
  UserCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Download,
  Eye,
  Loader,
  Search,
} from 'lucide-react';
import { User } from '../../../../types';

interface UserTableProps {
  users: User[];
  totalUsers: number;
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  onImpersonate: (user: User) => void;
  onViewProfile: (user: User) => void;
  onUpdatePlan: (user: User) => void;
  onSuspend: (user: User) => void;
  onUnsuspend: (user: User) => void;
  onExportData: (user: User) => void;
  onClearFilters: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  totalUsers,
  loading,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  onImpersonate,
  onViewProfile,
  onUpdatePlan,
  onSuspend,
  onUnsuspend,
  onExportData,
  onClearFilters,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className='bg-white dark:bg-surface-dark rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-slate-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10'>
              <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Usuário
              </th>
              <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Role
              </th>
              <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Plano
              </th>
              <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Status
              </th>
              <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Cadastro
              </th>
              <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right'>
                Ações
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-white/5'>
            {loading ? (
              <tr>
                <td colSpan={6} className='px-8 py-20 text-center text-slate-500'>
                  <div className='flex flex-col justify-center items-center gap-4'>
                    <Loader className='animate-spin text-primary' size={32} />
                    <p className='font-bold text-sm'>Carregando usuários...</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-8 py-20 text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400'>
                      <Search size={32} />
                    </div>
                    <h4 className='font-bold text-slate-900 dark:text-white'>
                      Nenhum usuário encontrado
                    </h4>
                    <p className='text-sm text-slate-500 max-w-xs'>
                      Não encontramos resultados para os filtros selecionados. Tente ajustar sua busca.
                    </p>
                    <button
                      onClick={onClearFilters}
                      className='mt-2 text-primary font-bold hover:underline text-sm'
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className='hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group'
                >
                  <td className='px-8 py-5'>
                    <div className='flex items-center gap-4'>
                      <div className='w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-600 dark:text-white font-black shadow-inner'>
                        {u.name ? u.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className='font-bold text-slate-900 dark:text-white leading-tight'>
                          {u.name}
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-8 py-5'>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          : u.role === 'owner'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                      }`}
                    >
                      {u.role === 'admin' ? 'Administrador' : u.role === 'owner' ? 'Proprietário' : 'Inquilino'}
                    </span>
                  </td>
                  <td className='px-8 py-5'>
                    {u.role === 'admin' ? (
                      <span className='text-[10px] font-black px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg uppercase tracking-widest'>
                        Sistema
                      </span>
                    ) : (
                      <span className='text-[10px] font-black px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 uppercase tracking-widest'>
                        {(u as any).plan || 'Free'}
                      </span>
                    )}
                  </td>
                  <td className='px-8 py-5'>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        !u.is_suspended
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${!u.is_suspended ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      ></div>
                      {!u.is_suspended ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className='px-8 py-5'>
                    <p className='text-sm font-bold text-slate-600 dark:text-slate-400'>
                      {new Date((u as any).created_at || Date.now()).toLocaleDateString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </td>
                  <td className='px-8 py-5'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        onClick={() => onViewProfile(u)}
                        title='Ver perfil completo'
                        className='p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all'
                      >
                        <Eye size={18} />
                      </button>
                      <div className='relative'>
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === `actions-${u.id}` ? null : `actions-${u.id}`
                            )
                          }
                          className='p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all'
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeDropdown === `actions-${u.id}` && (
                          <>
                            <div
                              className='fixed inset-0 z-10'
                              onClick={() => setActiveDropdown(null)}
                            ></div>
                            <div className='absolute right-0 top-full mt-1 w-56 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 py-2 z-20 animate-scaleUp origin-top-right'>
                              <button
                                onClick={() => {
                                  onImpersonate(u);
                                  setActiveDropdown(null);
                                }}
                                className='w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3'
                              >
                                <ExternalLink size={16} className='text-amber-500' />
                                Acessar como usuário
                              </button>
                              <button
                                onClick={() => {
                                  onUpdatePlan(u);
                                  setActiveDropdown(null);
                                }}
                                className='w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3'
                              >
                                <ShieldAlert size={16} className='text-blue-500' />
                                Alterar plano
                              </button>
                              <button
                                onClick={() => {
                                  if (u.is_suspended) onUnsuspend(u);
                                  else onSuspend(u);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 ${u.is_suspended ? 'text-emerald-600' : 'text-rose-600'}`}
                              >
                                {u.is_suspended ? (
                                  <>
                                    <UserCheck size={16} /> Reativar conta
                                  </>
                                ) : (
                                  <>
                                    <Ban size={16} /> Suspender conta
                                  </>
                                )}
                              </button>
                              <div className='my-1 border-t border-gray-100 dark:border-white/5'></div>
                              <button
                                onClick={() => {
                                  onExportData(u);
                                  setActiveDropdown(null);
                                }}
                                className='w-full text-left px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3'
                              >
                                <Download size={16} />
                                Exportar dados
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className='px-8 py-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-white/5'>
          <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalUsers)} a{' '}
            {Math.min(currentPage * itemsPerPage, totalUsers)} de {totalUsers} usuários
          </p>
          <div className='flex items-center gap-2'>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className='p-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm'
            >
              <ChevronLeft size={20} />
            </button>
            <div className='flex items-center gap-1'>
              {Array.from({ length: Math.ceil(totalUsers / itemsPerPage) }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === Math.ceil(totalUsers / itemsPerPage) || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className='text-slate-400'>...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-white/5 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              disabled={currentPage >= Math.ceil(totalUsers / itemsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
              className='p-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm'
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
