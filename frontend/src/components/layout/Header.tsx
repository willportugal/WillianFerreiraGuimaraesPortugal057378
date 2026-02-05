import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bell, 
  User,
  LogOut,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface HeaderProps {
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, isConnected } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isSearchPage = location.pathname === '/search';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header 
      className={`sticky top-0 z-40 px-8 py-4 flex items-center justify-between gap-4 transition-colors duration-300 ${
        transparent ? 'bg-transparent' : 'bg-spotify-dark-gray/95 backdrop-blur-sm'
      }`}
    >
      {/* Navigation Arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
          aria-label="Avançar"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Search Bar - Only on search page or always visible */}
        {isSearchPage && (
          <form onSubmit={handleSearch} className="ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-text-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você quer ouvir?"
                className="w-80 pl-10 pr-4 py-3 bg-white rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </form>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-spotify-green' : 'bg-red-500'
            }`}
            title={isConnected ? 'Conectado' : 'Desconectado'}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors relative"
          >
            <Bell className="w-4 h-4 text-white" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-spotify-green text-black text-xs font-bold rounded-full flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-spotify-light-gray rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 border-b border-spotify-medium-gray">
                <h3 className="font-bold text-white">Notificações</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-spotify-text-gray text-center">
                    Nenhuma notificação
                  </p>
                ) : (
                  notifications.slice(0, 10).map((notification, index) => (
                    <div
                      key={index}
                      className="p-4 border-b border-spotify-medium-gray/50 hover:bg-spotify-medium-gray/30 transition-colors"
                    >
                      <p className="text-sm text-white">{notification.message}</p>
                      <p className="text-xs text-spotify-text-gray mt-1">
                        {new Date(notification.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-black/70 hover:bg-black/90 rounded-full p-1 pr-3 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-spotify-medium-gray flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">
              {user?.username || 'Usuário'}
            </span>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-spotify-light-gray rounded-md shadow-xl overflow-hidden">
              <div className="p-2">
                <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-spotify-text-gray hover:text-white hover:bg-spotify-medium-gray/50 rounded transition-colors">
                  <span>Conta</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm text-spotify-text-gray hover:text-white hover:bg-spotify-medium-gray/50 rounded transition-colors">
                  Perfil
                </button>
                <Link
                  to="/settings"
                  className="w-full flex items-center px-3 py-2 text-sm text-spotify-text-gray hover:text-white hover:bg-spotify-medium-gray/50 rounded transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Link>
              </div>
              <div className="border-t border-spotify-medium-gray p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-spotify-text-gray hover:text-white hover:bg-spotify-medium-gray/50 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Fix: Add Link import
import { Link } from 'react-router-dom';
