import React, { useRef, useState, useEffect, useCallback } from 'react';

const RadioPlayer = ({ station, onClose, onError, isPlaying, togglePlayPause, isMiniPlayer }) => {
  const audioRef = useRef(null);
  const hls = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image error state when station changes
  useEffect(() => {
    if (station) {
      setImageError(false);
      setImageLoaded(false);
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
      
      {/* ... rest of existing code ... */}
    </div>
  );
};

export default RadioPlayer; 