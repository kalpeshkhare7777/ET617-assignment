import React, { useState } from 'react';
import LoginPage from './loginpage/LoginPage';
import HomePage from './homepage/HomePage';
import GameBoard from './gameboard/Gameboard'
import Dashboard from './dashboard/Dashboard'; // Import the Dashboard
import './memorygame/MemoryGame.css';

export default function App() {
  const [page, setPage] = useState('login'); // 'login', 'home', 'game', 'dashboard'

  const renderContent = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={() => setPage('home')} />;
      case 'home':
        return <HomePage onStartGame={() => setPage('game')} />;
      case 'game':
        return <GameBoard />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <LoginPage onLogin={() => setPage('home')} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Memory Game</h1>
        {/* Show navigation buttons only after login */}
        {page !== 'login' && (
          <nav className="app-nav">
             {/* This button toggles between the dashboard and the home/game screen */}
            <button 
              className="nav-btn" 
              onClick={() => setPage(page === 'dashboard' ? 'home' : 'dashboard')}
            >
              {page === 'dashboard' ? 'Back to Home' : 'View Dashboard'}
            </button>
          </nav>
        )}
      </header>
      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
}
