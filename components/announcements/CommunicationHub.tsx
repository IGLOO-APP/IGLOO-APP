import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Wrench,
  CalendarDays,
  Calendar,
  TriangleAlert,
  Info,
  Users,
  Eye,
  ChevronRight,
  Zap,
  Bell,
  BellOff,
  Check,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { announcementService } from '../../services/announcementService';
import { OwnerAnnouncement, AnnouncementType } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { executeWorkflowAction } from '../../services/workflow/workflowActions';

interface CommunicationHubProps {
  onNewAnnouncement?: () => void;
  onToggleExpand?: () => void;
  expanded?: boolean;
  tenantPropertyId?: string;
  condoName?: string;
}

// ─── Type metadata ────────────────────────────────────────────────────────────
const TYPE_META: Record<
  AnnouncementType,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  maintenance: {
    label: 'Manutenção',
    icon: <Wrench size={11} />,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  event: {
    label: 'Evento',
    icon: <CalendarDays size={11} />,
    color: 'text-violet-500 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200 dark:border-violet-500/30',
  },
  warning: {
    label: 'Aviso',
    icon: <TriangleAlert size={11} />,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/30',
  },
  info: {
    label: 'Informativo',
    icon: <Info size={11} />,
    color: 'text-sky-500 dark:text-sky-450',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    border: 'border-sky-200 dark:border-sky-500/30',
  },
};

const TARGET_META: Record<string, { label: string; icon: React.ReactNode }> = {
  all: { label: 'Todos', icon: <Users size={10} /> },
  condominium: { label: 'Condomínio', icon: <Megaphone size={10} /> },
  individual: { label: 'Individual', icon: <Check size={10} /> },
  property: { label: 'Imóvel', icon: <Check size={10} /> },
};

// ─── Announcement Row Card ────────────────────────────────────────────────────
const AnnouncementRow: React.FC<{
  ann: OwnerAnnouncement;
  isActive: boolean;
  onClick: () => void;
  fetchData: () => Promise<void>;
}> = ({ ann, isActive, onClick, fetchData }) => {
  const meta = TYPE_META[ann.type] ?? TYPE_META.info;
  const targetMeta = TARGET_META[ann.target_type] ?? TARGET_META.all;
  const handleAction = async (e: React.MouseEvent, endpoint: string) => {
    e.stopPropagation();
    try {
      await executeWorkflowAction(endpoint);
      fetchData();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group/row relative flex gap-2.5 p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isActive
          ? 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/5 shadow-sm'
          : 'border-transparent hover:bg-slate-50/40 dark:hover:bg-white/[0.015] hover:border-slate-100 dark:hover:border-white/[0.02]'
      }`}
    >
      {/* Left: Type icon pill */}
      <div
        className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center border bg-slate-50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/5 ${meta.color} mt-0.5`}
      >
        {meta.icon}
      </div>

      {/* Center: Content */}
      <div className='flex-1 min-w-0'>
        {/* Title row */}
        <div className='flex items-start justify-between gap-1'>
          <h4
            className={`text-sm font-semibold leading-tight line-clamp-1 transition-colors ${
              isActive
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-700 dark:text-slate-300 group-hover/row:text-slate-900 dark:group-hover/row:text-white'
            }`}
          >
            {ann.is_urgent && (
              <span className='inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5 mb-0.5 align-middle' />
            )}
            {ann.title}
          </h4>

          {ann.is_urgent && (
            <Badge variant='destructive'>
              <Zap size={10} /> Urgente
            </Badge>
          )}
        </div>

        {/* Content preview — expands on hover, pushing footer down */}
        <div className='mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 group-hover/row:line-clamp-none transition-all duration-300'>
          {ann.content}
        </div>

        {/* Action button if applicable */}
        {(ann as any).acao_pendente && (
          <Button
            onClick={(e) => handleAction(e, (ann as any).acao_pendente.endpoint)}
            variant='outline'
            size='sm'
            className='mt-2 w-full text-xs font-semibold rounded-lg'
          >
            {(ann as any).acao_pendente.label}
          </Button>
        )}

        {/* Date row */}
        <div className='flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[10px] text-muted-foreground font-medium'>
          <span className='inline-flex items-center gap-1'>
            <Calendar size={10} />{' '}
            {new Date(ann.created_at).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {ann.expires_at && (
            <>
              <span className='text-slate-300 dark:text-slate-600'>|</span>
              <span className='inline-flex items-center gap-1'>
                <CalendarDays size={10} /> Expira{' '}
                {new Date(ann.expires_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </>
          )}
        </div>

        {/* Meta & Stats row */}
        <div className='flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 pt-1.5 border-t border-slate-100/50 dark:border-white/5'>
          <Badge variant='outline' className={meta.color}>
            {meta.icon} {meta.label}
          </Badge>
          <span className='inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground'>
            {targetMeta.icon} {targetMeta.label}
          </span>
          {ann.views_count != null && (
            <span className='inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium'>
              <Eye size={11} /> {ann.views_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CommunicationHub: React.FC<CommunicationHubProps> = ({
  onNewAnnouncement,
  onToggleExpand,
  expanded = false,
  tenantPropertyId,
  condoName,
}) => {
  const ITEMS_PER_PAGE = expanded ? 3 : 2;

  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<OwnerAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data =
        user.role === 'owner'
          ? await announcementService.getForOwner(user.id)
          : await announcementService.getForTenant(user.id, tenantPropertyId, condoName);
      setAnnouncements(
        (data || []).filter((a) => !a.expires_at || new Date(a.expires_at) > new Date())
      );
    } catch (_error) {
      console.error('Error fetching communication data:', _error);
    } finally {
      setLoading(false);
    }
  }, [user, tenantPropertyId, condoName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <div className='w-full h-full bg-slate-900/50 animate-pulse rounded-[32px] border border-white/5' />
    );

  const isOwner = user?.role === 'owner';
  if (announcements.length === 0 && !isOwner) return null;

  const urgentCount = announcements.filter((a) => a.is_urgent).length;
  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);
  const paginatedAnnouncements = announcements.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <motion.div layout className='relative group h-full cursor-default'>
      <Card className='h-full flex flex-col relative overflow-hidden'>
        {/* Subtle bg icon */}
        <div className='absolute bottom-2 right-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity text-primary pointer-events-none'>
          <Megaphone className='w-20 h-20' />
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className='flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-border relative z-10'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
              <Megaphone size={16} />
            </div>
            <div>
              <p className='text-xs font-medium text-muted-foreground'>Governance Hub</p>
              <h3 className='text-sm font-bold text-foreground tracking-tight mt-0.5'>
                Comunicações
              </h3>
            </div>
          </div>

          <div className='flex items-center gap-1.5'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              className='w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all'
              title={expanded ? 'Recolher' : 'Expandir'}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {isOwner && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewAnnouncement?.();
                }}
                variant='outline'
                size='sm'
                className='rounded-2xl text-xs font-semibold'
              >
                <Plus size={14} /> Novo
              </Button>
            )}
          </div>
        </div>

        {/* ── List ────────────────────────────────────────────────────────── */}
        <div className='flex-1 overflow-y-auto px-3 py-2 space-y-2 relative z-10 custom-scrollbar min-h-0'>
          {announcements.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full gap-3 py-8 text-center px-4'>
              <div className='w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-white/10'>
                <BellOff size={22} />
              </div>
              <div>
                <p className='text-xs font-semibold text-muted-foreground'>Sem comunicados</p>
                <p className='text-[10px] text-slate-400 dark:text-slate-600 mt-1 font-medium'>
                  Nenhum aviso ativo no momento.
                </p>
              </div>
              {isOwner && (
                <Button
                  onClick={onNewAnnouncement}
                  variant='default'
                  size='sm'
                  className='rounded-2xl text-xs font-semibold shadow-lg shadow-primary/20'
                >
                  <Plus size={14} /> Criar Comunicado
                </Button>
              )}
            </div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {paginatedAnnouncements.map((ann, i) => (
                <motion.div
                  key={ann.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: i * 0.06,
                  }}
                >
                  <AnnouncementRow
                    ann={ann}
                    isActive={false}
                    onClick={() => {}}
                    fetchData={fetchData}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* ── Type legend strip ────────────────────────────────────────────── */}
        {announcements.length > 0 && (
          <div className='px-4 py-2 border-t border-slate-100 dark:border-white/5 flex items-center gap-2'>
            {urgentCount > 0 && (
              <Badge variant='destructive'>
                <Zap size={10} /> {urgentCount}
              </Badge>
            )}
            <span className='flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-600 font-medium'>
              <Bell size={12} /> {announcements.length} comunicado
              {announcements.length !== 1 ? 's' : ''} ativo{announcements.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className='px-3 py-2 border-t border-slate-100 dark:border-white/5 flex justify-center items-center'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className='w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-20 disabled:pointer-events-none'
              >
                <ChevronRight size={14} className='rotate-180' />
              </button>

              <div className='flex gap-1'>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === page
                        ? 'bg-primary w-4'
                        : 'bg-slate-200 dark:bg-white/10 w-1.5 hover:bg-slate-300 dark:hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className='w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-20 disabled:pointer-events-none'
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default CommunicationHub;
