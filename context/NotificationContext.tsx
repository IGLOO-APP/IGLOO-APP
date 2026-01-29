
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { supabase } from '../lib/supabase';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';
import { Database } from '../lib/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  triggerTestNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load initial notifications
  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const data = await notificationService.getNotifications(user.id as string);
    setNotifications(data);
    setLoading(false);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    // Check if real supabase is configured
    const env = (import.meta as any).env || {};
    const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');
    if (isMock) return;

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add to list
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show Toast
          addToast(newNotification.title, newNotification.message, 'system');
          
          // Optional: Play sound
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {}); // Ignore autoplay errors
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await notificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await notificationService.markAllAsRead(user.id as string);
  };

  const triggerTestNotification = () => {
      // Mock feature for demo purposes
      const titles = ["Novo Pagamento", "Solicitação de Manutenção", "Contrato Assinado"];
      const messages = ["Você recebeu R$ 1.500,00", "A torneira da cozinha está vazando", "O inquilino assinou o contrato"];
      const random = Math.floor(Math.random() * titles.length);
      
      const mockNotif: Notification = {
          id: Date.now().toString(),
          user_id: user?.id || 'uid',
          title: titles[random],
          message: messages[random],
          type: 'system',
          is_read: false,
          created_at: new Date().toISOString(),
          link: null
      };

      setNotifications(prev => [mockNotif, ...prev]);
      addToast(mockNotif.title, mockNotif.message, 'system');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        addToast,
        triggerTestNotification
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
