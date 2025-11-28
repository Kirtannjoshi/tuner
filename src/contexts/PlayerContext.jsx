import { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { addToHistory, getHistory } from '../services/recommendationService';

// Default context values
const defaultContextValue = {
  currentMedia: null,
  isPlaying: false,
  volume: 0.8,
  playerMode: 'hidden', // 'hidden' | 'mini' | 'full' | 'pip'
  playRadio: () => { },
  playTv: () => { },
  playAudio: () => { },
  togglePlayPause: () => { },
  stopMedia: () => { },
  setPlayerVolume: () => { },
  setPlayerMode: () => { },
  getRecentMedia: () => [],
  setIsPlaying: () => { },
  audioLibrary: [],
  addToLibrary: () => { },
  removeFromLibrary: () => { },
  isInLibrary: () => false,
};

// Create context
export const PlayerContext = createContext(defaultContextValue);

export const PlayerProvider = ({ children }) => {
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize volume from localStorage
  const [volume, setVolume] = useState(() => {
    try {
      const savedState = localStorage.getItem('playerState');
      if (savedState) {
        const { lastVolume } = JSON.parse(savedState);
        return lastVolume !== undefined ? lastVolume : 0.8;
      }
      return 0.8;
    } catch (e) {
      return 0.8;
    }
  });

  // Initialize previousStations from localStorage
  const [previousStations, setPreviousStations] = useState(() => {
    try {
      const savedState = localStorage.getItem('playerState');
      if (savedState) {
        const { lastStations } = JSON.parse(savedState);
        return lastStations || {};
      }
      return {};
    } catch (e) {
      return {};
    }
  });

  const [playerMode, setPlayerMode] = useState('hidden');
  const [followedChannels, setFollowedChannels] = useState(() => {
    try {
      const saved = localStorage.getItem('followedChannels');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Audio library state (for audiobooks & podcasts)
  const [audioLibrary, setAudioLibrary] = useState(() => {
    try {
      const saved = localStorage.getItem('openstream_library');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save state to localStorage
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

  const playRadio = (station) => {
    if (!station) return;

    // If same station, just resume
    if (currentMedia?.type === 'radio' && currentMedia?.id === station.id) {
      setIsPlaying(true);
      return;
    }

    const mediaData = {
      type: 'radio',
      id: station.id,
      name: station.name,
      genre: station.genre,
      logo: station.logo,
      country: station.country,
      countryFlag: station.countryFlag,
      streamUrl: station.streamUrl
    };

    setCurrentMedia(mediaData);

    // Add to history for recommendations
    addToHistory(mediaData);
    setPreviousStations(prev => ({ ...prev, [station.id]: station }));
    setIsPlaying(true);
    setPlayerMode('mini'); // Default to Mini for Radio
  };

  const playTv = (channel) => {
    if (!channel) return;

    if (currentMedia?.type === 'tv' && currentMedia?.id === channel.id) {
      setIsPlaying(true);
      return;
    }

    const mediaData = {
      type: 'tv',
      id: channel.id,
      name: channel.name,
      genre: channel.genre,
      logo: channel.logo,
      image: channel.image,
      thumbnail: channel.thumbnail,
      country: channel.country,
      countryFlag: channel.countryFlag,
      streamUrl: channel.url || channel.streamUrl, // Handle both url formats
      isSeries: channel.isSeries,
      episodes: channel.episodes
    };

    setCurrentMedia(mediaData);

    // Add to history for recommendations
    addToHistory(mediaData);
    setPreviousStations(prev => ({ ...prev, [channel.id]: channel }));
    setIsPlaying(true);
    setPlayerMode('pip'); // Default to PiP for TV/Video
  };

  const playAudio = (track) => {
    if (!track) return;

    // If same track, just resume
    if (currentMedia?.type === 'audio' && currentMedia?.id === track.id) {
      setIsPlaying(true);
      setPlayerMode('full');
      return;
    }

    const mediaData = {
      type: 'audio',
      subType: track.subType || 'audiobook', // 'audiobook' or 'podcast'
      id: track.id,
      name: track.title || track.name,
      artist: track.artist || 'Unknown Artist',
      genre: track.genre || track.subType,
      logo: track.cover || track.logo,
      cover: track.cover || track.logo,
      image: track.cover || track.logo,
      description: track.description,
      source: track.source,
      streamUrl: track.streamUrl,
      lang: track.lang
    };

    setCurrentMedia(mediaData);

    // Add to history for recommendations
    addToHistory(mediaData);
    setPreviousStations(prev => ({ ...prev, [track.id]: track }));
    setIsPlaying(true);
    setPlayerMode('full'); // Always open in full mode for audio
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const stopMedia = () => {
    setIsPlaying(false);
    setCurrentMedia(null);
    setPlayerMode('hidden');
  };

  const setPlayerVolume = (newVolume) => {
    setVolume(newVolume);
  };

  const getRecentMedia = () => {
    return getHistory();
  };

  const followChannel = (channel) => {
    const newFollowed = [...followedChannels, {
      id: channel.id,
      name: channel.name,
      logo: channel.logo,
      type: channel.type,
      genre: channel.genre,
      streamUrl: channel.streamUrl || channel.url,
      followedAt: Date.now()
    }];
    setFollowedChannels(newFollowed);
    localStorage.setItem('followedChannels', JSON.stringify(newFollowed));
  };

  const unfollowChannel = (channelId) => {
    const newFollowed = followedChannels.filter(ch => ch.id !== channelId);
    setFollowedChannels(newFollowed);
    localStorage.setItem('followedChannels', JSON.stringify(newFollowed));
  };

  const isFollowing = (channelId) => {
    return followedChannels.some(ch => ch.id === channelId);
  };

  // Audio library management
  const addToLibrary = (track) => {
    const newLibrary = [...audioLibrary, {
      id: track.id,
      title: track.title || track.name,
      artist: track.artist,
      cover: track.cover || track.logo,
      type: track.type || 'audio',
      subType: track.subType,
      source: track.source,
      streamUrl: track.streamUrl,
      savedAt: Date.now()
    }];
    setAudioLibrary(newLibrary);
    localStorage.setItem('openstream_library', JSON.stringify(newLibrary));
  };

  const removeFromLibrary = (trackId) => {
    const newLibrary = audioLibrary.filter(track => track.id !== trackId);
    setAudioLibrary(newLibrary);
    localStorage.setItem('openstream_library', JSON.stringify(newLibrary));
  };

  const isInLibrary = (trackId) => {
    return audioLibrary.some(track => track.id === trackId);
  };

  const contextValue = useMemo(() => ({
    currentMedia,
    isPlaying,
    volume,
    playerMode,
    playRadio,
    playTv,
    playAudio, // Changed from playMusic
    togglePlayPause,
    stopMedia,
    setPlayerVolume,
    setPlayerMode,
    getRecentMedia,
    setIsPlaying,
    followedChannels,
    followChannel,
    unfollowChannel,
    isFollowing,
    audioLibrary, // Add audio library state
    addToLibrary,
    removeFromLibrary,
    isInLibrary
  }), [currentMedia, isPlaying, volume, playerMode, previousStations, followedChannels, audioLibrary]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};