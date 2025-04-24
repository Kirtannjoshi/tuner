import { useState, useEffect, useRef, useContext } from 'react';
import Hls from 'hls.js';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SpeakerWaveIcon,
  HeartIcon,
  ShareIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  PhoneIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { addFavoriteChannel, removeFavoriteChannel, isChannelFavorite } from '../../services/favoritesService';
import { PlayerContext } from '../../contexts/PlayerContext';
import RetroTVLoader from './RetroTVLoader';

// CORS proxy for stream URLs that need it
const CORS_PROXY = 'https://cors.streams.ovh/';
const USE_CORS_PROXY = false; // Set to true to use the CORS proxy for all streams

// Add a function to detect mobile devices
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 767px)').matches);
};

const TvPlayer = ({ channel }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHD, setIsHD] = useState(!isMobileDevice()); // Default to SD on mobile
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);
  const [useCorsProxy, setUseCorsProxy] = useState(USE_CORS_PROXY);
  const [retryWithProxy, setRetryWithProxy] = useState(false);
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [showStreamInput, setShowStreamInput] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const hlsRef = useRef(null);
  const { playTv, isPlaying: contextIsPlaying, togglePlayPause, volume, setPlayerVolume, currentMedia, videoElement, setVideoElement } = useContext(PlayerContext);

  // Update isMobile state when window resizes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Clean up HLS instance when component unmounts
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  // Check if current channel is a streaming channel
  useEffect(() => {
    if (channel?.country === 'Streaming') {
      setShowStreamInput(true);
    } else {
      setShowStreamInput(false);
    }
  }, [channel]);

  // Move up to where component state is defined (around line 44)
  useEffect(() => {
    // Check if this station is in favorites
    if (channel) {
      setIsFavorite(isChannelFavorite(channel.id));
    }
    
    // Sync local state with context state
    setIsPlaying(contextIsPlaying);
    
    // Update volume from context when it changes
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [channel, contextIsPlaying, volume]);

  // Helper to determine if we should use CORS proxy for this URL
  const getStreamUrl = (url) => {
    if (!url) {
      // For streaming channels, use the custom URL if available
      if (channel?.country === 'Streaming' && customStreamUrl) {
        return useCorsProxy ? `${CORS_PROXY}${customStreamUrl}` : customStreamUrl;
      }
      return '';
    }
    
    // Skip proxy for YouTube HLS URLs which already have CORS headers
    if (url.includes('ythls.armelin.one')) {
      return url;
    }

    return useCorsProxy ? `${CORS_PROXY}${url}` : url;
  };

  // Handle retry when stream fails
  const handleRetry = () => {
    setError(null);
    setRetryWithProxy(!useCorsProxy);
    setUseCorsProxy(!useCorsProxy);
  };

  // Handle channel changes or proxy changes
  useEffect(() => {
    if (!channel) return;
    
    setIsFavorite(isChannelFavorite(channel.id));
    setRetryWithProxy(false);
    
    if (videoRef.current) {
      // Reset error state
      setError(null);
      
      // Reset video settings
      videoRef.current.volume = volume;
      
      // Destroy previous HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Set up error handling for video element
      const handleVideoError = (e) => {
        console.error('Video playback error:', e);
        
        // Check if we're on a mobile device
        if (isMobile) {
          // For mobile network issues
          if (navigator.onLine === false) {
            setError('Your device appears to be offline. Please check your connection.');
          } else if (!useCorsProxy && !retryWithProxy) {
            setError('Stream access error. Try enabling the CORS proxy or switch to SD quality.');
            setRetryWithProxy(true);
          } else {
            setError('Unable to play this channel on your mobile device. Please try another one.');
          }
        } else {
          // Desktop error handling
          if (!useCorsProxy && !retryWithProxy) {
            setError('Stream access error. Try enabling the CORS proxy');
            setRetryWithProxy(true);
          } else {
            setError('Unable to play this channel. Please try another one.');
          }
        }
        setIsPlaying(false);
      };
      
      videoRef.current.onerror = handleVideoError;

      // Handle HLS streams properly
      const loadVideo = async () => {
        try {
          // For streaming channels, check if we have a custom URL
          if (channel.country === 'Streaming' && !customStreamUrl) {
            setIsPlaying(false);
            return; // Don't load video if we don't have a URL for streaming channels
          }

          const streamUrl = getStreamUrl(channel.streamUrl);
          
          // Check if it's an HLS stream or MPD (DASH) stream
          if (streamUrl && (streamUrl.includes('.m3u8') || streamUrl.includes('.mpd'))) {
            // Use HLS.js if it's supported by the browser
            if (Hls.isSupported()) {
              hlsRef.current = new Hls({
                xhrSetup: (xhr) => {
                  xhr.withCredentials = false; // Disable credentials for CORS
                },
                maxBufferLength: 120,
                maxMaxBufferLength: 240,
                maxBufferSize: 120 * 1000 * 1000,
                maxBufferHole: 0.5,
                highBufferWatchdogPeriod: 3,
                manifestLoadingTimeOut: 30000,
                manifestLoadingMaxRetry: 10,
                manifestLoadingRetryDelay: 1000,
                manifestLoadingMaxRetryTimeout: 64000,
                levelLoadingTimeOut: 30000,
                levelLoadingMaxRetry: 10,
                levelLoadingRetryDelay: 1000,
                levelLoadingMaxRetryTimeout: 64000,
                fragLoadingTimeOut: 40000,
                fragLoadingMaxRetry: 10,
                fragLoadingRetryDelay: 1000,
                fragLoadingMaxRetryTimeout: 64000,
                backBufferLength: 120,
                lowLatencyMode: false,
                stallDetectionMode: 2,
                capLevelToPlayerSize: true,
                startLevel: isMobile ? -1 : 0,
                testBandwidth: true,
                abrEwmaDefaultEstimate: 1000000,
                abrBandWidthFactor: 0.8,
                abrBandWidthUpFactor: 0.7
              });
              
              hlsRef.current.attachMedia(videoRef.current);
              
              hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
                hlsRef.current.loadSource(streamUrl);
                
                hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
                  if (isPlaying) {
                    videoRef.current.play().catch(err => {
                      console.error('Error playing video:', err);
                      
                      if (!useCorsProxy && !retryWithProxy) {
                        setError('Stream access error. Try enabling the CORS proxy');
                        setRetryWithProxy(true);
                      } else {
                        setError('Unable to play this channel. Please try another one.');
                        setIsPlaying(false);
                      }
                    });
                  }
                });
              });
              
              hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                
                if (data.fatal) {
                  switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      // Try to recover network error
                      console.log('Fatal network error encountered, trying to recover');
                      
                      if (!useCorsProxy && !retryWithProxy && 
                         (data.response && (data.response.code === 403 || data.response.code === 0))) {
                        setError('Stream access blocked. Try enabling the CORS proxy');
                        setRetryWithProxy(true);
                      } else {
                        hlsRef.current.startLoad();
                      }
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.log('Fatal media error encountered, trying to recover');
                      hlsRef.current.recoverMediaError();
                      break;
                    default:
                      // Cannot recover
                      if (!useCorsProxy && !retryWithProxy) {
                        setError('Stream access error. Try enabling the CORS proxy');
                        setRetryWithProxy(true);
                      } else {
                        setError('Stream playback error. Please try another channel.');
                        hlsRef.current.destroy();
                      }
                      break;
                  }
                } else if (data.details === 'bufferStalledError') {
                  // Handle non-fatal buffer stall errors
                  console.log('Buffer stalled, attempting to recover...');
                  
                  if (videoRef.current) {
                    // For minor stalls, we can try to resume playback
                    const currentTime = videoRef.current.currentTime;
                    
                    // Implement a multi-stage recovery process
                    // First try to move forward a bit to skip the stalled segment
                    videoRef.current.currentTime = currentTime + 0.5;
                    
                    // If that doesn't work, try to reload the stream with more aggressive approach
                    setTimeout(() => {
                      if (videoRef.current && (videoRef.current.paused || videoRef.current.readyState < 3)) {
                        console.log('First stage buffer stall recovery');
                        
                        // Try a small seek first to clear the stall
                        videoRef.current.currentTime = Math.max(0, currentTime + 1);
                        
                        // After a short delay, try to play again
                        setTimeout(() => {
                          videoRef.current.play().catch(() => {
                            // If that fails, try a more aggressive approach
                            console.log('Second stage buffer stall recovery');
                            
                            if (hlsRef.current) {
                              // Stop loading, adjust levels, and restart
                              hlsRef.current.stopLoad();
                              
                              // If on mobile, try to force a lower quality level
                              if (isMobile && isHD) {
                                setIsHD(false);
                                hlsRef.current.currentLevel = -1; // Auto (lowest appropriate level)
                              }
                              
                              // Restart with a slight offset to avoid the problematic segment
                              videoRef.current.currentTime = Math.max(0, currentTime + 2);
                              hlsRef.current.startLoad();
                              
                              // Add a longer delay before play attempt to let buffer build up
                              setTimeout(() => {
                                videoRef.current.play().catch(err => {
                                  console.log('Play after aggressive recovery failed:', err);
                                  
                                  // As a last resort, try reloading the stream completely
                                  if (hlsRef.current) {
                                    console.log('Final stage buffer stall recovery - full reload');
                                    hlsRef.current.destroy();
                                    
                                    // Wait a bit and try creating a fresh player
                                    setTimeout(() => {
                                      const streamUrl = getStreamUrl(channel.streamUrl);
                                      hlsRef.current = new Hls({
                                        maxBufferLength: 60,
                                        startLevel: -1, // Auto
                                        lowLatencyMode: false
                                      });
                                      
                                      hlsRef.current.attachMedia(videoRef.current);
                                      hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
                                        hlsRef.current.loadSource(streamUrl);
                                        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
                                          videoRef.current.play().catch(() => 
                                            setError('Unable to recover playback. Please reload the page or try a different channel.'));
                                        });
                                      });
                                    }, 2000);
                                  }
                                });
                              }, 3000);
                            }
                          });
                        }, 1000);
                      }
                    }, 2000);
                  }
                }
              });
            } 
            // For Safari and iOS which have native HLS support
            else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
              videoRef.current.src = streamUrl;
              if (isPlaying) {
                videoRef.current.play().catch(err => {
                  console.error('Error playing video:', err);
                  
                  if (!useCorsProxy && !retryWithProxy) {
                    setError('Stream access error. Try enabling the CORS proxy');
                    setRetryWithProxy(true);
                  } else {
                    setError('Unable to play this channel. Please try another one.');
                    setIsPlaying(false);
                  }
                });
              }
            } else {
              setError('Your browser does not support HLS playback.');
            }
          } else {
            // Regular video source
            videoRef.current.src = streamUrl;
            if (isPlaying) {
              videoRef.current.play().catch(err => {
                console.error('Error playing video:', err);
                
                if (!useCorsProxy && !retryWithProxy) {
                  setError('Stream access error. Try enabling the CORS proxy');
                  setRetryWithProxy(true);
                } else {
                  setError('Unable to play this channel. Please try another one.');
                  setIsPlaying(false);
                }
              });
            }
          }
        } catch (err) {
          console.error('Error setting up video playback:', err);
          setError('Unable to play this channel. Please try another one.');
          setIsPlaying(false);
        }
      };
      
      loadVideo();
    }
  }, [channel, volume, useCorsProxy, isPlaying, customStreamUrl]);

  // Handle retry with proxy button click
  useEffect(() => {
    if (retryWithProxy) {
      setUseCorsProxy(true);
    }
  }, [retryWithProxy]);

  // Handle play state changes
  useEffect(() => {
    if (!videoRef.current || !channel) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        
        if (!useCorsProxy && !retryWithProxy) {
          setError('Stream access error. Try enabling the CORS proxy');
          setRetryWithProxy(true);
        } else {
          setError('Unable to play this channel. Please try another one.');
          setIsPlaying(false);
        }
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, channel]);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying || !showControls) return;
    
    const hideControls = () => setShowControls(false);
    
    controlsTimerRef.current = setTimeout(hideControls, 3000);
    
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  // Enhance the togglePlay function (around line 438):
  const togglePlay = () => {
    if (!videoRef.current || !channel) return;
    
    // Toggle play/pause state in the global player context
    togglePlayPause();
    
    // Let the context handle the actual state changes
    // We'll update local state in response to context changes
  };

  const toggleCorsProxy = () => {
    setUseCorsProxy(!useCorsProxy);
  };

  const toggleFavorite = () => {
    if (!channel) return;
    
    if (isFavorite) {
      removeFavoriteChannel(channel.id);
    } else {
      addFavoriteChannel(channel);
    }
    setIsFavorite(!isFavorite);
  };

  // Update the volume handler (around line 463)
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    
    // Update the volume both locally and in the context
    setPlayerVolume(newVolume);
    
    // We don't need to manually set the video volume here as it will be done
    // through the useEffect hook that watches for volume changes
  };

  const handleVideoClick = () => {
    if (!channel) return;
    
    if (showControls) {
      togglePlay();
    } else {
      setShowControls(true);
    }
  };

  const handleMouseMove = () => {
    if (isPlaying) {
      setShowControls(true);
    }
  };

  const shareChannel = () => {
    if (!channel) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Watch ${channel.name} on TUNER`,
        text: `Check out ${channel.name} on TUNER, a free TV streaming platform.`,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  const handleVideoLoadStart = () => {
    if (videoRef.current) {
      // Set poster image and add error handling
      const posterUrl = channel?.logo || '/placeholder-tv.svg';
      videoRef.current.poster = posterUrl;
      
      // Create an image element to test if the poster image can load
      const img = new Image();
      img.onerror = () => {
        if (videoRef.current) {
          console.log('Poster image failed to load, using placeholder');
          videoRef.current.poster = '/placeholder-tv.svg';
        }
      };
      img.src = posterUrl;
    }
  };

  // Add touch-specific handlers for mobile
  const handleTouchStart = () => {
    // Toggle controls visibility on touch
    setShowControls(!showControls);
    
    // If controls were hidden and now shown, set timer to hide them again
    if (!showControls) {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Add this inside the useEffect that handles video reference setup
  useEffect(() => {
    if (videoRef.current && channel) {
      // Only register with player context if this is a new channel or player isn't already playing this channel
      if (!currentMedia || currentMedia.type !== 'tv' || currentMedia.id !== channel.id) {
        // Register this video element with the player context
        playTv(channel, videoRef.current);
      } else {
        // If returning to this page and the channel is already in context, just sync the video element
        if (videoElement !== videoRef.current) {
          // Update video element reference
          setVideoElement(videoRef.current);
        }
      }
    }
  }, [channel, videoRef, currentMedia, videoElement]);

  // Handle custom stream URL input
  const handleStreamUrlSubmit = (e) => {
    e.preventDefault();
    if (customStreamUrl) {
      // Update the video with the new stream URL
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Reload the video with new URL
      if (videoRef.current) {
        loadVideo();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onMouseMove={handleMouseMove}
      onTouchStart={isMobile ? handleTouchStart : undefined}
    >
      {showStreamInput && (
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <form onSubmit={handleStreamUrlSubmit} className="flex items-center gap-2">
            <div className="flex-1">
              <label htmlFor="streamUrl" className="sr-only">Stream URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="streamUrl"
                  className="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter stream URL (HLS .m3u8, MP4, etc)"
                  value={customStreamUrl}
                  onChange={(e) => setCustomStreamUrl(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md"
            >
              Play Stream
            </button>
          </form>
          <p className="text-gray-400 text-xs mt-1">
            Paste a direct media URL. For Twitch, use a link to the .m3u8 stream file.
          </p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="max-w-md p-4 bg-gray-900 rounded-lg text-center">
            <p className="text-red-400 mb-3">{error}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {retryWithProxy && (
                <button 
                  onClick={toggleCorsProxy}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
                >
                  {useCorsProxy ? 'Disable CORS Proxy' : 'Enable CORS Proxy'}
                </button>
              )}
              <button 
                onClick={() => {
                  setError(null);
                  if (isMobile && isHD) {
                    setIsHD(false);
                  }
                }}
                className="bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {channel ? (
        <>
          <div 
            className="relative group" 
            onClick={handleVideoClick}
          >
<<<<<<< HEAD
            {error ? (
              <RetroTVLoader error={error} onRetry={handleRetry} />
            ) : !isPlaying ? (
              <RetroTVLoader />
            ) : (
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black cursor-pointer"
                controls={false}
                muted={volume === 0}
                playsInline
                autoPlay={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadStart={handleVideoLoadStart}
                onClick={handleVideoClick}
              />
            )}
=======
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black cursor-pointer"
              controls={false}
              muted={volume === 0}
              playsInline
              autoPlay={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadStart={handleVideoLoadStart}
              onClick={handleVideoClick}
            />
>>>>>>> 4105d8be8b6c22f58b820a27d7b00831736f446f

            {/* Mobile Play/Pause Overlay - only visible on touch devices */}
            <div className="absolute inset-0 md:hidden flex items-center justify-center touch-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="bg-pink-500/80 hover:bg-pink-600 text-white p-4 rounded-full transform transition-transform active:scale-90"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <PauseIcon className="h-8 w-8" />
                ) : (
                  <PlayIcon className="h-8 w-8" />
                )}
              </button>
            </div>

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
                      src={channel.logo || '/placeholder-tv.svg'} 
                      alt={channel.name}
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-gray-800 object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.onerror = null; // Prevent infinite error loops
                        e.target.src = '/placeholder-tv.svg';
                      }}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                      <h3 className="text-white font-semibold text-sm sm:text-base truncate max-w-[200px]">
                        {channel.name}
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
                      onClick={shareChannel}
                      className="text-white hover:text-gray-300 transition-colors p-1.5"
                      aria-label="Share channel"
                    >
                      <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>
                </div>

                {/* Center Play Button - hidden on mobile */}
                <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
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
                  {/* Progress Bar - can be implemented later */}
                  <div className="w-full h-1 bg-gray-600/50 rounded-full">
                    <div className="h-full w-0 bg-pink-500 rounded-full"></div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
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
                          className="w-0 group-hover/volume:w-24 transition-all duration-300 accent-pink-500"
                          aria-label="Volume control"
                        />
                      </div>

                      {/* Mobile Volume Button */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="sm:hidden text-white p-1.5"
                      >
                        <SpeakerWaveIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {/* CORS Proxy Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCorsProxy();
                        }}
                        className={`hidden sm:block px-2 py-1 rounded text-xs font-semibold transition-colors
                                  ${useCorsProxy ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-200'}`}
                        aria-label={useCorsProxy ? "Disable CORS Proxy" : "Enable CORS Proxy"}
                      >
                        PROXY
                      </button>
                      
                      {/* Quality Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHD(!isHD);
                        }}
                        className={`hidden sm:block px-2 py-1 rounded text-xs font-semibold transition-colors
                                  ${isHD ? 'bg-lime-500 text-white' : 'bg-gray-600 text-gray-200'}`}
                        aria-label={isHD ? "Disable HD" : "Enable HD"}
                      >
                        HD
                      </button>

                      {/* Fullscreen Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullscreen();
                        }}
                        className="text-white hover:text-gray-300 transition-colors p-1.5"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        {isFullscreen ? (
                          <ArrowsPointingInIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <ArrowsPointingOutIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </button>

                      {/* Settings Menu */}
                      <button
                        className="text-white hover:text-gray-300 transition-colors p-1.5"
                        aria-label="Settings"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CogIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gray-900 text-center p-4">
          <div className="max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Select a Channel</h2>
            <p className="text-gray-400 text-sm sm:text-base">Choose a TV channel from the list to start watching</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TvPlayer;