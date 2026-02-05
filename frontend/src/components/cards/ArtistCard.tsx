import React from 'react';
import { Link } from 'react-router-dom';
import { Play, User } from 'lucide-react';
import { Artist } from '../../types';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link
      to={`/artists/${artist.id}`}
      className="card-hover group p-4 rounded-lg transition-all duration-300"
    >
      {/* Artist Image */}
      <div className="relative mb-4">
        <div className="aspect-square rounded-full overflow-hidden bg-spotify-medium-gray shadow-lg">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-spotify-medium-gray to-spotify-light-gray">
              <User className="w-16 h-16 text-spotify-text-gray" />
            </div>
          )}
        </div>

        {/* Play Button */}
        <button
          className="play-button absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-spotify-green-dark transition-all"
          onClick={(e) => {
            e.preventDefault();
            // Play artist's top tracks
          }}
        >
          <Play className="w-5 h-5 text-black ml-0.5" />
        </button>
      </div>

      {/* Artist Info */}
      <div className="min-w-0">
        <h3 className="font-bold text-white truncate mb-1 group-hover:underline">
          {artist.name}
        </h3>
        <p className="text-sm text-spotify-text-gray truncate">
          Artista
        </p>
      </div>
    </Link>
  );
};
