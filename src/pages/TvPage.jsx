import { useState, useEffect, useContext } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import TvPlayer from '../components/tv/TvPlayer';
import { getTvChannels, getChannelsByCategory, searchChannels, getTvCategories } from '../services/tvService';
import { getFavoriteChannels } from '../services/favoritesService';
import { PlayerContext } from '../contexts/PlayerContext';

const TvPage = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, category, favorites, search
  const [categories, setCategories] = useState([]);
  
  // Get the current playing media from context
  const { currentMedia } = useContext(PlayerContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle URL parameters to preserve state across navigation
  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const channelId = params.get('id');
    
    if (channelId && channels.length > 0) {
      // Find channel by ID
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
      }
    }
  }, [location.search, channels]);

  // Update URL when selected channel changes
  useEffect(() => {
    if (selectedChannel) {
      // Update URL with channel ID without full page reload
      navigate(`/tv?id=${selectedChannel.id}`, { replace: true });
    }
  }, [selectedChannel, navigate]);

  // Fetch initial channels on component mount
  useEffect(() => {
    fetchAllChannels();
    setCategories(getTvCategories());
  }, []);
  
  // Sync selected channel with currently playing media
  useEffect(() => {
    if (currentMedia && currentMedia.type === 'tv' && channels.length > 0) {
      // Find the currently playing channel in our list
      const playingChannel = channels.find(channel => channel.id === currentMedia.id);
      
      if (playingChannel && (!selectedChannel || selectedChannel.id !== playingChannel.id)) {
        setSelectedChannel(playingChannel);
        
        // If we're in a filtered view, try to adjust the view to show the current channel
        if (activeTab !== 'all' && activeTab !== 'search') {
          // For category tab, check if we need to change the category
          if (activeTab === 'category' && playingChannel.genre !== selectedCategory) {
            setSelectedCategory(playingChannel.genre);
          } else {
            // Default to all channels view to ensure the channel is visible
            setActiveTab('all');
            fetchAllChannels();
          }
        }
      }
    }
  }, [currentMedia, channels, selectedCategory, activeTab]);

  // Handle category selection changes
  useEffect(() => {
    if (activeTab === 'category' && selectedCategory !== 'all') {
      fetchChannelsByCategory(selectedCategory);
    }
  }, [selectedCategory, activeTab]);

  // Handle search query submission
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim()) {
      fetchSearchResults(searchQuery);
    }
  }, [activeTab]);

  const fetchAllChannels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTvChannels({ limit: 24 });
      setChannels(data);
      setActiveTab('all');
    } catch (err) {
      setError('Failed to load TV channels');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChannelsByCategory = async (category) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getChannelsByCategory(category, 24);
      setChannels(data);
    } catch (err) {
      setError(`Failed to load ${category} channels`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavoriteChannels = () => {
    setIsLoading(true);
    setError(null);
    try {
      const favorites = getFavoriteChannels();
      setChannels(favorites);
      setActiveTab('favorites');
    } catch (err) {
      setError('Failed to load favorite channels');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchChannels(query, 24);
      setChannels(data);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setActiveTab('category');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
      fetchSearchResults(searchQuery);
    }
  };

  const getContentTitle = () => {
    switch (activeTab) {
      case 'all': return 'All Channels';
      case 'category': return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Channels`;
      case 'favorites': return 'Your Favorites';
      case 'search': return `Search Results: "${searchQuery}"`;
      default: return 'TV Channels';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search TV channels..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={fetchAllChannels}
          className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-lime-500' : 'bg-gray-800'} hover:bg-lime-600`}
        >
          All Channels
        </button>
        <button
          onClick={fetchFavoriteChannels}
          className={`px-4 py-2 rounded-lg ${activeTab === 'favorites' ? 'bg-lime-500' : 'bg-gray-800'} hover:bg-lime-600`}
        >
          Favorites
        </button>
      </div>

      <TvPlayer channel={selectedChannel} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{getContentTitle()}</h2>
        <button
          onClick={() => {
            if (activeTab === 'all') fetchAllChannels();
            else if (activeTab === 'category') fetchChannelsByCategory(selectedCategory);
            else if (activeTab === 'search') fetchSearchResults(searchQuery);
            else if (activeTab === 'favorites') fetchFavoriteChannels();
          }}
          className="flex items-center text-sm text-gray-400 hover:text-white"
          disabled={isLoading}
        >
          <ArrowPathIcon className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg text-center">
          <p>{error}</p>
          <button 
            onClick={() => {
              if (activeTab === 'all') fetchAllChannels();
              else if (activeTab === 'category') fetchChannelsByCategory(selectedCategory);
              else if (activeTab === 'search') fetchSearchResults(searchQuery);
              else if (activeTab === 'favorites') fetchFavoriteChannels();
            }}
            className="mt-2 text-sm text-white bg-lime-700 px-3 py-1 rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 animate-pulse p-4 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`flex items-center p-4 rounded-lg ${selectedChannel?.id === channel.id ? 'bg-lime-500' : 'bg-gray-800'} hover:bg-lime-600 transition-colors`}
            >
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-12 h-12 rounded object-contain bg-gray-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-tv.svg';
                }}
              />
              <div className="ml-4 text-left">
                <h3 className="font-semibold truncate">{channel.name}</h3>
                <p className="text-sm text-gray-400 truncate">
                  {channel.category} • {channel.language}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No channels found</p>
          <p className="text-sm text-gray-500 mt-2">Try selecting a different category or search term</p>
          <button 
            onClick={fetchAllChannels} 
            className="mt-4 px-4 py-2 bg-lime-500 hover:bg-lime-600 rounded-lg"
          >
            Show All Channels
          </button>
        </div>
      )}
    </div>
  );
};

export default TvPage;