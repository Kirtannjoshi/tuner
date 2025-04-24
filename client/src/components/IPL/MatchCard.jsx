import React from 'react';

const MatchCard = ({ match }) => {
  const getScoreDisplay = (team, score) => {
    if (!score) return '';
    return `${score.runs}/${score.wickets} (${score.overs})`;
  };

  const getStatusDisplay = () => {
    switch (match.status) {
      case 'live':
        return <span className="bg-red-600 px-3 py-1 rounded-full text-white font-semibold animate-pulse">LIVE</span>;
      case 'completed':
        return <span className="bg-gray-600 px-3 py-1 rounded-full text-white">{match.result}</span>;
      default:
        return <span className="bg-blue-600 px-3 py-1 rounded-full text-white">UPCOMING</span>;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl hover:shadow-2xl transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">
          {new Date(match.date).toLocaleDateString()} - {match.time}
        </div>
        {getStatusDisplay()}
      </div>

      <div className="space-y-4">
        {match.teams.map((team, index) => (
          <div key={team.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {team.logo && (
                <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
              )}
              <span className="text-gray-100 font-medium">{team.name}</span>
            </div>
            {match.status !== 'upcoming' && (
              <div className="text-gray-300">
                {getScoreDisplay(team, match.scores[`team${index + 1}`])}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {match.venue}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;