import { useState, useEffect, useRef, useContext } from 'react';
import Hls from 'hls.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, SpeakerWaveIcon, ShareIcon, PlayIcon, PauseIcon,
  ArrowsPointingOutIcon, ArrowsPointingInIcon, XMarkIcon, ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { PlayerContext } from '../../contexts/PlayerContext';
import { addFavoriteStation, removeFavoriteStation, isStationFavorite } from '../../services/favoritesService';
import { addFavoriteChannel, removeFavoriteChannel, isChannelFavorite } from '../../services/favoritesService';

const UnifiedPlayer = () => {
  // Get the current route and media info
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Get player context
  const context = useContext(PlayerContext);
  if (!context) return null;
  
  const { 
    currentMedia, 
    isPlaying,
    setIsPlaying: updatePlayingState, 
    togglePlayPause, 
    stopMedia,
    playRadio,
    playTv, 
    volume, 
    setPlayerVolume,
    getRecentMedia 
  } = context;
  
  // If no media is playing, don't render anything
  if (!currentMedia) return null;
  
  // States for player functionality
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showRecents, setShowRecents] = useState(false);
  const [metadata, setMetadata] = useState({ title: 'Now Playing', artist: '' });
  const [waveformValues, setWaveformValues] = useState(Array(20).fill(0.1));
  const [showControls, setShowControls] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [volumeChangeInProgress, setVolumeChangeInProgress] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const pipRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const playbackTimeoutRef = useRef(null);
  
  // Determine if we should show the main player or mini player
  const isMainView = (currentMedia.type === 'radio' && currentPath === '/radio') || 
                    (currentMedia.type === 'tv' && currentPath === '/tv');
  
  // Initialize player state
  useEffect(() => {
    if (!currentMedia) return;
    
    // Set favorite status
    if (currentMedia.type === 'radio') {
      setIsFavorite(isStationFavorite(currentMedia.id));
      setMetadata({ 
        title: 'Now Playing', 
        artist: currentMedia.name 
      });
    } else if (currentMedia.type === 'tv') {
      setIsFavorite(isChannelFavorite(currentMedia.id));
    }
    
    // If we're in PIP mode and navigate to TV page, exit PIP mode
    if (isPipMode && currentMedia.type === 'tv' && currentPath === '/tv') {
      setIsPipMode(false);
    }
  }, [currentMedia, currentPath]);
  
  // HLS TV setup
  useEffect(() => {
    if (currentMedia?.type === 'tv' && videoRef.current) {
      const setupHls = () => {
        setIsVideoLoading(true);
        
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          hlsRef.current = new Hls({
            maxBufferLength: 120,
            maxMaxBufferLength: 240,
            maxBufferSize: 120 * 1000 * 1000,
            maxBufferHole: 0.5,
            highBufferWatchdogPeriod: 3,
            lowLatencyMode: false,
            stallDetectionMode: 2,
            testBandwidth: true
          });

          hlsRef.current.attachMedia(videoRef.current);
          hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
            hlsRef.current.loadSource(currentMedia.streamUrl);
            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsVideoLoading(false);
              
              // Clear any existing timeout
              if (playbackTimeoutRef.current) {
                clearTimeout(playbackTimeoutRef.current);
              }
              
              // Only attempt playback if isPlaying is true and after a short delay
              if (isPlaying) {
                playbackTimeoutRef.current = setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(err => {
                      console.error('Error playing video:', err);
                    });
                  }
                }, 500); // 500ms delay to avoid AbortError
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
          
          // Clear any existing timeout
          if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
          }
          
          if (isPlaying) {
            playbackTimeoutRef.current = setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(console.error);
              }
            }, 500); // 500ms delay to avoid AbortError
          }
        }
      };

      setupHls();
      
      // Register video element with player context if on TV page
      if (currentPath === '/tv') {
        playTv(currentMedia, videoRef.current);
      }
    }

    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentMedia, isPlaying, currentPath]);

  // Radio waveform animation
  useEffect(() => {
    if (currentMedia?.type === 'radio' && isPlaying) {
      const animateWaveform = () => {
        setWaveformValues(prev => 
          prev.map(() => Math.random() * 0.8 + 0.2)
        );
        animationRef.current = requestAnimationFrame(animateWaveform);
      };
      
      animationRef.current = requestAnimationFrame(animateWaveform);
      
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [currentMedia, isPlaying]);

  // Handle play state changes
  useEffect(() => {
    if (currentMedia?.type === 'tv' && videoRef.current) {
      if (isPlaying) {
        // Clear any existing timeout
        if (playbackTimeoutRef.current) {
          clearTimeout(playbackTimeoutRef.current);
        }
        
        playbackTimeoutRef.current = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        }, 500); // 500ms delay to avoid AbortError
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentMedia]);

  // Apply volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);
  
  // PIP mode dragging
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
  
  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying || !showControls || !isMainView) return;
    
    const hideControls = () => setShowControls(false);
    
    controlsTimerRef.current = setTimeout(hideControls, 3000);
    
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls, isPlaying, isMainView]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Setup MediaSession API for mobile background playback
  useEffect(() => {
    if ('mediaSession' in navigator && currentMedia) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentMedia.name,
        artist: currentMedia.type === 'radio' ? 'Internet Radio' : 'Live TV',
        album: 'Tuner App',
        artwork: [
          { src: currentMedia.logo || '/tuner-logo.svg', sizes: '512x512', type: 'image/png' },
        ]
      });

      // Set up media session action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlayPause();
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlayPause();
      });
      
      navigator.mediaSession.setActionHandler('stop', () => {
        stopMedia();
      });

      // Update playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }

    // Request wake lock to prevent screen from turning off
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isPlaying) {
        try {
          const wakeLock = await navigator.wakeLock.request('screen');
          return wakeLock;
        } catch (err) {
          console.error('Wake Lock error:', err);
        }
      }
      return null;
    };

    let wakeLockObj = null;
    if (isPlaying) {
      requestWakeLock().then(lock => {
        wakeLockObj = lock;
      });
    }

    return () => {
      if (wakeLockObj) {
        wakeLockObj.release().catch(err => {
          console.error('Error releasing wake lock:', err);
        });
      }
    };
  }, [currentMedia, isPlaying, togglePlayPause, stopMedia]);

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

  const toggleFavorite = () => {
    if (!currentMedia) return;
    
    if (currentMedia.type === 'radio') {
      if (isFavorite) {
        removeFavoriteStation(currentMedia.id);
      } else {
        addFavoriteStation(currentMedia);
      }
    } else if (currentMedia.type === 'tv') {
      if (isFavorite) {
        removeFavoriteChannel(currentMedia.id);
      } else {
        addFavoriteChannel(currentMedia);
      }
    }
    
    setIsFavorite(!isFavorite);
  };

  const handleShareClick = () => {
    if (!currentMedia) return;
    
    const shareTitle = currentMedia.type === 'radio' 
      ? `Listen to ${currentMedia.name} on TUNER`
      : `Watch ${currentMedia.name} on TUNER`;
      
    const shareText = `Check out ${currentMedia.name} on TUNER, a free streaming platform.`;
    
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  const goToMediaPage = () => {
    navigate(`/${currentMedia.type}?id=${currentMedia.id}`);
    if (isPipMode) {
      setIsPipMode(false);
    }
  };

  const togglePipMode = () => {
    if (currentMedia.type === 'tv') {
      setIsPipMode(!isPipMode);
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

  const handleMouseMove = () => {
    if (isPlaying && isMainView && currentMedia.type === 'tv') {
      setShowControls(true);
    }
  };
  
  const handleVideoClick = () => {
    if (!currentMedia || currentMedia.type !== 'tv') return;
    
    if (showControls) {
      togglePlayPause();
    } else {
      setShowControls(true);
    }
  };
  
  // Handle playback state changes from video element
  const handleVideoPlay = () => {
    if (updatePlayingState && !isPlaying) {
      updatePlayingState(true);
    }
  };
  
  const handleVideoPause = () => {
    if (updatePlayingState && isPlaying) {
      updatePlayingState(false);
    }
  };
  
  // Add this enhanced volume control handler function before the handleStartDrag function
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    
    // Mark that volume change is in progress
    setVolumeChangeInProgress(true);
    
    // Set volume with short debounce to avoid too many state updates
    setPlayerVolume(newVolume);
    
    // Clear the in-progress flag after a short delay
    setTimeout(() => {
      setVolumeChangeInProgress(false);
    }, 200);
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
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          playsInline
        />
      </div>
    );
  }
  
  // If we're on the main view, render the appropriate player
  if (isMainView) {
    if (currentMedia.type === 'radio') {
      // Main Radio Player View
      return (
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-xl">
          <div className="flex items-center space-x-4">
            <img
              src={currentMedia.logo || '/placeholder-radio.svg'}
              alt={currentMedia.name}
              className="w-16 h-16 rounded-lg object-contain bg-gray-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-radio.svg';
              }}
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{currentMedia.name}</h2>
              <p className="text-gray-400">{currentMedia.genre} • {currentMedia.country}</p>
              <p className="text-sm text-gray-500 mt-1">
                {currentMedia.bitrate && `${currentMedia.bitrate} kbps`} 
                {currentMedia.codec && currentMedia.bitrate && ' • '} 
                {currentMedia.codec}
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
                  onClick={handleShareClick}
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
              onClick={togglePlayPause}
              className={`flex items-center justify-center h-16 w-16 rounded-full focus:outline-none transition-colors mb-4
                ${isPlaying ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'}`}
            >
              {isPlaying ? (
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
                onChange={handleVolumeChange}
                className="w-full accent-pink-500 h-2"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      );
    } else if (currentMedia.type === 'tv') {
      // Main TV Player View
      return (
        <div
          className="relative bg-black rounded-lg overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          <div 
            className="relative group" 
            onClick={handleVideoClick}
          >
            <video
              ref={videoRef}
              className="w-full aspect-video cursor-pointer"
              poster={currentMedia.logo || '/placeholder-tv.svg'}
              playsInline
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            />
            
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              </div>
            )}

            {showControls && (
              <div 
                className="absolute inset-0 flex flex-col justify-between p-2 sm:p-4 bg-gradient-to-b from-black/60 via-transparent to-black/80 transition-opacity duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  {/* Channel Info */}
                  <div className="flex items-center space-x-2">
                    <img 
                      src={currentMedia.logo || '/placeholder-tv.svg'} 
                      alt={currentMedia.name}
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-gray-800 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-tv.svg';
                      }}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                      <h3 className="text-white font-semibold text-sm sm:text-base truncate max-w-[200px]">
                        {currentMedia.name}
                      </h3>
                      <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded inline-flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* Top Right Controls */}
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                      onClick={toggleFavorite}
                      className="text-white hover:text-gray-300 transition-colors p-1.5"
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </button>

                    <button
                      onClick={handleShareClick}
                      className="text-white hover:text-gray-300 transition-colors p-1.5"
                      aria-label="Share channel"
                    >
                      <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>
                </div>

                {/* Center Play Button */}
                <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause();
                    }}
                    className="bg-pink-500/80 hover:bg-pink-600 text-white p-4 rounded-full transform transition-all pointer-events-auto
                             opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-8 w-8" />
                    ) : (
                      <PlayIcon className="h-8 w-8" />
                    )}
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className="flex flex-col space-y-2">
                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    {/* Volume Control */}
                    <div className="hidden sm:flex items-center space-x-2 group/volume">
                      <SpeakerWaveIcon className="h-5 w-5 text-white" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        onClick={(e) => e.stopPropagation()}
                        className="w-24 accent-pink-500"
                        aria-label="Volume control"
                      />
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {/* Toggle PIP mode */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePipMode();
                        }}
                        className="text-white hover:text-gray-300 transition-colors p-1.5"
                        aria-label="Picture-in-Picture"
                      >
                        <ArrowsPointingInIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
  
  // Mini Player (for any page that's not the media's main page)
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
              onChange={handleVolumeChange}
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

export default UnifiedPlayer; 