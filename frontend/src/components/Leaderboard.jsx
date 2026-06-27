import React from 'react';
import './Leaderboard.css';

export default function Leaderboard({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3 className="league-title">🌱 EVH Green League</h3>
        <p className="time-left">⏱ 2 days left</p>
      </div>

      <div className="leaderboard-list">
        {data.map((user, index) => {
          const rank = index + 1;
          let rankClass = "rank-standard";
          if (rank === 1) rankClass = "rank-gold";
          if (rank === 2) rankClass = "rank-silver";
          if (rank === 3) rankClass = "rank-bronze";

          return (
            <div key={user.id} className={`leaderboard-row ${user.isUser ? 'highlight-user' : ''}`}>
              <div className="rank-container">
                <span className={`rank-badge ${rankClass}`}>{rank}</span>
              </div>
              
              <div className="avatar-container">
                <span className="avatar" role="img" aria-label="avatar">{user.avatar}</span>
              </div>
              
              <div className="name-container">
                <span className="user-name">{user.name}</span>
              </div>
              
              <div className="score-container">
                <span className="user-score">{user.points} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}