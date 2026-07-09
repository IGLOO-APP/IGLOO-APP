'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = true, open: openProp, onOpenChange, className, children, ...props }, ref) => {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value;
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open]
  );

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggleSidebar = React.useCallback(() => setOpen((prev) => !prev), [setOpen]);

  const state = open ? 'expanded' : 'collapsed';

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, isMobile, toggleSidebar }}>
      <div
        ref={ref}
        data-slot='sidebar-provider'
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
        className={cn('group/sidebar-wrapper flex min-h-0 w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    collapsible?: 'offcanvas' | 'icon' | 'none';
  }
>(({ side = 'left', collapsible = 'icon', className, children, ...props }, ref) => {
  const { isMobile, open, setOpen, state } = useSidebar();

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {open && (
          <div
            data-slot='sidebar-overlay'
            className='fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity duration-200 md:hidden'
            onClick={() => setOpen?.(false)}
          />
        )}
        <div
          ref={ref}
          data-slot='sidebar'
          data-side={side}
          data-mobile='true'
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'fixed inset-y-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out md:hidden',
            side === 'left' ? 'left-0' : 'right-0',
            open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
            'w-[var(--sidebar-width-mobile)]'
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <div
      ref={ref}
      data-slot='sidebar'
      data-side={side}
      data-collapsible={collapsible}
      data-state={state}
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border',
        'h-full shrink-0 transition-[width] duration-300 ease-in-out',
        collapsible === 'icon' && state === 'collapsed' && 'w-[var(--sidebar-width-icon)]',
        collapsible !== 'icon' && 'w-[var(--sidebar-width)]',
        collapsible === 'icon' && state === 'expanded' && 'w-[var(--sidebar-width)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot='sidebar-header'
      className={cn('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot='sidebar-footer'
      className={cn('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot='sidebar-content'
      className={cn('flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto', className)}
      {...props}
    />
  )
);
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot='sidebar-group'
      className={cn('flex flex-col gap-1 px-3', className)}
      {...props}
    />
  )
);
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot='sidebar-group-label'
      className={cn(
        'px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider',
        className
      )}
      {...props}
    />
  )
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarSeparator = React.forwardRef<HTMLHRElement, React.ComponentProps<'hr'>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      data-slot='sidebar-separator'
      className={cn('mx-3 my-2 border-t border-sidebar-border', className)}
      {...props}
    />
  )
);
SidebarSeparator.displayName = 'SidebarSeparator';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot='sidebar-menu'
      className={cn('flex flex-col gap-0.5', className)}
      {...props}
    />
  )
);
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-slot='sidebar-menu-item' className={cn('', className)} {...props} />
  )
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string;
  }
>(({ asChild = false, isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      data-slot='sidebar-menu-button'
      data-active={isActive}
      className={cn(
        'group/menu-button flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium outline-none transition-colors',
        'data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean;
  }
>(({ asChild = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      data-slot='sidebar-menu-action'
      className={cn(
        'flex items-center justify-center rounded-md p-1 text-sidebar-foreground/50 opacity-0 transition-all',
        'group-hover/menu-button:opacity-100',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        className
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = 'SidebarMenuAction';

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
};
