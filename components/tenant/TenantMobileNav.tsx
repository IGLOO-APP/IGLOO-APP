import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toolbar, Tabbar, TabbarLink } from 'konsta/react';
import { Lock } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  description: string;
  disabled: boolean;
}

interface TenantMobileNavProps {
  navItems: NavItem[];
}

export const TenantMobileNav: React.FC<TenantMobileNavProps> = ({ navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Toolbar className='md:hidden fixed bottom-0 left-0 right-0 z-50' tabbar>
      <Tabbar>
        {navItems
          .filter((item) => item.path !== '/tenant/profile' && item.path !== '/tenant/settings')
          .map((item) => {
            const isActive = !item.disabled && location.pathname === item.path;
            if (item.disabled) {
              return (
                <TabbarLink
                  key={item.path}
                  active={false}
                  label={item.label}
                  className='opacity-35 cursor-not-allowed'
                  title='Complete o onboarding para desbloquear'
                >
                  <span className='relative inline-flex'>
                    <item.icon size={21} strokeWidth={1.8} />
                    <span className='absolute -top-1 -right-2 w-3 h-3 bg-slate-400 rounded-full flex items-center justify-center'>
                      <Lock size={6} className='text-white' />
                    </span>
                  </span>
                </TabbarLink>
              );
            }
            return (
              <TabbarLink
                key={item.path}
                active={isActive}
                label={item.label}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
              </TabbarLink>
            );
          })}
      </Tabbar>
    </Toolbar>
  );
};
