import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUp, ArrowDown, ChevronRight, LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export const Sparkline = ({ data, color: _color }: { data: number[]; color: string }) => (
  <div className='h-8 w-16 sm:h-10 sm:w-20 md:w-24 xl:w-16 xl:h-8 2xl:w-24 2xl:h-10'>
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart data={data.map((val, i) => ({ i, val }))}>
        <Line type='monotone' dataKey='val' stroke={_color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

interface HeroCardProps {
  title: string;
  value: string;
  subtext: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  sparkData?: number[];
  variant?: 'default' | 'critical' | 'muted';
  tooltip?: string;
  className?: string;
}

export const HeroCard = ({
  title,
  value,
  subtext,
  trend,
  trendUp,
  icon: Icon,
  sparkData,
  variant = 'default',
  tooltip,
  className,
}: HeroCardProps) => {
  return (
    <Card
      className={`h-full p-4 active-tap transition-all duration-200 group relative flex flex-col justify-between ${className || ''} ${
        variant === 'critical'
          ? 'border-destructive/50'
          : variant === 'muted'
            ? 'opacity-70 border-dashed border-border/50'
            : 'hover:shadow-md'
      }`}
    >
      {variant === 'critical' && (
        <div className='absolute top-3 right-3 z-20'>
          <Badge variant='destructive'>
            <span className='w-1.5 h-1.5 rounded-full bg-current motion-safe:animate-pulse' />
            Atenção
          </Badge>
        </div>
      )}

      <div className='relative z-10 w-full'>
        <div className='flex justify-between items-start mb-3'>
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-all duration-200 ${
              variant === 'critical'
                ? 'bg-destructive/10'
                : variant === 'muted'
                  ? 'bg-muted'
                  : 'bg-accent group-hover:bg-primary/20'
            }`}
          >
            <Icon
              size={18}
              className={`w-5 h-5 motion-safe:group-hover:scale-105 transition-transform duration-200 ${
                variant === 'critical'
                  ? 'text-destructive'
                  : variant === 'muted'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground group-hover:text-primary'
              }`}
            />
          </div>
          {sparkData ? (
            <div className='hidden sm:block pt-1 shrink-0'>
              <Sparkline data={sparkData} color={trendUp ? '#10b981' : '#ef4444'} />
            </div>
          ) : (
            <div className='hidden sm:block shrink-0 w-24 h-8' />
          )}
        </div>

        <div className='flex flex-col gap-0.5'>
          <div className='flex items-start gap-1.5'>
            <p className='text-[10px] font-semibold text-muted-foreground leading-tight'>{title}</p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='w-3 h-3 rounded-full bg-muted-foreground/10 text-muted-foreground flex items-center justify-center text-[7px] font-bold leading-none cursor-help'>
                    ?
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-52'>
                    <p className='text-[9px] font-semibold mb-1'>{title}</p>
                    <p className='text-[10px] leading-snug font-medium'>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <h3
            className={`text-base sm:text-xl xl:text-2xl font-black tracking-tighter truncate ${
              variant === 'muted' ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {variant === 'muted' && !value ? '--' : value}
          </h3>
        </div>
      </div>

      <div className='relative z-10 flex flex-wrap items-center gap-2 mt-2'>
        {variant !== 'muted' && (
          <Badge variant={trendUp ? 'default' : 'destructive'}>
            {trendUp ? (
              <ArrowUp size={9} strokeWidth={1.8} />
            ) : (
              <ArrowDown size={9} strokeWidth={1.8} />
            )}{' '}
            {trend}
          </Badge>
        )}
        <span className='text-[10px] font-medium text-muted-foreground/60 line-clamp-1'>
          {variant === 'muted' ? 'Indisponível' : subtext}
        </span>
      </div>
    </Card>
  );
};

interface AlertBadgeProps {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}

export const AlertBadge = ({ icon: Icon, label, count, color, onClick }: AlertBadgeProps) => (
  <Button
    onClick={onClick}
    variant='outline'
    className={`flex items-center gap-3 px-4 py-3 h-auto rounded-[32px] transition-all duration-200 active-tap shrink-0 ${color} bg-opacity-5 border-opacity-10 hover:bg-opacity-15 hover:border-opacity-20 shadow-sm hover:shadow-md group/alert`}
  >
    <div className='relative shrink-0'>
      <div
        className={`absolute inset-0 rounded-full ${color.replace('text-', 'bg-')} opacity-0 group-hover/alert:opacity-20 transition-opacity duration-200`}
      />
      <Icon
        size={20}
        strokeWidth={1.8}
        className='shrink-0 transition-transform duration-200 motion-safe:group-hover/alert:scale-105'
      />
      {count > 0 && (
        <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card' />
      )}
    </div>
    <div className='text-left flex-1 min-w-0'>
      <p className='text-[10px] font-semibold text-muted-foreground mb-0.5 truncate'>{label}</p>
      {count > 0 ? (
        <p className='text-sm font-black truncate flex items-center gap-1.5 text-foreground'>
          {count} <span className='opacity-50 font-bold'>pendentes</span>
        </p>
      ) : (
        <p className='text-sm font-bold opacity-40 italic'>Tudo em ordem</p>
      )}
    </div>
    <ChevronRight
      size={16}
      strokeWidth={1.8}
      className='opacity-30 group-hover/alert:opacity-100 group-hover/alert:translate-x-1 transition-all duration-200 text-muted-foreground group-hover:text-primary'
    />
  </Button>
);

// ─── Shared Design System Components ─────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  tooltip?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  action,
  icon: Icon,
  iconColor = 'text-primary',
  tooltip,
}: SectionHeaderProps) => {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex items-center gap-3'>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center ${iconColor} shrink-0 backdrop-blur-sm`}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
        )}
        <div>
          <h2 className='text-base lg:text-lg font-bold text-foreground flex items-center gap-2'>
            {title}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='w-3.5 h-3.5 rounded-full bg-muted-foreground/10 text-muted-foreground flex items-center justify-center text-[8px] font-bold leading-none cursor-help'>
                    ?
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-56'>
                    <p className='text-[10px] font-semibold mb-1'>{title}</p>
                    <p className='text-[11px] leading-snug font-medium'>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h2>
          {subtitle && <p className='text-[10px] font-medium text-muted-foreground'>{subtitle}</p>}
        </div>
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  );
};

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState = ({ icon: Icon, message, action, className = '' }: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center py-6 sm:py-10 ${className}`}>
    <div className='w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/40 mb-4'>
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <p className='text-xs font-medium text-muted-foreground mb-4 text-center max-w-xs'>{message}</p>
    {action && (
      <Button
        onClick={action.onClick}
        variant='default'
        size='sm'
        className='text-xs font-semibold'
      >
        {action.label}
      </Button>
    )}
  </div>
);

export const HeroCardSkeleton = () => (
  <Card className='h-full p-6 animate-pulse'>
    <div className='flex justify-between items-start mb-6'>
      <div className='w-14 h-14 rounded-xl bg-muted-foreground/10' />
      <div className='w-20 h-8 rounded bg-muted-foreground/10' />
    </div>
    <div className='space-y-3'>
      <div className='h-3 w-28 rounded bg-muted-foreground/10' />
      <div className='h-9 w-36 rounded bg-muted-foreground/10' />
    </div>
    <div className='flex gap-2 mt-4'>
      <div className='h-6 w-16 rounded-lg bg-muted-foreground/10' />
      <div className='h-6 w-24 rounded-lg bg-muted-foreground/10' />
    </div>
  </Card>
);

interface PeriodOption {
  label: string;
  value: string;
}

interface PeriodSelectorProps {
  options: PeriodOption[];
  value: string;
  onChange: (value: string) => void;
}

export const PeriodSelector = ({ options, value, onChange }: PeriodSelectorProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className='w-auto gap-2 pl-4 pr-3 py-2 rounded-2xl bg-white/5 dark:bg-white/6 border border-white/10 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all'>
      <SelectValue />
    </SelectTrigger>
    <SelectContent className='rounded-2xl border-border/50 shadow-2xl backdrop-blur-xl bg-background/95'>
      {options.map((opt) => (
        <SelectItem key={opt.value} value={opt.value} className='text-xs font-semibold'>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
