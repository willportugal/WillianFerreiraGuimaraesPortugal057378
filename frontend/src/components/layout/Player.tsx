import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle,
  Volume2,
  VolumeX,
  Maximize2,
  ListMusic,
  Mic2,
  MonitorSpeaker,
  Heart
} from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  coverUrl?: string;
  duration: number;
}

interface PlayerProps {
  currentTrack?: Track;
}

export const Player: React.FC<PlayerProps> = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const demoTrack: Track = currentTrack || {
    id: 1,
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    album: 'Appetite for Destruction',
    duration: 356,
  };

  const currentTime = (progress / 100) * demoTrack.duration;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-spotify-light-gray border-t border-spotify-medium-gray px-4 flex items-center justify-between z-50">
      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[180px]">
        {/* Album Cover */}
        <div className="w-14 h-14 bg-spotify-medium-gray rounded flex-shrink-0 overflow-hidden">
          {demoTrack.coverUrl ? (
            <img 
              src={demoTrack.coverUrl} 
              alt={demoTrack.album}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ListMusic className="w-6 h-6 text-spotify-text-gray" />
            </div>
          )}
        </div>

        {/* Track Details */}
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
            {demoTrack.title}
          </h4>
          <p className="text-xs text-spotify-text-gray truncate hover:underline cursor-pointer hover:text-white">
            {demoTrack.artist}
          </p>
        </div>

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="flex-shrink-0 text-spotify-text-gray hover:text-white transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-spotify-green text-spotify-green' : ''}`} 
          />
        </button>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col items-center gap-2 w-2/4 max-w-[722px]">
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`text-spotify-text-gray hover:text-white transition-colors ${
              isShuffled ? 'text-spotify-green' : ''
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button className="text-spotify-text-gray hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black" />
            ) : (
              <Play className="w-5 h-5 text-black ml-0.5" />
            )}
          </button>

          <button className="text-spotify-text-gray hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
              const currentIndex = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIndex + 1) % 3]);
            }}
            className={`text-spotify-text-gray hover:text-white transition-colors relative ${
              repeatMode !== 'off' ? 'text-spotify-green' : ''
            }`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold text-spotify-green">
                1
              </span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-spotify-text-gray w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 group">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-1 bg-spotify-medium-gray rounded-full appearance-none cursor-pointer group-hover:h-1.5 transition-all"
              style={{
                background: `linear-gradient(to right, ${
                  'var(--spotify-green, #1DB954)'
                } ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
              }}
            />
          </div>
          <span className="text-xs text-spotify-text-gray w-10">
            {formatTime(demoTrack.duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        <button className="text-spotify-text-gray hover:text-white transition-colors">
          <Mic2 className="w-4 h-4" />
        </button>

        <button className="text-spotify-text-gray hover:text-white transition-colors">
          <ListMusic className="w-4 h-4" />
        </button>

        <button className="text-spotify-text-gray hover:text-white transition-colors">
          <MonitorSpeaker className="w-4 h-4" />
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-spotify-text-gray hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 h-1 bg-spotify-medium-gray rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white ${
                isMuted ? 0 : volume
              }%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume}%)`,
            }}
          />
        </div>

        <button className="text-spotify-text-gray hover:text-white transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
