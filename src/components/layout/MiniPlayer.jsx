import { useContext, useState, useRef, useEffect } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import { XMarkIcon, PauseIcon, PlayIcon, ArrowsPointingOutIcon, SpeakerWaveIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';

const MiniPlayer = () => {
  // Use optional chaining to safely access context properties
  const context = useContext(PlayerContext);
  
  // Return null if context is not properly initialized
  if (!context) {
    console.error("MiniPlayer: PlayerContext is not available");
    return null;
  }
  
  const { 
    currentMedia, 
    isPlaying, 
    togglePlayPause, 
    stopMedia, 
    volume, 
    setPlayerVolume,
    getRecentMedia 
  } = context;
  
  // Safety check - don't render if no media
  if (!currentMedia) return null;
  
  const [isPipMode, setIsPipMode] = useState(false);
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showRecents, setShowRecents] = useState(false);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const pipRef = useRef(null);
  const navigate = useNavigate();

  // Setup HLS for TV playback in PIP mode
  useEffect(() => {
    if (currentMedia?.type === 'tv' && isPipMode && videoRef.current) {
      const setupHls = () => {
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          hlsRef.current = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60
          });

          hlsRef.current.attachMedia(videoRef.current);
          hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
            hlsRef.current.loadSource(currentMedia.streamUrl);
            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              if (isPlaying) {
                videoRef.current.play().catch(err => {
                  console.error('Error playing video in PIP:', err);
                });
              }
            });
          });

          hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hlsRef.current.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hlsRef.current.recoverMediaError();
              }
            }
          });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = currentMedia.streamUrl;
          videoRef.current.addEventListener('loadedmetadata', () => {
            if (isPlaying) {
              videoRef.current.play().catch(console.error);
            }
          });
        }
      };

      setupHls();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentMedia, isPipMode, isPlaying]);

  // Handle play state changes for PIP mode
  useEffect(() => {
    if (isPipMode && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isPipMode]);

  // Apply volume change from context
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Add cleanup when navigating to source page
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const handleStartDrag = (e) => {
    if (!pipRef.current) return;
    
    setIsDragging(true);
    const rect = pipRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    
    // Calculate new position while keeping the player within the viewport
    const newX = Math.max(0, Math.min(window.innerWidth - 240, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 160, e.clientY - dragOffset.y));
    
    setPipPosition({ x: newX, y: newY });
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleEndDrag);
      
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleEndDrag);
      };
    }
  }, [isDragging]);

  // Toggle Picture-in-Picture mode for TV
  const togglePipMode = () => {
    if (currentMedia.type === 'tv') {
      setIsPipMode(!isPipMode);
    }
  };

  const goToMediaPage = () => {
    navigate(`/${currentMedia.type}?id=${currentMedia.id}`);
    if (isPipMode) {
      setIsPipMode(false);
    }
  };

  const handleRecentClick = (media) => {
    if (media.type === 'radio') {
      navigate(`/radio?id=${media.id}`);
    } else {
      navigate(`/tv?id=${media.id}`);
    }
    setShowRecents(false);
  };

  // Render Picture-in-Picture TV Player
  if (currentMedia.type === 'tv' && isPipMode) {
    return (
      <div 
        ref={pipRef}
        style={{
          position: 'fixed',
          left: `${pipPosition.x}px`,
          top: `${pipPosition.y}px`,
          width: '240px',
          height: '160px',
          zIndex: 50
        }}
        className="rounded-lg overflow-hidden shadow-xl bg-black border border-gray-700"
      >
        <div 
          className="bg-gray-900/80 py-1.5 px-2 flex items-center justify-between cursor-move"
          onMouseDown={handleStartDrag}
        >
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1"></div>
            <span className="text-xs font-medium truncate max-w-[120px]">
              {currentMedia.name}
            </span>
          </div>
          <div className="flex items-center">
            <button 
              onClick={togglePlayPause}
              className="text-white p-1 hover:text-gray-300"
            >
              {isPlaying ? <PauseIcon className="h-3 w-3" /> : <PlayIcon className="h-3 w-3" />}
            </button>
            <button 
              onClick={togglePipMode}
              className="text-white p-1 hover:text-gray-300"
            >
              <ArrowsPointingOutIcon className="h-3 w-3" />
            </button>
            <button 
              onClick={stopMedia}
              className="text-white p-1 hover:text-gray-300"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
        <video 
          ref={videoRef}
          className="w-full h-[135px] bg-black cursor-pointer"
          onClick={goToMediaPage}
          playsInline
        />
      </div>
    );
  }

  // Render traditional Mini Player for Radio or non-PIP TV
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-3 shadow-lg z-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div 
          onClick={goToMediaPage}
          className="flex items-center flex-1 min-w-0 cursor-pointer"
        >
          <div className="h-10 w-10 bg-gray-700 rounded overflow-hidden flex-shrink-0 mr-3">
            <img 
              src={currentMedia.logo} 
              alt={currentMedia.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `/placeholder-${currentMedia.type}.svg`;
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate">{currentMedia.name}</h3>
            <p className="text-xs text-gray-400 truncate">
              {currentMedia.country} • {currentMedia.type === 'radio' ? 'Radio' : 'TV'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="hidden sm:flex items-center mr-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
              className="w-24 accent-pink-500"
            />
          </div>
        
          <button 
            onClick={() => setShowRecents(!showRecents)}
            className="rounded-full bg-gray-700 p-2 mr-2 hover:bg-gray-600 transition-colors relative"
            aria-label="Recent media"
          >
            <ClockIcon className="h-5 w-5" />
            {showRecents && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-700">
                <h4 className="text-sm font-semibold mb-2 px-2">Recent Media</h4>
                {getRecentMedia().map(media => (
                  <button
                    key={media.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecentClick(media);
                    }}
                    className="flex items-center p-2 w-full text-left hover:bg-gray-700 rounded-md"
                  >
                    <div className="w-8 h-8 mr-2 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={media.logo} 
                        alt={media.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `/placeholder-${media.type}.svg`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{media.name}</p>
                      <p className="text-xs text-gray-400 truncate">{media.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </button>

          <button 
            onClick={togglePlayPause}
            className="rounded-full bg-pink-600 p-2 mr-2 hover:bg-pink-700 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? 
              <PauseIcon className="h-5 w-5" /> : 
              <PlayIcon className="h-5 w-5" />
            }
          </button>
          
          {currentMedia.type === 'tv' && (
            <button 
              onClick={togglePipMode}
              className="rounded-full bg-gray-700 p-2 mr-2 hover:bg-gray-600 transition-colors"
              aria-label="Picture in Picture"
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>
          )}
          
          <button 
            onClick={stopMedia}
            className="rounded-full bg-gray-700 p-2 hover:bg-gray-600 transition-colors"
            aria-label="Close player"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer; 