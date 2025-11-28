import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayIcon, RadioIcon, TvIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { getHomeRecommendations } from '../services/recommendationService';
import { getTvChannelsFromSource } from '../services/tvService';
import { usePlayer } from '../contexts/PlayerContext';

import Header from '../components/layout/Header';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { playRadio, playTv, setPlayerMode } = usePlayer();
  const navigate = useNavigate();

  // Categories for the scrollable bar
  const categories = [
    'all', 'news', 'sports', 'music', 'movies', 'entertainment',
    'documentary', 'kids', 'lifestyle', 'adult', 'religious'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let data = [];
        if (selectedCategory === 'all') {
          // Fetch 30 mixed items (Radio + TV)
          data = await getHomeRecommendations(30);
        } else {
          // Fetch specific category (TV only for now as Radio categories differ)
          // Using IPTV Global source
          const iptvGlobalUrl = 'https://iptv-org.github.io/iptv/index.m3u';
          data = await getTvChannelsFromSource({
            source: iptvGlobalUrl,
            category: selectedCategory,
            limit: 30
          });
          // Add type 'tv' to these items
          data = data.map(item => ({ ...item, type: 'tv' }));
        }
        setItems(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const handleMediaClick = (media) => {
    // Play the media to set context
    if (media.type === 'radio') {
      playRadio(media);
      navigate(`/watch/radio/${media.id}`);
    } else {
      playTv(media);
      navigate(`/watch/tv/${media.id}`);
    }
  };

  const MediaCard = ({ item }) => (
    <div
      onClick={() => handleMediaClick(item)}
      className="group cursor-pointer transition-all"
    >
      {/* Thumbnail - Ultra Small */}
      <div className="relative aspect-video bg-black rounded-md overflow-hidden mb-1">
        <img
          src={item.logo || '/placeholder.svg'}
          alt={item.name}
          className="w-full h-full object-contain p-1"
          onError={(e) => e.target.src = item.type === 'radio'
            ? 'https://cdn-icons-png.flaticon.com/512/565/565422.png'
            : 'https://cdn-icons-png.flaticon.com/512/4409/4409506.png'}
        />

        {/* Live Badge */}
        <div className="absolute top-0.5 left-0.5 px-0.5 py-[1px] bg-red-600 rounded-sm text-[6px] font-bold text-white uppercase tracking-wider">
          Live
        </div>

        {/* Type Badge (Radio/TV) */}
        <div className={`absolute top-0.5 right-0.5 px-1 py-[1px] rounded-sm text-[6px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5 ${item.type === 'radio' ? 'bg-purple-600' : 'bg-blue-600'
          }`}>
          {item.type === 'radio' ? <RadioIcon className="h-2 w-2" /> : <TvIcon className="h-2 w-2" />}
          {item.type === 'radio' ? 'Radio' : 'TV'}
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <PlayIcon className="h-4 w-4 text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info - Ultra Small */}
      <div className="flex gap-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-[10px] truncate mb-0 group-hover:text-pink-400 transition-colors leading-tight">
            {item.name}
          </h3>
          <p className="text-[9px] text-gray-500 truncate leading-tight">
            {item.genre || item.country || 'General'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-20 lg:pb-8 overflow-x-hidden w-full">
      {/* Header with Search and Categories */}
      <Header />

      {/* Category Pills - Horizontal Scroll with Ocean Square Bar */}
      <div className="w-full overflow-hidden">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-ocean touch-pan-x w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all flex-shrink-0 uppercase tracking-wide ${selectedCategory === category
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>


      {/* Combined Grid - Ultra Compact */}
      {
        isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 w-full">
            {[...Array(21)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-md mb-1"></div>
                <div className="h-2.5 bg-gray-800 rounded mb-0.5"></div>
                <div className="h-2 bg-gray-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 w-full">
            {items.map((item, index) => (
              <MediaCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        )
      }
    </div >
  );
};

export default HomePage;