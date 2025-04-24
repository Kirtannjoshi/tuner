import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { getLiveMatches, getUpcomingMatches, getPastMatches, getPointsTable } from '../services/iplService';
import MatchCard from '../components/ipl/MatchCard';
import PointsTable from '../components/ipl/PointsTable';

const SportPage = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sports categories with IPL featured
  const sportsCategories = [
    'all',
    'ipl',
    'cricket',
    'football',
    'basketball',
    'tennis',
    'formula1',
    'baseball',
    'rugby'
  ];

  // IPL specific states
  const [iplData, setIplData] = useState({
    liveMatches: [],
    upcomingMatches: [],
    pastMatches: [],
    pointsTable: []
  });

  // Sample sports data structure
  const [sportsData, setSportsData] = useState({
    liveMatches: [],
    upcomingMatches: [],
    recentResults: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (selectedSport === 'ipl') {
          // Fetch IPL specific data
          const [live, upcoming, past, points] = await Promise.all([
            getLiveMatches(),
            getUpcomingMatches(),
            getPastMatches(),
            getPointsTable()
          ]);
          
          setIplData({
            liveMatches: live,
            upcomingMatches: upcoming,
            pastMatches: past,
            pointsTable: points
          });
        } else {
          // Fetch general sports data
          const mockData = {
            liveMatches: [
              { id: 1, title: 'IND vs AUS', sport: 'cricket', status: 'LIVE', score: '299/5' },
              { id: 2, title: 'Real Madrid vs Barcelona', sport: 'football', status: 'LIVE', score: '2-1' }
            ],
            upcomingMatches: [
              { id: 3, title: 'Lakers vs Warriors', sport: 'basketball', date: '2024-03-25', time: '19:00' },
              { id: 4, title: 'Djokovic vs Nadal', sport: 'tennis', date: '2024-03-26', time: '15:30' }
            ],
            recentResults: [
              { id: 5, title: 'Ferrari vs Mercedes', sport: 'formula1', result: 'Ferrari won by 5.2s' },
              { id: 6, title: 'Yankees vs Red Sox', sport: 'baseball', result: 'Yankees won 6-4' }
            ]
          };
          setSportsData(mockData);
        }
      } catch (err) {
        setError('Failed to load sports data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSport]);

  const handleSportChange = (e) => {
    setSelectedSport(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sports events..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <select
          value={selectedSport}
          onChange={handleSportChange}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500"
        >
          {sportsCategories.map(sport => (
            <option key={sport} value={sport}>
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* IPL Section */}
      {selectedSport === 'ipl' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrophyIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">IPL 2024</h1>
            </div>
            <p className="text-gray-200">Follow all the action from Indian Premier League 2024</p>
          </div>

          {/* Points Table */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Points Table</h2>
            <PointsTable teams={iplData.pointsTable} />
          </section>
        </div>
      )}

      {/* Live Matches Section */}
      <section className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
          Live Matches
        </h2>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(selectedSport === 'ipl' ? iplData.liveMatches : sportsData.liveMatches).map(match => (
              <div key={match.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{match.title}</h3>
                    <p className="text-sm text-gray-400">{match.sport}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-pink-500 font-semibold">{match.score}</span>
                    <p className="text-sm text-gray-400">{match.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Matches Section */}
      <section className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(selectedSport === 'ipl' ? iplData.upcomingMatches : sportsData.upcomingMatches).map(match => (
              <div key={match.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{match.title}</h3>
                    <p className="text-sm text-gray-400">{match.sport}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{match.date}</p>
                    <p className="text-sm text-pink-500">{match.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Results Section */}
      <section className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(selectedSport === 'ipl' ? iplData.pastMatches : sportsData.recentResults).map(match => (
              <div key={match.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{match.title}</h3>
                    <p className="text-sm text-gray-400">{match.sport}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-pink-500">{match.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SportPage;