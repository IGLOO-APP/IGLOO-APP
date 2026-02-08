import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  impersonatingFrom?: User | null;
  startImpersonation: (targetUser: User) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatingFrom, setImpersonatingFrom] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const startImpersonation = (targetUser: User) => {
    setImpersonatingFrom(user);
    setUser(targetUser);
    // Use window.location as navigate might not be available at this level if not wrapped correctly
    window.location.hash = '#/';
  };

  const stopImpersonation = () => {
    if (impersonatingFrom) {
      setUser(impersonatingFrom);
      setImpersonatingFrom(null);
      window.location.hash = '#/admin/users';
    }
  };

  useEffect(() => {
    checkSession();

    // Check if real supabase is available before subscribing
    const env = (import.meta as any).env || {};
    const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');

    let subscription: { unsubscribe: () => void } = { unsubscribe: () => { } };

    if (!isMock) {
      const { data } = authService.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      subscription = data.subscription;
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await profileService.getById(userId);
      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name || '',
          email: profile.email,
          role: profile.role as UserRole,
          admin_type: (profile as any).admin_type,
          permissions: (profile as any).permissions,
          is_suspended: (profile as any).is_suspended,
          avatar: (profile as any).avatar_url || undefined,
        } as User);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authService.signIn(email, password);
      // For mock mode, we need to manually trigger profile load
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const data = await authService.signUp({ email, password, name, role } as any);
      // For mock mode, we need to manually trigger profile load
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        logout,
        isAuthenticated: !!user,
        impersonatingFrom,
        startImpersonation,
        stopImpersonation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};