import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon, TrashIcon, TvIcon, RadioIcon } from '@heroicons/react/24/outline';
import { clearRadioCache } from '../services/radioService';
import { loadIPTVSources, loadCategories } from '../services/csvLoader';

const SettingsPage = () => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [playlistSources, setPlaylistSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      // Load main playlists
      const mainSources = await loadIPTVSources();

      // Load categories
      const cats = await loadCategories();

      // Combine all sources
      const allSources = [
        ...mainSources.map(s => ({
          name: s.name,
          url: s.url,
          count: s.count,
          type: 'main'
        })),
        ...cats.map(c => ({
          name: `📂 ${c.name}`,
          url: c.url,
          count: 'Category',
          type: 'category'
        }))
      ];

      setPlaylistSources(allSources);
      setCategories(cats);

      // Set selected source from localStorage or default to first IPTV Global
      const savedSource = localStorage.getItem('tv_source');
      if (savedSource) {
        const source = allSources.find(s => s.url === savedSource);
        if (source) {
          setSelectedSource(source);
        } else {
          setDefaultSource(allSources);
        }
      } else {
        setDefaultSource(allSources);
      }
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultSource = (sources) => {
    // Set IPTV Global as default
    const iptvGlobal = sources.find(s => s.url === 'https://iptv-org.github.io/iptv/index.m3u');
    if (iptvGlobal) {
      setSelectedSource(iptvGlobal);
      localStorage.setItem('tv_source', iptvGlobal.url);
    } else if (sources.length > 0) {
      setSelectedSource(sources[0]);
      localStorage.setItem('tv_source', sources[0].url);
    }
  };

  const handleSourceChange = (source) => {
    setSelectedSource(source);
    localStorage.setItem('tv_source', source.url);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the cache? This will remove all saved radio station data.')) {
      clearRadioCache();
      alert('Cache cleared successfully!');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
            <Cog6ToothIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-gray-400">Manage your Tuner preferences</p>
          </div>
        </div>
      </div>

      {/* TV Source Settings */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-gray-700/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <TvIcon className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">TV Source</h2>
            <p className="text-sm text-gray-400">Select your preferred IPTV playlist source</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading sources...</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlistSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => handleSourceChange(source)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm flex justify-between items-center transition-all duration-200 ${selectedSource?.url === source.url
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                    }`}
                >
                  <span className="font-medium truncate">{source.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${selectedSource?.url === source.url
                      ? 'bg-white/20'
                      : 'bg-gray-600/50'
                    }`}>
                    {source.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-300">
                💡 <strong>Tip:</strong> Changes will take effect the next time you visit the TV page. {playlistSources.length} sources available.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-gray-700/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <RadioIcon className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Data Management</h2>
            <p className="text-sm text-gray-400">Clear cached data to free up storage</p>
          </div>
        </div>

        <p className="text-gray-300 mb-4 text-sm">
          Clear the local cache to refresh radio station data and free up storage space.
        </p>

        <button
          onClick={handleClearCache}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 rounded-xl transition-all duration-200 font-medium text-sm"
        >
          <TrashIcon className="h-5 w-5" />
          Clear Cache
        </button>
      </div>

      {/* App Info */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-gray-700/30">
        <h2 className="text-lg font-semibold text-white mb-3">About Tuner</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p><span className="text-gray-300 font-medium">Version:</span> 1.0.0</p>
          <p><span className="text-gray-300 font-medium">Platform:</span> Web</p>
          <p className="pt-2 text-xs">
            © 2024 Tuner. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;