import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Library, 
  PlusSquare, 
  Heart, 
  Music2, 
  Users, 
  Disc3,
  Settings,
  Download
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/search', label: 'Buscar', icon: Search },
    { to: '/library', label: 'Sua Biblioteca', icon: Library },
  ];

  const libraryItems: NavItem[] = [
    { to: '/artists', label: 'Artistas', icon: Users },
    { to: '/albums', label: 'Álbuns', icon: Disc3 },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-black h-full flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <Music2 className="w-10 h-10 text-white" />
          <span className="text-2xl font-bold text-white">Soundify</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-2">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`sidebar-link flex items-center gap-4 px-4 py-3 rounded-md font-semibold transition-colors ${
                  isActive(item.to)
                    ? 'active text-white'
                    : 'text-spotify-text-gray hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 border-t border-spotify-light-gray" />

      {/* Library Section */}
      <div className="px-2 flex-1 overflow-y-auto">
        <div className="px-4 mb-4">
          <h3 className="text-xs font-bold text-spotify-text-gray uppercase tracking-wider">
            Sua Biblioteca
          </h3>
        </div>
        
        {/* Create Playlist */}
        <button className="w-full flex items-center gap-4 px-4 py-3 text-spotify-text-gray hover:text-white transition-colors rounded-md hover:bg-spotify-light-gray">
          <div className="w-6 h-6 bg-spotify-text-gray rounded-sm flex items-center justify-center">
            <PlusSquare className="w-4 h-4 text-black" />
          </div>
          <span className="font-semibold">Criar playlist</span>
        </button>

        {/* Liked Songs */}
        <Link
          to="/liked"
          className="w-full flex items-center gap-4 px-4 py-3 text-spotify-text-gray hover:text-white transition-colors rounded-md hover:bg-spotify-light-gray"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-800 to-spotify-text-gray rounded-sm flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold">Músicas Curtidas</span>
        </Link>

        {/* Divider */}
        <div className="mx-4 my-4 border-t border-spotify-light-gray" />

        {/* Library Items */}
        <ul className="space-y-1">
          {libraryItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`sidebar-link flex items-center gap-4 px-4 py-2 rounded-md transition-colors ${
                  isActive(item.to)
                    ? 'active text-white'
                    : 'text-spotify-text-gray hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-spotify-light-gray">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-2 text-spotify-text-gray hover:text-white transition-colors rounded-md"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Configurações</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-spotify-text-gray hover:text-white transition-colors rounded-md">
          <Download className="w-5 h-5" />
          <span className="text-sm font-medium">Instalar App</span>
        </button>
      </div>
    </aside>
  );
};
