import React, { useState, useEffect } from 'react';
import { getRadioStations } from '../../services/radioService';

const RadioList = ({ selectedCountry }) => {
  const [stations, setStations] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [filteredStations, setFilteredStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      const data = await getRadioStations();
      setStations(data);
    };
    fetchStations();
  }, []);

  useEffect(() => {
    let filtered = [...stations];
    
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(station => station.country.toLowerCase() === selectedCountry);
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'country':
        filtered.sort((a, b) => a.country.localeCompare(b.country));
        break;
      case 'genre':
        filtered.sort((a, b) => a.genre.localeCompare(b.genre));
        break;
      default:
        break;
    }

    setFilteredStations(filtered);
  }, [stations, selectedCountry, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Radio Stations</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="name">Sort by Name</option>
          <option value="country">Sort by Country</option>
          <option value="genre">Sort by Genre</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStations.map((station) => (
          <div
            key={station.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{station.countryFlag}</span>
                <h3 className="text-lg font-medium text-gray-900">{station.name}</h3>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>{station.genre}</p>
                <p>{station.country}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => station.play()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadioList;