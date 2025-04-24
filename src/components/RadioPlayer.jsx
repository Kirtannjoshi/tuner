import React, { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';

const RadioPlayer = ({ station, onClose, onError, isPlaying, togglePlayPause, isMiniPlayer }) => {
  const audioRef = useRef(null);
  const hls = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Handle audio playback
  useEffect(() => {
    if (!station) return;

    const audio = audioRef.current;
    if (!audio) return;

    const setupMediaSession = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: station.genre,
          artwork: [
            { src: station.logo || '/radio-default.png', sizes: '96x96', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          audio.play();
          togglePlayPause();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audio.pause();
          togglePlayPause();
        });
      }
    };

    const initializeAudio = () => {
      setError(null);
      setIsBuffering(true);

      if (station.url.includes('.m3u8')) {
        if (Hls.isSupported()) {
          if (hls.current) {
            hls.current.destroy();
          }
          const hlsInstance = new Hls();
          hlsInstance.loadSource(station.url);
          hlsInstance.attachMedia(audio);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play().catch(playError => {
              console.error('Playback failed:', playError);
              setError('Playback failed to start');
              onError && onError(playError);
            });
          });
          hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setError('Stream loading failed');
              onError && onError(new Error('HLS stream loading failed'));
            }
          });
          hls.current = hlsInstance;
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = station.url;
          audio.play().catch(playError => {
            console.error('Playback failed:', playError);
            setError('Playback failed to start');
            onError && onError(playError);
          });
        }
      } else {
        audio.src = station.url;
        audio.play().catch(playError => {
          console.error('Playback failed:', playError);
          setError('Playback failed to start');
          onError && onError(playError);
        });
      }

      setupMediaSession();
    };

    audio.addEventListener('playing', () => setIsBuffering(false));
    audio.addEventListener('waiting', () => setIsBuffering(true));
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setError('Audio playback error');
      onError && onError(e);
    });

    if (isPlaying) {
      initializeAudio();
    } else {
      audio.pause();
    }

    return () => {
      if (hls.current) {
        hls.current.destroy();
      }
      audio.removeEventListener('playing', () => setIsBuffering(false));
      audio.removeEventListener('waiting', () => setIsBuffering(true));
      audio.removeEventListener('error', () => {});
      audio.pause();
    };
  }, [station, isPlaying, togglePlayPause, onError]);

  // Reset image error state when station changes
  useEffect(() => {
    if (station) {
      setImageError(false);
      setImageLoaded(false);
      setError(null);
    }
  }, [station]);

  // Add CSS styles directly to component
  const styles = {
    stationLogoContainer: {
      position: 'relative',
      width: '60px',
      height: '60px',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#1f2937'
    },
    stationLogoPlaceholder: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    stationLogo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'opacity 0.3s ease'
    }
  };

  return (
    <div className={`radio-player ${isMiniPlayer ? 'mini-player' : ''}`}>
      <div className="station-info">
        {station && (
          <div style={styles.stationLogoContainer}>
            {!imageLoaded && !imageError && (
              <div 
                style={styles.stationLogoPlaceholder}
                className="animate-pulse"
              ></div>
            )}
            <img 
              src={imageError ? '/radio-default.png' : station.logo}
              alt={`${station.name} logo`}
              style={{
                ...styles.stationLogo,
                opacity: imageLoaded ? 1 : 0,
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.log(`Image load error for station: ${station.name}`);
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          </div>
        )}
        <div className="station-details">
          <h2>{station?.name}</h2>
          <p>{station?.genre} • {station?.country}</p>
        </div>
      </div>
      
      <audio ref={audioRef} preload="none" />
      
      {isBuffering && (
        <div className="buffering-indicator">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Buffering...</span>
        </div>
      )}

      {error && (
        <div className="error-message text-red-500">
          <span>{error}</span>
          <button 
            onClick={() => {
              setError(null);
              if (station && isPlaying) {
                const audio = audioRef.current;
                if (audio) {
                  audio.load();
                  audio.play().catch(console.error);
                }
              }
            }}
            className="ml-2 text-blue-500 hover:text-blue-600"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default RadioPlayer;