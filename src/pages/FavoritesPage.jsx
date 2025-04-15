import { useState, useEffect } from 'react';
import { RadioIcon, TvIcon } from '@heroicons/react/24/outline';
import RadioPlayer from '../components/radio/RadioPlayer';
import TvPlayer from '../components/tv/TvPlayer';
import { getFavoriteStations, getFavoriteChannels } from '../services/favoritesService';

const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState('radio'); // 'radio' or 'tv'
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [favoriteChannels, setFavoriteChannels] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Refresh favorites when tab changes
  useEffect(() => {
    loadFavorites();
  }, [activeTab]);

  const loadFavorites = () => {
    const stations = getFavoriteStations();
    const channels = getFavoriteChannels();
    
    setFavoriteStations(stations);
    setFavoriteChannels(channels);
    
    // Reset selections
    if (activeTab === 'radio' && stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0]);
    } else if (activeTab === 'tv' && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('radio')}
          className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'radio' ? 'bg-pink-500' : 'bg-gray-800'} hover:bg-pink-600`}
        >
          <RadioIcon className="h-5 w-5 mr-2" />
          Radio Favorites
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'tv' ? 'bg-lime-500' : 'bg-gray-800'} hover:bg-lime-600`}
        >
          <TvIcon className="h-5 w-5 mr-2" />
          TV Favorites
        </button>
      </div>

      {activeTab === 'radio' ? (
        <>
          <RadioPlayer station={selectedStation} />

          <h2 className="text-xl font-semibold mb-4">Your Favorite Radio Stations</h2>

          {favoriteStations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteStations.map(station => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`flex items-center p-4 rounded-lg ${selectedStation?.id === station.id ? 'bg-pink-500' : 'bg-gray-800'} hover:bg-pink-600 transition-colors`}
                >
                  <img
                    src={station.logo || '/placeholder-radio.svg'}
                    alt={station.name}
                    className="w-12 h-12 rounded object-contain bg-gray-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-radio.svg';
                    }}
                  />
                  <div className="ml-4 text-left">
                    <h3 className="font-semibold truncate">{station.name}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {station.genre} • {station.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-800 rounded-lg">
              <p className="text-gray-400">You haven't added any radio stations to your favorites yet.</p>
              <button
                onClick={() => window.location.href = '/radio'}
                className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg"
              >
                Browse Radio Stations
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <TvPlayer channel={selectedChannel} />

          <h2 className="text-xl font-semibold mb-4">Your Favorite TV Channels</h2>

          {favoriteChannels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex items-center p-4 rounded-lg ${selectedChannel?.id === channel.id ? 'bg-lime-500' : 'bg-gray-800'} hover:bg-lime-600 transition-colors`}
                >
                  <img
                    src={channel.logo || '/placeholder-tv.svg'}
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
              <p className="text-gray-400">You haven't added any TV channels to your favorites yet.</p>
              <button
                onClick={() => window.location.href = '/tv'}
                className="mt-4 px-4 py-2 bg-lime-600 hover:bg-lime-700 rounded-lg"
              >
                Browse TV Channels
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage; 