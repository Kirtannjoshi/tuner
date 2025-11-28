import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { TvIcon, PlayIcon } from '@heroicons/react/24/solid';
import { usePlayer } from '../contexts/PlayerContext';
import { getTvChannelsFromSource } from '../services/tvService';
import { loadCategories } from '../services/csvLoader';

const TvPage = () => {
  const [channels, setChannels] = useState([]);
  const [displayedChannels, setDisplayedChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(['all']);
  const [page, setPage] = useState(1);
  const CHANNELS_PER_PAGE = 48;

  const { playTv, setPlayerMode } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    loadChannelsFromSource();
    loadCategoriesFromCSV();
  }, []);

  const loadCategoriesFromCSV = async () => {
    try {
      const cats = await loadCategories();
      const categoryNames = cats.map(c => c.name.toLowerCase());
      setCategories(['all', ...categoryNames]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadChannelsFromSource = async () => {
    setIsLoading(true);
    // Always use IPTV Global source - ignore Settings
    const iptvGlobalUrl = 'https://iptv-org.github.io/iptv/index.m3u';

    try {
      console.log('Loading channels from IPTV Global...');

      // Use the new tvService function that handles IPTV playlists and decryption
      const loadedChannels = await getTvChannelsFromSource({
        source: iptvGlobalUrl,
        category: 'all',
        limit: null // No limit - load ALL channels
      });

      console.log(`✅ Loaded ${loadedChannels.length} channels from IPTV Global`);
      setChannels(loadedChannels);
    } catch (error) {
      console.error('❌ Error loading channels:', error);
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groups = useMemo(() => {
    // Use categories from CSV if available, otherwise extract from channels
    if (categories.length > 1) {
      return categories;
    }
    const uniqueGroups = [...new Set(channels.map(c => c.genre || c.group || 'General'))];
    return ['all', ...uniqueGroups.slice(0, 25)];
  }, [channels, categories]);

  // Filter channels based on search and group
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(c => (c.genre || c.group || '').toLowerCase() === selectedGroup.toLowerCase());
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.genre || c.group || '').toLowerCase().includes(query) ||
        (c.country || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [channels, selectedGroup, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setDisplayedChannels(filteredChannels.slice(0, CHANNELS_PER_PAGE));
  }, [filteredChannels]);

  // Load more channels
  const loadMore = () => {
    const nextPage = page + 1;
    const nextChannels = filteredChannels.slice(0, nextPage * CHANNELS_PER_PAGE);
    setDisplayedChannels(nextChannels);
    setPage(nextPage);
  };

  const handleChannelClick = (channel) => {
    playTv(channel);
    navigate(`/watch/tv/${channel.id}`);
  };

  const ChannelCard = ({ channel }) => (
    <div
      onClick={() => handleChannelClick(channel)}
      className="group cursor-pointer transition-all"
    >
      {/* Thumbnail - Ultra Small */}
      <div className="relative aspect-video bg-black rounded-md overflow-hidden mb-1">
        <img
          src={channel.logo}
          alt={channel.name}
          className="w-full h-full object-contain p-1"
          loading="lazy"
          onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/4409/4409506.png'}
        />
        <div className="absolute top-0.5 left-0.5 px-0.5 py-[1px] bg-red-600 rounded-sm text-[6px] font-bold text-white uppercase tracking-wider">
          Live
        </div>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <PlayIcon className="h-4 w-4 text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Channel Info - Ultra Small */}
      <div className="flex gap-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-[10px] truncate mb-0 group-hover:text-pink-400 transition-colors leading-tight">
            {channel.name}
          </h3>
          <p className="text-[9px] text-gray-500 truncate leading-tight">{channel.genre || channel.group || 'General'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-20 lg:pb-8 overflow-x-hidden w-full">
      {/* Minimalistic Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TvIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Live TV</h1>
            <p className="text-xs text-gray-500">{filteredChannels.length} channels</p>
          </div>
        </div>
      </div>

      {/* Clean Search Bar */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-800/50 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-pink-500/50 focus:bg-gray-900/80 text-gray-200 placeholder-gray-600"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-600" />
      </div>

      {/* Category Pills - Horizontal Scroll Enabled with Ocean Square Bar */}
      <div className="w-full overflow-hidden">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-ocean touch-pan-x w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedGroup === group
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800/50 border border-gray-800/50'
                }`}
            >
              {group === 'all' ? 'All' : group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* YouTube/Twitch Style Grid - Ultra Compact */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 w-full">
          {[...Array(21)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-800 rounded-md mb-1"></div>
              <div className="h-2.5 bg-gray-800 rounded mb-0.5"></div>
              <div className="h-2 bg-gray-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : displayedChannels.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-xl border border-gray-800/50 w-full">
          <div className="text-5xl mb-3">📺</div>
          <p className="text-gray-500 mb-3">No channels found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg text-xs font-medium transition-all"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 w-full">
            {displayedChannels.map(channel => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>

          {/* Load More Trigger */}
          {displayedChannels.length < filteredChannels.length && (
            <div className="flex justify-center py-8">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors border border-gray-700"
              >
                Load More Channels
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TvPage;