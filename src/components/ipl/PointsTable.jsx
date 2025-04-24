import { useState, useEffect } from 'react';
import { getPointsTable } from '../../services/iplService';

const PointsTable = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPointsTable();
  }, []);

  const fetchPointsTable = async () => {
    try {
      const data = await getPointsTable();
      setTeams(data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load points table');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
        <button
          onClick={fetchPointsTable}
          className="block mx-auto mt-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-gray-200">
            <th className="px-4 py-3 text-left">Team</th>
            <th className="px-4 py-3 text-center">M</th>
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center">T</th>
            <th className="px-4 py-3 text-center">Points</th>
            <th className="px-4 py-3 text-center">NRR</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.name} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
              <td className="px-4 py-3 flex items-center space-x-3">
                <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                <span className="font-medium text-gray-200">{team.name}</span>
              </td>
              <td className="px-4 py-3 text-center text-gray-300">{team.matches}</td>
              <td className="px-4 py-3 text-center text-gray-300">{team.won}</td>
              <td className="px-4 py-3 text-center text-gray-300">{team.lost}</td>
              <td className="px-4 py-3 text-center text-gray-300">{team.tied}</td>
              <td className="px-4 py-3 text-center font-semibold text-gray-200">{team.points}</td>
              <td className="px-4 py-3 text-center text-gray-300">{team.netRunRate.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PointsTable;