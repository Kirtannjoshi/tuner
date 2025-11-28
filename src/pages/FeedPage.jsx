import { useState } from 'react';
import VerticalFeed from '../components/feed/VerticalFeed';

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, tv, radio, music

  return (
    <div className="h-screen bg-black relative">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-center space-x-4 p-4">
          {[
            { id: 'all', label: 'For You' },
            { id: 'tv', label: 'TV' },
            { id: 'radio', label: 'Radio' },
            { id: 'music', label: 'Music' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      <div className="h-full">
        <VerticalFeed />
      </div>
    </div>
  );
};

export default FeedPage;