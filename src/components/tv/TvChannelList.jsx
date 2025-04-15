import React, { useState, useEffect } from 'react';
import { getTvChannels } from '../../services/tvService';
import TvChannelCard from './TvChannelCard';

const TvChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    country: '',
    language: ''
  });

  useEffect(() => {
    const loadChannels = async () => {
      setLoading(true);
      const data = await getTvChannels(filters);
      setChannels(data);
      setLoading(false);
    };

    loadChannels();
  }, [filters]);

  const categories = [
    'all',
    'news',
    'sports',
    'entertainment',
    'movies',
    'music',
    'kids',
    'documentary',
    'lifestyle',
    'science'
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilters({ ...filters, category })}
            className={`px-4 py-2 rounded-full ${filters.category === category ? 'bg-tuner-pink text-white' : 'bg-gray-700 text-gray-300'} hover:bg-tuner-pink hover:text-white transition-colors`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tuner-pink"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map(channel => (
            <TvChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TvChannelList;