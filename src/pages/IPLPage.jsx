import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUpcomingMatches, getPastMatches, getLiveMatches, getTeams } from '../services/iplService';
import { PlayerContext } from '../contexts/PlayerContext';
import MatchCard from '../components/ipl/MatchCard';
import PointsTable from '../components/ipl/PointsTable';
import { motion, AnimatePresence } from 'framer-motion';

const IPLPage = () => {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [activeTab, setActiveTab] = useState('live');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [upcomingData, pastData, liveData, teamsData] = await Promise.all([
        getUpcomingMatches(),
        getPastMatches(),
        getLiveMatches(),
        getTeams()
      ]);
      setUpcomingMatches(upcomingData);
      setPastMatches(pastData);
      setLiveMatches(liveData);
      setTeams(teamsData);
    } catch (err) {
      setError('Failed to load IPL data. Please try refreshing.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 container mx-auto px-4 pb-8">
      <nav className="sticky top-16 z-10 bg-gray-900/95 backdrop-blur-sm pt-4 pb-3 -mx-4 px-4 shadow-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'live' ? 'bg-pink-500 text-white scale-105 shadow-lg shadow-pink-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <span className="mr-2 animate-pulse text-red-500">●</span>
              Live Matches
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-pink-500 text-white scale-105 shadow-lg shadow-pink-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <span className="mr-2">🏏</span>
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'results' ? 'bg-pink-500 text-white scale-105 shadow-lg shadow-pink-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <span className="mr-2">📊</span>
              Results
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'points' ? 'bg-pink-500 text-white scale-105 shadow-lg shadow-pink-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <span className="mr-2">🏆</span>
              Points Table
            </button>
          </div>
        </div>
      </nav>

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

      <AnimatePresence mode="wait">
        {activeTab === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-w-6xl mx-auto"
          >
            {liveMatches.length > 0 ? (
              liveMatches.map(match => (
                <MatchCard key={match.matchId} match={match} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No live matches at the moment
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'upcoming' && (
          <motion.div
            key="upcoming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {upcomingMatches.map(match => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {pastMatches.map(match => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </motion.div>
        )}

        {activeTab === 'points' && (
          <motion.div
            key="points"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <PointsTable />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IPLPage;