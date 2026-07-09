const preloadMap: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/Dashboard'),
  '/properties': () => import('../pages/Properties'),
  '/properties/:id': () => import('../pages/properties/PropertyDetailsPage'),
  '/tenants': () => import('../pages/Tenants'),
  '/tenants/:id': () => import('../pages/TenantDetailsPage'),
  '/messages': () => import('../pages/OwnerMessages'),
  '/contracts': () => import('../pages/Contracts'),
  '/financials': () => import('../pages/Financials'),
  '/settings': () => import('../pages/Settings'),
  '/tenant': () => import('../pages/tenant/TenantDashboard'),
  '/tenant/contract': () => import('../pages/tenant/TenantContract'),
  '/tenant/payments': () => import('../pages/tenant/TenantPayments'),
  '/tenant/maintenance': () => import('../pages/tenant/TenantMaintenance'),
  '/tenant/profile': () => import('../pages/tenant/TenantProfile'),
  '/tenant/messages': () => import('../pages/tenant/TenantMessages'),
  '/tenant/settings': () => import('../pages/tenant/TenantSettings'),
  '/admin': () => import('../pages/admin/AdminDashboard'),
  '/admin/users': () => import('../pages/admin/UserManagement'),
  '/admin/team': () => import('../components/admin/AdminManager'),
  '/admin/subscriptions': () => import('../pages/admin/SubscriptionManagement'),
  '/admin/support': () => import('../pages/admin/SupportCenter'),
  '/admin/conversations': () => import('../pages/admin/Conversations'),
  '/admin/announcements': () => import('../pages/admin/Announcements'),
  '/admin/conversion': () => import('../pages/admin/ConversionReport'),
  '/admin/settings': () => import('../pages/admin/SystemSettings'),
};

const preloaded = new Set<string>();

export function preloadRoute(path: string) {
  if (preloaded.has(path)) return;
  const loader = preloadMap[path];
  if (loader) {
    preloaded.add(path);
    loader().catch(() => {});
  }
}
