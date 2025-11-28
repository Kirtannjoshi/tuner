import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, Volume2, VolumeX, Radio, Search, Heart,
  Globe, Music, Activity, AlertCircle, Menu, User,
  MoreVertical, Cast, MessageSquare, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { getTopStations, searchStations } from '../services/radioService';

// Helper to format numbers like Twitch (1.2k, 10k)
const formatViewers = (num) => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

const DEFAULT_ICON = "https://lucide.dev/icons/radio";

const RadioPage = () => {
  // -- STATE --
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending"); // trending, search

  const { playRadio, currentMedia, isPlaying, setPlayerMode } = usePlayer();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('radio_favs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // -- EFFECTS --

  // Initial Load
  useEffect(() => {
    if (activeTab === 'trending') {
      loadTrending();
    }
  }, [activeTab]);

  // -- ACTIONS --

  const loadTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopStations(40);
      setStations(data);
    } catch (err) {
      setError("Failed to load stations.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setActiveTab('search');
    setLoading(true);
    setError(null);

    try {
      const data = await searchStations(searchQuery);
      setStations(data);
    } catch (err) {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (station) => {
    const exists = favorites.find(f => f.id === station.id);
    let newFavs;
    if (exists) {
      newFavs = favorites.filter(f => f.id !== station.id);
    } else {
      newFavs = [station, ...favorites];
    }
    setFavorites(newFavs);
    localStorage.setItem('radio_favs', JSON.stringify(newFavs));
  };

  const isFav = (id) => favorites.some(f => f.id === id);

  const handleStationClick = (station) => {
    playRadio(station);
    navigate(`/watch/radio/${station.id}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-900/50 backdrop-blur-sm text-gray-100 font-sans overflow-hidden rounded-xl border border-gray-700/30">

      {/* LEFT SIDEBAR */}
      <aside className={`flex-none bg-gray-800/50 flex flex-col border-r border-gray-700/30 transition-all duration-300 ${sidebarOpen ? 'w-[240px]' : 'w-[50px]'}`}>

        {/* Sidebar Header */}
        <div className="h-[40px] flex items-center justify-between px-3 pt-2 mb-2">
          {sidebarOpen && <h2 className="font-bold text-xs uppercase text-gray-100">For You</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-700/50 rounded ml-auto">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Followed Channels (Favorites) */}
          {sidebarOpen && favorites.length > 0 && (
            <div className="mb-4">
              <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase mb-2">Followed Channels</h3>
              {favorites.map(fav => (
                <div key={fav.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700/50 cursor-pointer group" onClick={() => handleStationClick(fav)}>
                  <img src={fav.logo || DEFAULT_ICON} className="w-7 h-7 rounded-full bg-black object-cover" onError={(e) => e.target.src = DEFAULT_ICON} />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-semibold truncate group-hover:text-pink-400">{fav.name}</p>
                    <p className="text-xs text-gray-400 truncate">{fav.genre?.split(',')[0] || 'Music'}</p>
                  </div>
                  {currentMedia?.id === fav.id && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
              ))}
            </div>
          )}

          {/* Recommended Channels (Top Trending) */}
          <div className="mb-4">
            <h3 className={`px-3 text-[11px] font-bold text-gray-400 uppercase mb-2 ${!sidebarOpen && 'hidden'}`}>Recommended Channels</h3>
            {stations.slice(0, 10).map(station => (
              <div key={station.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700/50 cursor-pointer group" onClick={() => handleStationClick(station)}>
                <img
                  src={station.logo || DEFAULT_ICON}
                  className="w-7 h-7 rounded-full bg-black object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = DEFAULT_ICON }}
                />
                {sidebarOpen && (
                  <>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-semibold truncate group-hover:text-pink-400">{station.name}</p>
                      <p className="text-xs text-gray-400 truncate">{station.genre?.split(',')[0] || 'Radio'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentMedia?.id === station.id && <div className="w-2 h-2 rounded-full bg-red-500" />}
                      <span className="text-xs text-gray-300">{formatViewers(station.clickcount)}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-transparent overflow-y-auto custom-scrollbar p-6 md:p-8 relative">

        {/* Search Bar (In-Page) */}
        <div className="mb-6 max-w-md">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search stations..."
                className="w-full bg-gray-800/50 text-gray-100 pl-3 pr-8 py-2 rounded-l-lg border border-gray-700/50 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-gray-800/50 px-4 rounded-r-lg border-y border-r border-gray-700/50 hover:bg-gray-700/50">
              <Search className="w-5 h-5 text-gray-100" />
            </button>
          </form>
        </div>

        {/* Hero / Status Section (If playing) */}
        {currentMedia && currentMedia.type === 'radio' && (
          <div className="mb-8 w-full h-[300px] bg-gray-900 relative group shrink-0 hidden md:block rounded-xl overflow-hidden border border-gray-700/30">
            {/* Blurred Background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
              style={{ backgroundImage: `url(${currentMedia.logo || DEFAULT_ICON})` }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 bg-gradient-to-t from-gray-900 to-transparent">
              <div className="flex items-end gap-6 w-full max-w-4xl">
                <img
                  src={currentMedia.logo || DEFAULT_ICON}
                  className="w-32 h-32 shadow-2xl bg-black object-cover rounded-lg"
                  onError={(e) => { e.target.src = DEFAULT_ICON }}
                />
                <div className="flex-1 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Live</span>
                    <span className="text-pink-400 text-sm font-semibold hover:underline cursor-pointer">{currentMedia.country}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2 hover:text-pink-400 cursor-pointer">{currentMedia.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <User className="w-4 h-4" /> {formatViewers(currentMedia.clickcount || 1200)} viewers
                    </span>
                    <span className="text-gray-400 text-sm">• {currentMedia.codec || 'MP3'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Browse Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-100 hover:text-pink-400 cursor-pointer inline-block">
              {activeTab === 'search' ? `Search Results for "${searchQuery}"` : "Live Channels"}
            </h1>
            {activeTab === 'search' && (
              <button onClick={() => { setActiveTab('trending'); setSearchQuery(''); loadTrending(); }} className="text-xs text-pink-400 hover:underline">
                Back to Trending
              </button>
            )}
          </div>

          {/* Category Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {['All', 'Music', 'News', 'Talk', 'Jazz', 'Pop', 'Classical'].map(tag => (
              <button key={tag} className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 px-3 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap border border-gray-700/30">
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-200">
            <AlertCircle className="w-10 h-10 mb-2 text-red-500" />
            <p>{error}</p>
            <button onClick={loadTrending} className="mt-4 text-pink-400 hover:underline">Retry</button>
          </div>
        )}

        {/* Station Grid (Twitch Style) */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
            {stations.map((station) => (
              <div key={station.id} className="flex flex-col gap-2 group cursor-pointer" onClick={() => handleStationClick(station)}>

                {/* Thumbnail Wrapper */}
                <div className="relative aspect-video bg-gray-800 hover:translate-x-1 hover:-translate-y-1 transition-transform duration-200 rounded-lg overflow-hidden border border-gray-700/30">
                  {/* Image Logic: Radio icons are square, so we make a "thumbnail" */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Blurred BG for fill */}
                    <div
                      className="absolute inset-0 bg-center bg-cover blur-md opacity-50 scale-110"
                      style={{ backgroundImage: `url(${station.logo || DEFAULT_ICON})` }}
                    />
                    {/* Sharp Logo Centered */}
                    <img
                      src={station.logo || DEFAULT_ICON}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2/3 w-auto object-contain shadow-lg"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Live</span>
                  </div>

                  {/* Viewers Overlay (Bottom Left of Thumb) */}
                  <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 rounded text-[11px] text-white">
                    {formatViewers(station.clickcount)} viewers
                  </div>

                  {/* Play Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-12 h-12 fill-white text-white drop-shadow-lg" />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex gap-3">
                  {/* Small Avatar */}
                  <img
                    src={station.logo || DEFAULT_ICON}
                    className="w-10 h-10 rounded-full bg-gray-800 object-cover mt-1 flex-shrink-0"
                    loading="lazy"
                    onError={(e) => e.target.src = DEFAULT_ICON}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-200 truncate leading-tight group-hover:text-pink-400 transition-colors" title={station.name}>
                      {station.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{station.country || "Global"}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {station.genre?.split(',').slice(0, 2).map(tag => tag && (
                        <span key={tag} className="text-[10px] font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 px-1.5 py-0.5 rounded-full transition-colors">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Menu (Context) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(station); }}
                    className="self-start text-gray-400 hover:text-pink-500"
                  >
                    <Heart className={`w-4 h-4 ${isFav(station.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RadioPage;