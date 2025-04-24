import React from 'react';
import { motion } from 'framer-motion';
import { getTeams } from '../../services/iplService';

const MatchCard = ({ match }) => {
  const teams = getTeams();
  const getTeamInfo = (teamName) => teams[teamName] || { logo: '', color: '#888' };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderTeamSection = (team) => {
    const teamInfo = getTeamInfo(team.name);
    return (
      <div className="flex items-center space-x-2">
        <img 
          src={teamInfo.logo} 
          alt={team.name} 
          className="w-8 h-8 object-contain"
        />
        <div>
          <p className="font-medium">{team.name}</p>
          {team.score !== undefined && (
            <p className="text-sm">
              {team.score}/{team.wickets} ({team.overs} ov)
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            {match.teams.map((team, index) => (
              <React.Fragment key={team.name}>
                {renderTeamSection(team)}
                {index === 0 && <div className="h-2"/>}
              </React.Fragment>
            ))}
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">
              {formatDate(match.date)}
              {match.time && ` • ${match.time}`}
            </span>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-gray-300">{match.venue}</p>
          {match.status === 'completed' && (
            <p className="text-pink-400 mt-1">{match.result}</p>
          )}
          {match.status === 'live' && (
            <p className="text-green-400 mt-1 animate-pulse">🔴 LIVE</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;