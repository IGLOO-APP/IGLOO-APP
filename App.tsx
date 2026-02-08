
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import TenantLayout from './components/TenantLayout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import Financials from './pages/Financials';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OwnerMessages from './pages/OwnerMessages';
import Settings from './pages/Settings';
import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantMaintenance from './pages/tenant/TenantMaintenance';
import TenantProfile from './pages/tenant/TenantProfile';
import TenantPayments from './pages/tenant/TenantPayments';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SupportCenter from './pages/admin/SupportCenter';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import SystemSettings from './pages/admin/SystemSettings';
import AdminManager from './components/admin/AdminManager';
import ImpersonationBanner from './components/ImpersonationBanner';

const ProtectedRoute: React.FC<{ children: React.ReactElement, allowedRole: UserRole | UserRole[] }> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(user.role)
    : user.role === allowedRole;

  if (!isAllowed) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to={user.role === 'owner' ? '/' : '/tenant'} replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <NotificationProvider>
          <ImpersonationBanner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Owner Routes */}
            <Route path="/" element={
              <ProtectedRoute allowedRole="owner">
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="messages" element={<OwnerMessages />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="financials" element={<Financials />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Tenant Routes */}
            <Route path="/tenant" element={
              <ProtectedRoute allowedRole="tenant">
                <TenantLayout />
              </ProtectedRoute>
            }>
              <Route index element={<TenantDashboard />} />
              <Route path="payments" element={<TenantPayments />} />
              <Route path="maintenance" element={<TenantMaintenance />} />
              <Route path="profile" element={<TenantProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="subscriptions" element={<SubscriptionManagement />} />
              <Route path="support" element={<SupportCenter />} />
              <Route path="team" element={<AdminManager />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
