import React, { useState, useEffect } from 'react';
import { getTvChannels } from '../../services/tvService';

const TvList = ({ selectedCountry }) => {
  const [channels, setChannels] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [filteredChannels, setFilteredChannels] = useState([]);

  useEffect(() => {
    const fetchChannels = async () => {
      const data = await getTvChannels();
      setChannels(data);
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    let filtered = [...channels];
    
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(channel => channel.country.toLowerCase() === selectedCountry);
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'country':
        filtered.sort((a, b) => a.country.localeCompare(b.country));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }

    setFilteredChannels(filtered);
  }, [channels, selectedCountry, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">TV Channels</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="name">Sort by Name</option>
          <option value="country">Sort by Country</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredChannels.map((channel) => (
          <div
            key={channel.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{channel.countryFlag}</span>
                <h3 className="text-lg font-medium text-gray-900">{channel.name}</h3>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>{channel.category}</p>
                <p>{channel.country}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => channel.play()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Watch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TvList;