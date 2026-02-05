import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Disc3 } from 'lucide-react';
import { Album } from '../../types';

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  const primaryCover = album.covers?.find(c => c.isPrimary) || album.covers?.[0];
  const coverUrl = primaryCover?.presignedUrl || primaryCover?.url;

  return (
    <Link
      to={`/albums/${album.id}`}
      className="card-hover group p-4 rounded-lg transition-all duration-300"
    >
      {/* Album Cover */}
      <div className="relative mb-4">
        <div className="aspect-square rounded-md overflow-hidden bg-spotify-medium-gray shadow-lg">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-spotify-medium-gray to-spotify-light-gray">
              <Disc3 className="w-16 h-16 text-spotify-text-gray" />
            </div>
          )}
        </div>

        {/* Play Button */}
        <button
          className="play-button absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-spotify-green-dark transition-all"
          onClick={(e) => {
            e.preventDefault();
            // Play album
          }}
        >
          <Play className="w-5 h-5 text-black ml-0.5" />
        </button>
      </div>

      {/* Album Info */}
      <div className="min-w-0">
        <h3 className="font-bold text-white truncate mb-1 group-hover:underline">
          {album.title}
        </h3>
        <p className="text-sm text-spotify-text-gray truncate">
          {album.releaseYear} • {album.artists?.map(a => a.name).join(', ') || 'Artista desconhecido'}
        </p>
      </div>
    </Link>
  );
};
