import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, RadioIcon, TvIcon } from '@heroicons/react/24/outline';
import { getAllStations } from '../services/radioService';
import { getAllChannels } from '../services/tvService';
import { PlayerContext } from '../contexts/PlayerContext';
import '../styles/scrollbar.css';

const HomePage = () => {
  const [topRadioStations, setTopRadioStations] = useState([]);
  const [topTvChannels, setTopTvChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playRadio, playTv } = useContext(PlayerContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch data in parallel
        const [stations, channels] = await Promise.all([
          getAllStations(),
          getAllChannels()
        ]);
        
        // Get a selection of popular stations/channels
        setTopRadioStations(stations.slice(0, 10));
        setTopTvChannels(channels.slice(0, 10));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper to handle media clicks - directly play and navigate to appropriate page
  const handleMediaClick = (item, type) => {
    if (type === 'radio') {
      playRadio(item);
      navigate('/radio');
    } else if (type === 'tv') {
      navigate(`/tv?id=${item.id}`);
    }
  };

  // Helper to render media cards with consistent style
  const renderMediaCard = (item, type) => (
    <div 
      key={item.id}
      onClick={() => handleMediaClick(item, type)}
      className="snap-start flex-shrink-0 w-40 bg-gray-800 rounded-lg overflow-hidden shadow-md hover:bg-gray-700 transition-colors cursor-pointer"
    >
      <div className="h-32 bg-gray-700 relative">
        <img 
          src={item.logo || `/placeholder-${type}.svg`}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `/placeholder-${type}.svg`;
          }}
        />
        <div className="absolute top-2 left-2 text-lg">
          {item.countryFlag}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
        <p className="text-xs text-gray-400 mt-1 truncate">{item.genre}</p>
      </div>
    </div>
  );

  // Render skeleton loader for loading state
  const renderSkeletons = (count) => (
    Array(count).fill(0).map((_, i) => (
      <div key={i} className="snap-start flex-shrink-0 w-40 bg-gray-800 rounded-lg overflow-hidden animate-pulse">
        <div className="h-32 bg-gray-700"></div>
        <div className="p-3">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    ))
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Tuner</h1>
        <p className="opacity-90">Stream your favorite radio stations and TV channels from around the world.</p>
      </div>
      
      {/* Featured Radio Stations */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold flex items-center">
            <RadioIcon className="h-5 w-5 mr-2 text-pink-500" />
            Radio Stations
          </h2>
          <button onClick={() => navigate('/radio')} className="text-sm text-pink-500 hover:text-pink-400">
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto pb-4 snap-x flex gap-3 scrollbar-hide">
          {isLoading ? renderSkeletons(5) : (
            topRadioStations.map(station => renderMediaCard(station, 'radio'))
          )}
        </div>
      </section>
      
      {/* Featured TV Channels */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold flex items-center">
            <TvIcon className="h-5 w-5 mr-2 text-pink-500" />
            TV Channels
          </h2>
          <button onClick={() => navigate('/tv')} className="text-sm text-pink-500 hover:text-pink-400">
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto pb-4 snap-x flex gap-3 scrollbar-hide">
          {isLoading ? renderSkeletons(5) : (
            topTvChannels.map(channel => renderMediaCard(channel, 'tv'))
          )}
        </div>
      </section>
      
      {/* Browse by Category */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div onClick={() => navigate('/radio?genre=pop')} className="bg-blue-600 rounded-lg p-4 text-white hover:bg-blue-700 transition-colors cursor-pointer">
            <h3 className="font-medium">Pop</h3>
            <p className="text-sm opacity-80">Radio</p>
          </div>
          <div onClick={() => navigate('/radio?genre=news')} className="bg-red-600 rounded-lg p-4 text-white hover:bg-red-700 transition-colors cursor-pointer">
            <h3 className="font-medium">News</h3>
            <p className="text-sm opacity-80">Radio</p>
          </div>
          <div onClick={() => navigate('/tv?genre=news')} className="bg-green-600 rounded-lg p-4 text-white hover:bg-green-700 transition-colors cursor-pointer">
            <h3 className="font-medium">News</h3>
            <p className="text-sm opacity-80">TV</p>
          </div>
          <div onClick={() => navigate('/tv?genre=entertainment')} className="bg-purple-600 rounded-lg p-4 text-white hover:bg-purple-700 transition-colors cursor-pointer">
            <h3 className="font-medium">Entertainment</h3>
            <p className="text-sm opacity-80">TV</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 