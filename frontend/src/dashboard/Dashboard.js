import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import './Dashboard.css';

const formatDuration = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return 'N/A';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionLog, setShowActionLog] = useState(false); // State to toggle the raw log

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

  const { summary, recentSessions, actionLog } = analytics;

  return (
    <div className="dashboard-container">
      <h2>Game Analytics Dashboard</h2>
      
      <h3>Overall Performance (All Players)</h3>
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

      <h3>Recent Game Sessions (All Players)</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Outcome</th>
              <th>Moves</th>
            </tr>
          </thead>
          <tbody>
            {recentSessions.map((session) => (
              <tr key={session.sessionId}>
                <td className="user-email">{session.userEmail}</td>
                <td>{new Date(session.startTime).toLocaleString()}</td>
                <td>{formatDuration(session.durationSeconds)}</td>
                <td className={`outcome-${session.outcome.toLowerCase()}`}>{session.outcome}</td>
                <td>{session.totalMoves}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="raw-log-section">
        <h3>Raw Action Log</h3>
        <button className="log-toggle-btn" onClick={() => setShowActionLog(!showActionLog)}>
            {showActionLog ? 'Hide Full Log' : 'Show Full Log (Latest 100)'}
        </button>
        {showActionLog && actionLog && (
             <div className="table-container action-log">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Timestamp</th>
                            <th>Action Type</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actionLog.map((action) => (
                            <tr key={action._id}>
                                <td className="user-email">{action.userEmail}</td>
                                <td>{new Date(action.timestamp).toLocaleTimeString()}</td>
                                <td>{action.type.replace(/_/g, ' ')}</td>
                                <td className="details-cell">
                                  {action.type === 'tile_click' && action.details && action.details.tile
                                    ? `Symbol: ${action.details.tile}, Pos: ${action.details.tileId}`
                                    : JSON.stringify(action.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
