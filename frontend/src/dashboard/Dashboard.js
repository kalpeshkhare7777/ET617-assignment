import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import './Dashboard.css';

/**
 * Helper function to format seconds into MM:SS format.
 * @param {number} totalSeconds - The duration in seconds.
 * @returns {string} The formatted time string.
 */
const formatDuration = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return 'N/A';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

/**
 * The updated Dashboard component to display advanced game analytics.
 */
export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-container"><h2><span className="loader"></span>Loading Advanced Analytics...</h2></div>;
  }

  if (!analytics || !analytics.summary) {
    return <div className="dashboard-container"><h2>Could not load analytics. Is the backend server running?</h2></div>;
  }

  const { summary, recentSessions } = analytics;

  return (
    <div className="dashboard-container">
      <h2>Game Analytics Dashboard</h2>
      
      {/* Summary Statistics Section */}
      <h3>Overall Performance</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Games Played</h4>
          <p>{summary.totalGames}</p>
        </div>
        <div className="stat-card">
          <h4>Win Rate</h4>
          <p>{summary.winRate.toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <h4>Avg. Duration</h4>
          <p>{formatDuration(summary.avgDuration)}</p>
        </div>
        <div className="stat-card">
          <h4>Avg. Moves</h4>
          <p>{summary.avgMoves.toFixed(1)}</p>
        </div>
      </div>

      {/* Recent Games Log Section */}
      <h3>Recent Game Sessions</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Outcome</th>
              <th>Moves</th>
              <th>Hints</th>
              <th>Undos</th>
            </tr>
          </thead>
          <tbody>
            {recentSessions.map((session) => (
              <tr key={session.sessionId}>
                <td>{new Date(session.startTime).toLocaleString()}</td>
                <td>{formatDuration(session.durationSeconds)}</td>
                <td className={`outcome-${session.outcome.toLowerCase()}`}>{session.outcome}</td>
                <td>{session.totalMoves}</td>
                <td>{session.hintsUsed}</td>
                <td>{session.undosUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
