import React from 'react';

const PointsTable = ({ teams }) => {
  // Sort teams by points and NRR
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
      <table className="w-full text-sm text-left text-gray-200">
        <thead className="text-xs uppercase bg-gray-700">
          <tr>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3">M</th>
            <th className="px-4 py-3">W</th>
            <th className="px-4 py-3">L</th>
            <th className="px-4 py-3">Pts</th>
            <th className="px-4 py-3">NRR</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team, index) => (
            <tr key={team.name} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
              <td className="px-4 py-3 flex items-center gap-2">
                {team.logo && <img src={team.logo} alt={team.name} className="w-6 h-6" />}
                <span>{team.name}</span>
              </td>
              <td className="px-4 py-3">{team.matchesPlayed}</td>
              <td className="px-4 py-3">{team.matchesWon}</td>
              <td className="px-4 py-3">{team.matchesLost}</td>
              <td className="px-4 py-3 font-semibold">{team.points}</td>
              <td className="px-4 py-3">{team.nrr.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PointsTable;