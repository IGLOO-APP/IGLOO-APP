import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth as useClerkAuth, useSession } from '@clerk/clerk-react';
import { profileService } from '../services/profileService';
import { setSupabaseToken } from '../lib/supabase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  impersonatingFrom?: User | null;
  startImpersonation: (targetUser: User) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const { session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [impersonatingFrom, setImpersonatingFrom] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Ponte de Segurança Clerk -> Supabase
  useEffect(() => {
    const updateSupabaseToken = async () => {
      if (session) {
        try {
          const token = await session.getToken({ template: 'supabase' });
          setSupabaseToken(token);
        } catch (error) {
          console.error('Erro ao obter token do Supabase via Clerk:', error);
          setSupabaseToken(null);
        }
      } else {
        setSupabaseToken(null);
      }
    };

    if (isLoaded) {
      updateSupabaseToken();
    }
  }, [session, isLoaded]);

  // Inicializa o estado de impersonação a partir do sessionStorage
  useEffect(() => {
    const savedTarget = sessionStorage.getItem('igloo_impersonated_user');
    const savedAdmin = sessionStorage.getItem('igloo_admin_user');
    
    if (savedTarget && savedAdmin) {
      setUser(JSON.parse(savedTarget));
      setImpersonatingFrom(JSON.parse(savedAdmin));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isImpersonating = !!sessionStorage.getItem('igloo_impersonated_user');
    
    // Só carrega do Clerk se NÃO estivermos no modo de impersonação salvo
    if (isLoaded && !isImpersonating) {
      if (clerkUser) {
        loadUserProfile(clerkUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    } else if (isLoaded && isImpersonating) {
      // Se estamos impersonando, já definimos o user no useEffect acima
      setLoading(false);
    }
  }, [clerkUser, isLoaded]);

  const loadUserProfile = async (clerkUser: any) => {
    try {
      const profile = await profileService.ensureProfile({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        user_metadata: {
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          avatar_url: clerkUser.imageUrl,
        },
      });

      if (profile) {
        const userData: User = {
          id: profile.id,
          name: profile.name || '',
          email: profile.email,
          // Role priority: Supabase profile (set by owner) > Clerk metadata > fallback
          // Safety: If it has admin_type, it MUST be an admin role
          role: ((profile as any).admin_type ? 'admin' : (profile.role as UserRole)) || (clerkUser.publicMetadata.role as UserRole) || 'owner',
          admin_type: (profile as any).admin_type,
          permissions: (profile as any).permissions,
          is_suspended: (profile as any).is_suspended,
          avatar: clerkUser.imageUrl || (profile as any).avatar_url,
          property_id: (profile as any).property_id,
        } as User;
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile from Supabase:', error);
      
      // FALLBACK: Se o Supabase falhar, usamos os dados do Clerk para não travar o usuário
      if (clerkUser) {
        setUser({
          id: clerkUser.id,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuário Igloo',
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          role: (clerkUser.publicMetadata.role as UserRole) || 'owner',
          avatar: clerkUser.imageUrl,
        } as User);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const startImpersonation = (targetUser: User) => {
    // Salva no sessionStorage para persistir no reload
    sessionStorage.setItem('igloo_impersonated_user', JSON.stringify(targetUser));
    sessionStorage.setItem('igloo_admin_user', JSON.stringify(user));
    
    setImpersonatingFrom(user);
    setUser(targetUser);
    
    // Redireciona via hard reload para limpar estados globais e caches
    if (targetUser.role === 'tenant') {
      window.location.href = '/tenant';
    } else {
      window.location.href = '/';
    }
  };

  const stopImpersonation = () => {
    const admin = sessionStorage.getItem('igloo_admin_user');
    sessionStorage.removeItem('igloo_impersonated_user');
    sessionStorage.removeItem('igloo_admin_user');
    
    if (admin) {
      const adminData = JSON.parse(admin);
      setUser(adminData);
      setImpersonatingFrom(null);
      window.location.href = '/admin/users';
    }
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem('igloo_impersonated_user');
      sessionStorage.removeItem('igloo_admin_user');
      await signOut();
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: !isLoaded || loading,
        signIn: async () => navigate('/login'),
        signUp: async () => navigate('/signup'),
        logout,
        isAuthenticated: !!user,
        impersonatingFrom,
        startImpersonation,
        stopImpersonation,
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
