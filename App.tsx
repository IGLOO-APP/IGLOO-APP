import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import Layout from './components/Layout';
import TenantLayout from './components/TenantLayout';
import AdminLayout from './components/AdminLayout';

// Components
import ImpersonationBanner from './components/ImpersonationBanner';

// Lazy Loaded Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Properties = lazy(() => import('./pages/Properties'));
const Tenants = lazy(() => import('./pages/Tenants'));
const Contracts = lazy(() => import('./pages/Contracts'));
const Financials = lazy(() => import('./pages/Financials'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
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
const AdminManager = lazy(() => import('./components/admin/AdminManager'));

const queryClient = new QueryClient();

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

  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(user.role)
    : user.role === allowedRole;

  if (!isAllowed) {
    if (user.role === 'admin') return <Navigate to='/admin' replace />;
    return <Navigate to={user.role === 'owner' ? '/' : '/tenant'} replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <NotificationProvider>
            <ImpersonationBanner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<SignUp />} />
                {/* Rest of the routes */}
                <Route
                  path='/'
                  element={
                    <ProtectedRoute allowedRole='owner'>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path='properties' element={<Properties />} />
                  <Route path='tenants' element={<Tenants />} />
                  <Route path='messages' element={<OwnerMessages />} />
                  <Route path='profile' element={<OwnerProfile />} />
                  <Route path='contracts' element={<Contracts />} />
                  <Route path='financials' element={<Financials />} />
                  <Route path='settings' element={<Settings />} />
                </Route>
                {/* Tenant Routes */}
                <Route
                  path='/tenant'
                  element={
                    <ProtectedRoute allowedRole='tenant'>
                      <TenantLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<TenantDashboard />} />
                  <Route path='payments' element={<TenantPayments />} />
                  <Route path='maintenance' element={<TenantMaintenance />} />
                  <Route path='profile' element={<TenantProfile />} />
                </Route>
                {/* Admin Routes */}
                <Route
                  path='/admin'
                  element={
                    <ProtectedRoute allowedRole='admin'>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path='users' element={<UserManagement />} />
                  <Route path='subscriptions' element={<SubscriptionManagement />} />
                  <Route path='support' element={<SupportCenter />} />
                  <Route path='team' element={<AdminManager />} />
                  <Route path='settings' element={<SystemSettings />} />
                </Route>

                <Route path='*' element={<Navigate to='/' replace />} />
              </Routes>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  );
};

export default App;
