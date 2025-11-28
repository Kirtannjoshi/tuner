import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Bookmark, Heart, Play } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

const LibraryPage = () => {
    const [activeTab, setActiveTab] = useState('history');
    const { playRadio, playTv, getRecentMedia } = usePlayer();
    const navigate = useNavigate();

    const tabs = [
        { id: 'history', label: 'Watch History', icon: Clock },
        { id: 'saved', label: 'Saved', icon: Bookmark },
        { id: 'favorites', label: 'Favorites', icon: Heart },
    ];

    const handleChannelClick = (channel) => {
        if (channel.type === 'radio') {
            playRadio(channel);
            navigate(`/watch/radio/${channel.id}`);
        } else {
            playTv(channel);
            navigate(`/watch/tv/${channel.id}`);
        }
    };

    const recentMedia = getRecentMedia();

    return (
        <div className="space-y-6 pb-20 lg:pb-8">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-gray-700/30">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Library</h1>
                <p className="text-sm lg:text-base text-gray-400">Your watch history, saved content, and favorites</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-700/30 overflow-x-auto scrollbar-hide pb-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 lg:px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'text-pink-500 border-b-2 border-pink-500'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'history' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            Watch History ({recentMedia.length})
                        </h2>

                        {recentMedia.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {recentMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleChannelClick(item)}
                                        className="group cursor-pointer bg-gray-800/30 hover:bg-gray-700/50 rounded-xl p-3 transition-all"
                                    >
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 mb-3">
                                            <img
                                                src={item.logo || '/placeholder.svg'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.src = '/placeholder.svg'}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play className="w-12 h-12 text-white fill-white" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-white text-sm truncate group-hover:text-pink-400 transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 truncate">{item.genre}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/30">
                                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No Watch History</h3>
                                <p className="text-gray-400 mb-6">
                                    Channels you watch will appear here
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/radio')}
                                        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold transition-colors"
                                    >
                                        Browse Radio
                                    </button>
                                    <button
                                        onClick={() => navigate('/tv')}
                                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
                                    >
                                        Browse TV
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="text-center py-20 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/30">
                        <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Saved Content</h3>
                        <p className="text-gray-400">
                            Save your favorite channels to watch them later
                        </p>
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div className="text-center py-20 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/30">
                        <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Favorites</h3>
                        <p className="text-gray-400">
                            Mark channels as favorites to see them here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryPage;
