import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { UserRole } from './types';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './context/AuthContext';

// Layouts
import Layout from './components/Layout';
import TenantLayout from './components/TenantLayout';
import AdminLayout from './components/AdminLayout';

// Services for Loaders
import { dashboardService } from './services/dashboardService';
import { propertyService } from './services/propertyService';
import { adminService } from './services/adminService';

// Components
import ImpersonationBanner from './components/ImpersonationBanner';
import PWAPrompt from './components/PWAPrompt';

// Lazy Loaded Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Properties = lazy(() => import('./pages/Properties'));
const Tenants = lazy(() => import('./pages/Tenants'));
const Contracts = lazy(() => import('./pages/Contracts'));
const Financials = lazy(() => import('./pages/Financials'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const SSOCallback = lazy(() => import('./pages/SSOCallback'));
const OwnerMessages = lazy(() => import('./pages/OwnerMessages'));
const OwnerProfile = lazy(() => import('./pages/OwnerProfile'));
const Settings = lazy(() => import('./pages/Settings'));

// Tenant Pages
const TenantDashboard = lazy(() => import('./pages/tenant/TenantDashboard'));
const TenantMaintenance = lazy(() => import('./pages/tenant/TenantMaintenance'));
const TenantProfile = lazy(() => import('./pages/tenant/TenantProfile'));
const TenantPayments = lazy(() => import('./pages/tenant/TenantPayments'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SupportCenter = lazy(() => import('./pages/admin/SupportCenter'));
const SubscriptionManagement = lazy(() => import('./pages/admin/SubscriptionManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));
const ConversionReport = lazy(() => import('./pages/admin/ConversionReport'));
const AdminManager = lazy(() => import('./components/admin/AdminManager'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always refetch when navigating
      gcTime: 1000 * 60 * 5, // Keep in cache 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
  </div>
);

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRole: UserRole | UserRole[];
}> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  const role = user.role;

  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(role)
    : role === allowedRole;

  if (!isAllowed) {
    if (role === 'admin') return <Navigate to='/admin' replace />;
    return <Navigate to={role === 'owner' ? '/' : '/tenant'} replace />;
  }

  return children;
};

import GlobalErrorElement from './components/GlobalErrorElement';

// Root componente que envolve a aplicação com os provedores necessários
// Isso é necessário porque o AuthProvider usa useNavigate, que requer o contexto do Router
const Root = () => (
  <AuthProvider>
    <NotificationProvider>
      <ImpersonationBanner />
      <PWAPrompt />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </NotificationProvider>
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <GlobalErrorElement />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
      {
        path: '/sso-callback',
        element: <SSOCallback />,
      },
      // Owner Routes
      {
        path: '/',
        element: (
          <ProtectedRoute allowedRole='owner'>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          { 
            index: true, 
            element: <Dashboard />,
          },
          { 
            path: 'properties', 
            element: <Properties />,
          },
          { path: 'tenants', element: <Tenants /> },
          { path: 'messages', element: <OwnerMessages /> },
          { path: 'profile', element: <OwnerProfile /> },
          { path: 'contracts', element: <Contracts /> },
          { path: 'financials', element: <Financials /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
      // Tenant Routes
      {
        path: '/tenant',
        element: (
          <ProtectedRoute allowedRole='tenant'>
            <TenantLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <TenantDashboard /> },
          { path: 'payments', element: <TenantPayments /> },
          { path: 'maintenance', element: <TenantMaintenance /> },
          { path: 'profile', element: <TenantProfile /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
      // Admin Routes
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRole='admin'>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { 
            path: 'users', 
            element: <UserManagement />,
            loader: async () => {
              await queryClient.prefetchQuery({
                queryKey: ['users', 1, '', 'Todos', 'Todos', 'Todos', 'Todos'],
                queryFn: () => adminService.getUsers(1, 10, '', 'Todos', 'Todos', 'Todos', 'Todos'),
              });
              return null;
            }
          },
          { path: 'subscriptions', element: <SubscriptionManagement /> },
          { path: 'support', element: <SupportCenter /> },
          { path: 'announcements', element: <Announcements /> },
          { path: 'conversion', element: <ConversionReport /> },
          { path: 'team', element: <AdminManager /> },
          { path: 'settings', element: <SystemSettings /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to='/' replace />,
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;

