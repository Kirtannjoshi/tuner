import { useState, useEffect, useMemo, useContext } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import RadioPlayer from '../components/radio/RadioPlayer';
import { getAllStations, getAvailableCountries, getRadioGenres } from '../services/radioService';
import { PlayerContext } from '../contexts/PlayerContext';

const RadioPage = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [allStations, setAllStations] = useState([]);
  const [countries, setCountries] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the current playing media from context
  const { currentMedia, playRadio } = useContext(PlayerContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle URL parameters to preserve state across navigation
  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const stationId = params.get('id');
    
    if (stationId && allStations.length > 0) {
      // Find station by ID
      const station = allStations.find(s => s.id === stationId);
      if (station) {
        setSelectedStation(station);
        
        // If coming back to the page and the station is not playing, play it
        if (!currentMedia || currentMedia.type !== 'radio' || currentMedia.id !== station.id) {
          playRadio(station);
        }
      }
    }
  }, [location.search, allStations, currentMedia]);

  // Update URL when selected station changes
  useEffect(() => {
    if (selectedStation) {
      // Update URL with station ID without full page reload
      navigate(`/radio?id=${selectedStation.id}`, { replace: true });
    }
  }, [selectedStation, navigate]);

  useEffect(() => {
    fetchData();
  }, []);
  
  // Sync selected station with currently playing media
  useEffect(() => {
    if (currentMedia && currentMedia.type === 'radio' && allStations.length > 0) {
      // Find the currently playing station in our list
      const playingStation = allStations.find(station => station.id === currentMedia.id);
      if (playingStation && (!selectedStation || selectedStation.id !== playingStation.id)) {
        setSelectedStation(playingStation);
        
        // If we're filtering by country, adjust the country filter to include this station
        if (selectedCountry !== 'all' && playingStation.country !== selectedCountry) {
          setSelectedCountry('all');
        }
      }
    }
  }, [currentMedia, allStations]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stationsData, countriesData] = await Promise.all([
        getAllStations(),
        getAvailableCountries()
      ]);
      setAllStations(stationsData);
      setCountries(countriesData);
    } catch (err) {
      setError('Failed to load radio data. Please try refreshing.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayStations = useMemo(() => {
    let filtered = [...allStations];

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(station => station.country === selectedCountry);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'country') {
        const countryCompare = a.country.localeCompare(b.country);
        return countryCompare !== 0 ? countryCompare : a.name.localeCompare(b.name);
      } else if (sortBy === 'genre') {
        const genreCompare = a.genre.localeCompare(b.genre);
        return genreCompare !== 0 ? genreCompare : a.name.localeCompare(b.name);
      }
      return 0;
    });

    return filtered;
  }, [allStations, selectedCountry, sortBy]);

  const getContentTitle = () => {
    if (selectedCountry === 'all') {
      return 'All Radio Stations';
    }
    return countries[selectedCountry] ? `${countries[selectedCountry].flag} ${selectedCountry} Stations` : 'Radio Stations';
  };

  return (
    <div className="space-y-4 container mx-auto px-4 pb-8">
      <div className="sticky top-16 z-5 bg-gray-900/95 backdrop-blur-sm pt-3 pb-3 -mx-4 px-4 shadow-md">
        <div className="flex items-center overflow-x-auto pb-2 hide-scrollbar">
          <span className="mr-3 font-medium text-gray-300 whitespace-nowrap">Country:</span>
          <div className="flex gap-2 flex-nowrap">
            <button
              onClick={() => setSelectedCountry('all')}
              className={`px-3 py-1.5 rounded-lg text-sm flex-shrink-0 ${selectedCountry === 'all' ? 'bg-pink-500 text-white font-medium' : 'bg-gray-800 text-gray-300'} hover:bg-pink-600 transition-colors`}
            >
              🌍 All
            </button>
            {Object.entries(countries).map(([name, data]) => (
              <button
                key={name}
                onClick={() => setSelectedCountry(name)}
                className={`px-3 py-1.5 rounded-lg text-sm flex-shrink-0 ${selectedCountry === name ? 'bg-pink-500 text-white font-medium' : 'bg-gray-800 text-gray-300'} hover:bg-pink-600 transition-colors`}
                title={name}
              >
                {data.flag} {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 mb-6">
        <RadioPlayer station={selectedStation} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold">{getContentTitle()}</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-pink-500 text-gray-300 w-full sm:w-auto"
          >
            <option value="name">Sort by Name</option>
            <option value="country">Sort by Country</option>
            <option value="genre">Sort by Genre</option>
          </select>
          <button
            onClick={fetchData}
            className="flex items-center justify-center text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-2 rounded-lg"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg text-center my-4">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-3 text-sm text-white bg-pink-700 px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && displayStations.length === 0 && (
        <div className="text-center py-10 bg-gray-800 rounded-lg my-4">
          <p className="text-gray-400">No stations found for {selectedCountry === 'all' ? 'your selection' : countries[selectedCountry]?.flag + ' ' + selectedCountry}</p>
          {selectedCountry !== 'all' && (
            <button 
              onClick={() => setSelectedCountry('all')} 
              className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-sm"
            >
              Show All Stations
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-800 animate-pulse p-3 h-28 rounded-lg"></div>
          ))}
        </div>
      ) : displayStations.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {displayStations.map(station => (
            <button
              key={station.id}
              onClick={() => setSelectedStation(station)}
              className={`flex flex-col p-3 rounded-lg ${selectedStation?.id === station.id ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300'} hover:bg-pink-600 transition-colors w-full text-left h-full shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg flex-shrink-0 w-8">{station.countryFlag}</span>
                <img
                  src={station.logo || '/placeholder-radio.svg'}
                  alt={station.name}
                  className="w-12 h-12 rounded object-contain bg-gray-700 flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-radio.svg';
                  }}
                />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-sm truncate leading-tight">{station.name}</h3>
                <p className="text-xs truncate mt-1 opacity-80">
                  {station.genre}
                </p>
              </div>
              {selectedStation?.id === station.id && (
                <div className="mt-2 px-2 py-0.5 bg-pink-600/60 text-white text-xs rounded-sm text-center">
                  Playing
                </div>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default RadioPage;