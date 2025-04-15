import { createContext, useState, useEffect } from 'react';

// Default context values
const defaultContextValue = {
  currentMedia: null,
  isPlaying: false,
  volume: 0.8,
  playRadio: () => {},
  playTv: () => {},
  togglePlayPause: () => {},
  stopMedia: () => {},
  setPlayerVolume: () => {},
  getRecentMedia: () => [],
  videoElement: null,
  setVideoElement: () => {},
  setIsPlaying: () => {}
};

// Create context with default values
export const PlayerContext = createContext(defaultContextValue);

export const PlayerProvider = ({ children }) => {
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [videoElement, setVideoElement] = useState(null);
  const [lastPosition, setLastPosition] = useState({});
  const [volume, setVolume] = useState(0.8);
  const [previousStations, setPreviousStations] = useState({});

  // For debugging
  console.log("PlayerProvider initialized"); 

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    setAudioElement(audio);

    // Restore player state from localStorage if available
    try {
      const savedState = localStorage.getItem('playerState');
      if (savedState) {
        const { lastMedia, lastVolume, lastStations } = JSON.parse(savedState);
        if (lastVolume) setVolume(lastVolume);
        if (lastStations) setPreviousStations(lastStations);
        // We don't auto-resume playback here for better UX
      }
    } catch (err) {
      console.error('Failed to load saved player state:', err);
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Save important player state to localStorage
  useEffect(() => {
    if (currentMedia || Object.keys(previousStations).length > 0) {
      const stateToSave = {
        lastMedia: currentMedia,
        lastVolume: volume,
        lastStations: previousStations
      };
      localStorage.setItem('playerState', JSON.stringify(stateToSave));
    }
  }, [currentMedia, volume, previousStations]);

  // Track playback position for audio
  useEffect(() => {
    if (!audioElement) return;

    const updatePosition = () => {
      if (currentMedia?.type === 'radio') {
        setLastPosition({
          ...lastPosition,
          [currentMedia.id]: audioElement.currentTime
        });
      }
    };

    const interval = setInterval(updatePosition, 5000);
    
    // Add timeupdate event for more accurate tracking
    audioElement.addEventListener('timeupdate', updatePosition);

    return () => {
      clearInterval(interval);
      audioElement.removeEventListener('timeupdate', updatePosition);
    };
  }, [audioElement, currentMedia, lastPosition]);

  const playRadio = (station) => {
    if (!audioElement || !station) return;

    // Track this station in the history
    setPreviousStations(prev => ({
      ...prev,
      [station.id]: station
    }));

    // Only reload if it's a different station
    const isSameStation = currentMedia?.type === 'radio' && currentMedia?.id === station.id;
    
    if (isSameStation) {
      // If it's the same station, just toggle play/pause
      if (!isPlaying) {
        audioElement.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Error resuming radio:', err);
        });
      }
      return;
    }

    // Stop video if playing
    if (videoElement) {
      videoElement.pause();
    }

    // Pause current audio before loading new source
    if (audioElement.src) {
      audioElement.pause();
    }

    // Set up current media
    setCurrentMedia({
      type: 'radio',
      id: station.id,
      name: station.name,
      genre: station.genre,
      logo: station.logo,
      country: station.country,
      countryFlag: station.countryFlag,
      streamUrl: station.streamUrl
    });

    // Set audio source and play after a short delay to avoid AbortError
    audioElement.src = station.streamUrl;
    audioElement.volume = volume;
    
    // Use a small timeout to prevent rapid play requests
    setTimeout(() => {
      audioElement.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Error playing radio:', err);
      });
    }, 100);
  };

  const playTv = (channel, videoEl) => {
    if (!channel || !videoEl) return;

    // Track this channel in the history
    setPreviousStations(prev => ({
      ...prev,
      [channel.id]: channel
    }));

    // Stop audio if playing
    if (audioElement) {
      audioElement.pause();
    }

    // Set video element reference
    setVideoElement(videoEl);

    // Set up current media
    setCurrentMedia({
      type: 'tv',
      id: channel.id,
      name: channel.name,
      genre: channel.genre,
      logo: channel.logo,
      country: channel.country,
      countryFlag: channel.countryFlag,
      streamUrl: channel.streamUrl
    });

    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!currentMedia) return;

    if (currentMedia.type === 'radio' && audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Error resuming audio:', err);
        });
      }
    } else if (currentMedia.type === 'tv' && videoElement) {
      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        videoElement.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Error resuming video:', err);
        });
      }
    }
  };

  const stopMedia = () => {
    if (currentMedia?.type === 'radio' && audioElement) {
      audioElement.pause();
      audioElement.src = '';
    } else if (currentMedia?.type === 'tv' && videoElement) {
      videoElement.pause();
    }

    setCurrentMedia(null);
    setIsPlaying(false);
  };

  const setPlayerVolume = (newVolume) => {
    setVolume(newVolume);
    if (audioElement) {
      audioElement.volume = newVolume;
    }
    if (videoElement) {
      videoElement.volume = newVolume;
    }
  };

  const getRecentMedia = () => {
    return Object.values(previousStations).slice(0, 5);
  };

  // Construct the context value object
  const contextValue = {
    currentMedia,
    isPlaying,
    volume,
    playRadio,
    playTv,
    togglePlayPause,
    stopMedia,
    setPlayerVolume,
    getRecentMedia,
    videoElement,
    setVideoElement,
    setIsPlaying
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}; 