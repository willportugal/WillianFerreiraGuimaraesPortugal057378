import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AlbumNotification } from '../types';
import { websocketService } from '../services/websocketService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AlbumNotification[];
  latestNotification: AlbumNotification | null;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AlbumNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<AlbumNotification | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Conectar ao WebSocket quando autenticado
      websocketService.connect();

      // Registrar callback para notificações
      const unsubscribe = websocketService.onNotification((notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Manter últimas 50
        setLatestNotification(notification);
      });

      // Verificar conexão periodicamente
      const interval = setInterval(() => {
        setIsConnected(websocketService.isConnected());
      }, 1000);

      return () => {
        unsubscribe();
        clearInterval(interval);
        websocketService.disconnect();
      };
    }
  }, [isAuthenticated]);

  const clearNotifications = () => {
    setNotifications([]);
    setLatestNotification(null);
  };

  const value: NotificationContextType = {
    notifications,
    latestNotification,
    clearNotifications,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};
