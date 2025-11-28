import { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { fetchTracks } from '../../services/jamendoService';
import { HeartIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const VerticalFeed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef(null);
  const { currentMedia, isPlaying, togglePlayPause, playTv, playRadio, playMusic } = usePlayer();

  useEffect(() => {
    loadInitialContent();
  }, []);

  const loadInitialContent = async () => {
    setLoading(true);
    try {
      const tracks = await fetchTracks(10);
      setItems(tracks);
    } catch (error) {
      console.error('Error loading content:', error);
    }
    setLoading(false);
  };

  const handleScroll = (e) => {
    const element = e.target;
    const itemHeight = element.clientHeight;
    const scrollPosition = element.scrollTop;
    const newIndex = Math.round(scrollPosition / itemHeight);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }

    // Load more content when near bottom
    if (element.scrollHeight - scrollPosition <= element.clientHeight * 1.5) {
      loadMoreContent();
    }
  };

  const loadMoreContent = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newTracks = await fetchTracks(5, items.length);
      setItems(prev => [...prev, ...newTracks]);
    } catch (error) {
      console.error('Error loading more content:', error);
    }
    setLoading(false);
  };

  return (
    <div 
      ref={feedRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="h-screen w-full snap-start relative bg-black"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Overlay Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold truncate">{item.name}</h3>
                <p className="text-gray-300 text-sm truncate">{item.artist_name}</p>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <button className="text-white p-2 rounded-full bg-pink-600 hover:bg-pink-700">
                  <HeartIcon className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => playMusic(item)}
                  className={`text-white p-2 rounded-full transition-colors duration-200 ${
                    currentMedia && currentMedia.id === item.id && isPlaying
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-pink-600 hover:bg-pink-700'
                  }`}
                >
                  <SpeakerWaveIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-600"></div>
        </div>
      )}
    </div>
  );
};

export default VerticalFeed;