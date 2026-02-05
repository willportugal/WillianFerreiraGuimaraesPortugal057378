import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ArtistCard } from '../components/cards/ArtistCard';
import { AlbumCard } from '../components/cards/AlbumCard';
import { artistService } from '../services/artistService';
import { albumService } from '../services/albumService';
import { Artist, Album } from '../types';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsRes, albumsRes] = await Promise.all([
          artistService.findAll(0, 6),
          albumService.findAll(0, 6),
        ]);
        setArtists(artistsRes.content);
        setAlbums(albumsRes.content);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-6">
          {getGreeting()}, {user?.fullName || user?.username}
        </h1>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.slice(0, 8).map((album) => {
            const cover = album.covers?.find(c => c.isPrimary) || album.covers?.[0];
            return (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                className="flex items-center bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-colors group"
              >
                <div className="w-16 h-16 bg-spotify-medium-gray flex-shrink-0">
                  {cover?.presignedUrl ? (
                    <img
                      src={cover.presignedUrl}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600" />
                  )}
                </div>
                <span className="px-4 font-bold text-white truncate">
                  {album.title}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Link to="/artists" className="group">
            <h2 className="text-2xl font-bold text-white hover:underline">
              Artistas Populares
            </h2>
          </Link>
          <Link
            to="/artists"
            className="text-sm font-bold text-spotify-text-gray hover:text-white transition-colors flex items-center gap-1"
          >
            Mostrar tudo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* Recent Albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Link to="/albums" className="group">
            <h2 className="text-2xl font-bold text-white hover:underline">
              Álbuns Recentes
            </h2>
          </Link>
          <Link
            to="/albums"
            className="text-sm font-bold text-spotify-text-gray hover:text-white transition-colors flex items-center gap-1"
          >
            Mostrar tudo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      {/* Made For You */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          Feito para você
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {/* Discover Weekly Card */}
          <div className="card-hover group p-4 rounded-lg">
            <div className="aspect-square rounded-md overflow-hidden mb-4 bg-gradient-to-br from-purple-700 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-sm font-medium text-white/80">Sua</p>
                <p className="text-2xl font-bold text-white">Descoberta</p>
                <p className="text-sm font-medium text-white/80">da Semana</p>
              </div>
            </div>
            <h3 className="font-bold text-white truncate mb-1">
              Descobertas da Semana
            </h3>
            <p className="text-sm text-spotify-text-gray line-clamp-2">
              Sua mixtape semanal de músicas novas
            </p>
          </div>

          {/* Daily Mix Cards */}
          {[1, 2, 3].map((num) => (
            <div key={num} className="card-hover group p-4 rounded-lg">
              <div className="aspect-square rounded-md overflow-hidden mb-4 bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-medium text-white/80">Daily Mix</p>
                  <p className="text-5xl font-bold text-white">{num}</p>
                </div>
              </div>
              <h3 className="font-bold text-white truncate mb-1">
                Daily Mix {num}
              </h3>
              <p className="text-sm text-spotify-text-gray line-clamp-2">
                {artists.slice(0, 3).map(a => a.name).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
