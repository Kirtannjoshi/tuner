import React, { useEffect, useState } from 'react';
import MatchCard from '../components/IPL/MatchCard';
import PointsTable from '../components/IPL/PointsTable';

const IPLSchedule = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/ipl/schedule');
        if (!response.ok) throw new Error('Failed to fetch matches');
        const data = await response.json();
        setMatches(data);
        
        // Extract unique teams and their stats
        const teamStats = data.reduce((acc, match) => {
          match.teams.forEach(team => {
            if (!acc[team.name]) {
              acc[team.name] = {
                name: team.name,
                logo: team.logo,
                points: team.points || 0,
                matchesPlayed: team.matchesPlayed || 0,
                matchesWon: team.matchesWon || 0,
                matchesLost: team.matchesLost || 0,
                nrr: team.nrr || 0
              };
            }
          });
          return acc;
        }, {});
        
        setTeams(Object.values(teamStats));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 text-xl">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">IPL 2024</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Upcoming Matches</h2>
          <div className="grid gap-4">
            {matches.map((match) => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Points Table</h2>
          <PointsTable teams={teams} />
        </div>
      </div>
    </div>
  );
};

export default IPLSchedule;