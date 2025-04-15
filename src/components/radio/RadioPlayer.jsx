import { useState, useEffect, useRef, useContext } from 'react';
import Hls from 'hls.js';
import { HeartIcon, SpeakerWaveIcon, ShareIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { addFavoriteStation, removeFavoriteStation, isStationFavorite } from '../../services/favoritesService';
import { PlayerContext } from '../../contexts/PlayerContext';

const RadioPlayer = ({ station }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [metadata, setMetadata] = useState({ title: '', artist: '' });
  const [waveformValues, setWaveformValues] = useState(Array(20).fill(0.1));
  const animationRef = useRef();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hlsRef = useRef(null);
  
  // Use PlayerContext for audio functionality
  const { currentMedia, isPlaying, playRadio, togglePlay: contextTogglePlay } = useContext(PlayerContext);

  // Function to determine if URL is an HLS stream
  const isHlsStream = (url) => {
    return url && (url.endsWith('.m3u8') || url.includes('m3u8'));
  };

  // Handle station change
  useEffect(() => {
    if (!station) return;
    
    // Check if this station is in favorites
    setIsFavorite(isStationFavorite(station.id));
    
    // Reset error state
    setError(null);
    
    // Only play the station if it's not already the current media
    if (!currentMedia || currentMedia.type !== 'radio' || currentMedia.id !== station.id) {
      setIsLoading(true);
      // Play the station using context
      playRadio(station);
      setIsLoading(false);
    }
    
    // Reset metadata for new station
    setMetadata({ 
      title: 'Now Playing', 
      artist: station.name 
    });
  }, [station, currentMedia]); // Include currentMedia in dependencies

  // Update state when current media changes
  useEffect(() => {
    if (currentMedia?.type === 'radio' && station && currentMedia.id === station.id) {
      // Update UI to reflect current playing state
      setMetadata({ 
        title: 'Now Playing', 
        artist: station.name 
      });
    }
  }, [currentMedia, station]);

  // Simulate waveform animation when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const animateWaveform = () => {
      setWaveformValues(prev => 
        prev.map(() => Math.random() * 0.8 + 0.2)
      );
      animationRef.current = requestAnimationFrame(animateWaveform);
    };
    
    animationRef.current = requestAnimationFrame(animateWaveform);
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!station) return;
    contextTogglePlay();
  };

  const retryPlayback = () => {
    if (!station) return;
    
    // Reset error state
    setError(null);
    setIsLoading(true);
    
    // Replay using context
    playRadio(station);
    
    setIsLoading(false);
  };

  const toggleFavorite = () => {
    if (!station) return;
    
    if (isFavorite) {
      removeFavoriteStation(station.id);
    } else {
      addFavoriteStation(station);
    }
    setIsFavorite(!isFavorite);
  };

  const shareStation = () => {
    if (!station) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Listen to ${station.name} on TUNER`,
        text: `Check out ${station.name} on TUNER, a free radio streaming platform.`,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-xl">
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-200">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span>{error}</span>
            <button 
              onClick={retryPlayback}
              className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Trying...' : 'Retry'}
            </button>
          </div>
        </div>
      )}
      
      {station ? (
        <>
          <div className="flex items-center space-x-4">
            <img
              src={station.logo || '/placeholder-radio.svg'}
              alt={station.name}
              className="w-16 h-16 rounded-lg object-contain bg-gray-700"
              onError={(e) => {
                console.log('Image failed to load:', e.target.src);
                e.target.onerror = null; // Prevent infinite error loops
                e.target.src = '/placeholder-radio.svg';
              }}
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{station.name}</h2>
              <p className="text-gray-400">{station.genre} • {station.country}</p>
              <p className="text-sm text-gray-500 mt-1">
                {station.bitrate && `${station.bitrate} kbps`} 
                {station.codec && station.bitrate && ' • '} 
                {station.codec}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <p className="truncate">{metadata.title}</p>
                <p className="truncate">{metadata.artist}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleFavorite}
                  className="text-gray-400 hover:text-white focus:outline-none p-2"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-pink-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>

                <button 
                  onClick={shareStation}
                  className="text-gray-400 hover:text-white focus:outline-none p-2"
                  aria-label="Share station"
                >
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-6">
            <div className="flex justify-center items-center space-x-1 h-16 mb-2">
              {waveformValues.map((value, index) => (
                <div
                  key={index}
                  className={`w-1 ${isPlaying ? 'bg-pink-500' : 'bg-gray-600'} rounded-t`}
                  style={{ height: `${Math.max(4, value * 100)}%` }}
                ></div>
              ))}
            </div>

            <button 
              onClick={togglePlay}
              className={`flex items-center justify-center h-16 w-16 rounded-full focus:outline-none transition-colors mb-4
                ${isPlaying ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-7 h-7 border-4 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <PauseIcon className="h-8 w-8 text-white" />
              ) : (
                <PlayIcon className="h-8 w-8 text-white" />
              )}
            </button>

            <div className="w-full flex items-center space-x-4 px-2">
              <SpeakerWaveIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setVolume(value);
                }}
                className="w-full accent-pink-500 h-2"
                aria-label="Volume"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Select a Station</h2>
          <p className="text-gray-400">Choose a radio station to start listening</p>
        </div>
      )}
    </div>
  );
};

export default RadioPlayer;