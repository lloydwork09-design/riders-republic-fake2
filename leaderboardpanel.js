import React from 'react';

const LeaderboardPanel = ({ leaderboard }) => {
  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <div className="leaderboard-panel" data-testid="leaderboard-panel">
      <h3 className="leaderboard-title">TOP RIDERS</h3>
      <div className="leaderboard-list">
        {leaderboard.slice(0, 5).map((entry, index) => (
          <div key={index} className="leaderboard-entry" data-testid={`leaderboard-entry-${index}`}>
            <span className="leaderboard-rank">#{index + 1}</span>
            <span className="leaderboard-name">{entry.player_name}</span>
            <span className="leaderboard-score">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPanel;
